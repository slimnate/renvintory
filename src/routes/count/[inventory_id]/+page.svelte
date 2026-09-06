<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import { browser } from '$app/environment';
	import { onDestroy } from 'svelte';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api';
	import type { Id } from '../../../convex/_generated/dataModel';
	import { toast } from '$lib/stores/toast';
	import { formatCalendarDate } from '$lib/dates';
	import { getErrorMessage } from '$lib/convexError';

	const FLUSH_IDLE_MS = 1000;

	let { params }: { params: { inventory_id: string } } = $props();
	const convex = useConvexClient();

	const countPageDataQuery = useQuery(api.inventories.getCountPageData, {
		inventoryId: params.inventory_id as Id<'inventories'>
	});

	const inventory = $derived(countPageDataQuery.data?.inventory);
	const location = $derived(countPageDataQuery.data?.location);
	const items = $derived(countPageDataQuery.data?.items ?? []);
	const counts = $derived(countPageDataQuery.data?.counts ?? []);

	let pendingCounts = $state<Record<string, number>>({});
	let lastFlushedCounts = $state<Record<string, number>>({});
	let flushTimer: ReturnType<typeof setTimeout> | null = null;
	let flushPromise: Promise<void> | null = null;
	let inFlightSent: Record<string, number> | null = null;

	function countKey(itemId: Id<'items'>, containerId: Id<'containers'>) {
		return `${itemId}:${containerId}`;
	}

	function parseCountKey(key: string): { itemId: Id<'items'>; containerId: Id<'containers'> } {
		const separator = key.lastIndexOf(':');
		return {
			itemId: key.slice(0, separator) as Id<'items'>,
			containerId: key.slice(separator + 1) as Id<'containers'>
		};
	}

	function serverCountFor(containerId: Id<'containers'>, itemId: Id<'items'>) {
		const row = counts.find((c) => c.containerId === containerId && c.itemId === itemId);
		return row?.count ?? 0;
	}

	function countFor(containerId: Id<'containers'>, itemId: Id<'items'>) {
		const pending = pendingCounts[countKey(itemId, containerId)];
		if (pending !== undefined) return pending;
		return serverCountFor(containerId, itemId);
	}

	function totalFor(itemId: Id<'items'>) {
		const item = items.find((i) => i._id === itemId);
		if (!item) return 0;

		return item.containers.reduce((acc, container) => {
			return acc + countFor(container._id, itemId) * container.size;
		}, 0);
	}

	function containersFor(itemId: Id<'items'>) {
		const item = items.find((i) => i._id === itemId);
		return item?.containers ?? [];
	}

	function packLabel(
		containerType: 'can' | 'bottle' | 'cup',
		containerSize: number,
		containerCount: number
	): string {
		if (containerSize === 1) {
			return containerCount === 1 ? containerType : `${containerType}s`;
		}
		return containerCount === 1 ? containerType : `${containerType}s`;
	}

	function pendingUpdates() {
		return Object.entries(pendingCounts)
			.filter(([key, count]) => lastFlushedCounts[key] !== count)
			.map(([key, count]) => {
				const { itemId, containerId } = parseCountKey(key);
				return { itemId, containerId, count };
			});
	}

	function previousCountFor(itemId: Id<'items'>, containerId: Id<'containers'>) {
		const flushed = lastFlushedCounts[countKey(itemId, containerId)];
		if (flushed !== undefined) return flushed;
		return serverCountFor(containerId, itemId);
	}

	function containerFor(itemId: Id<'items'>, containerId: Id<'containers'>) {
		const item = items.find((entry) => entry._id === itemId);
		return item?.containers.find((container) => container._id === containerId);
	}

	function revertFailedFlush(sent: Record<string, number>, baselines: Record<string, number>) {
		const nextPending = { ...pendingCounts };

		for (const [key, sentCount] of Object.entries(sent)) {
			const extra = (nextPending[key] ?? sentCount) - sentCount;
			const restored = Math.max(0, (baselines[key] ?? 0) + extra);
			const { itemId, containerId } = parseCountKey(key);
			const serverCount = serverCountFor(containerId, itemId);

			if (restored === serverCount) {
				delete nextPending[key];
			} else {
				nextPending[key] = restored;
			}
		}

		pendingCounts = nextPending;
	}

	function toastFlushedCounts(
		updates: Array<{ itemId: Id<'items'>; containerId: Id<'containers'>; count: number }>,
		baselines: Record<string, number>
	) {
		for (const update of updates) {
			const previous = baselines[countKey(update.itemId, update.containerId)] ?? 0;
			const delta = update.count - previous;
			if (delta === 0) continue;

			const item = items.find((entry) => entry._id === update.itemId);
			const container = containerFor(update.itemId, update.containerId);
			const signed = delta > 0 ? `+${delta}` : `${delta}`;
			const pack =
				container != null
					? ` × ${container.size} ${packLabel(container.type, container.size, Math.abs(delta))}`
					: '';
			const message = item?.name ? `${signed} ${item.name}${pack}` : `${signed}${pack}`;

			if (delta > 0) {
				toast.success(message);
			} else {
				toast.info(message);
			}
		}
	}

	function clearFlushTimer() {
		if (flushTimer !== null) {
			clearTimeout(flushTimer);
			flushTimer = null;
		}
	}

	function scheduleFlush() {
		clearFlushTimer();
		flushTimer = setTimeout(() => {
			flushTimer = null;
			void flushPending().catch(() => {
				// Toast already shown by flushPending.
			});
		}, FLUSH_IDLE_MS);
	}

	async function flushPending() {
		if (flushPromise) {
			await flushPromise;
			if (pendingUpdates().length > 0) {
				await flushPending();
			}
			return;
		}

		const updates = pendingUpdates();
		if (updates.length === 0) return;

		const sent = Object.fromEntries(
			updates.map((update) => [countKey(update.itemId, update.containerId), update.count])
		);
		const baselines = Object.fromEntries(
			updates.map((update) => [
				countKey(update.itemId, update.containerId),
				previousCountFor(update.itemId, update.containerId)
			])
		);
		inFlightSent = sent;

		flushPromise = (async () => {
			try {
				await convex.mutation(api.inventories.setCounts, {
					inventoryId: params.inventory_id as Id<'inventories'>,
					updates
				});
				lastFlushedCounts = { ...lastFlushedCounts, ...sent };
				toastFlushedCounts(updates, baselines);
			} catch (error) {
				revertFailedFlush(sent, baselines);
				toast.error(getErrorMessage(error, 'The tally could not be marked.'));
				throw error;
			} finally {
				inFlightSent = null;
				flushPromise = null;
			}
		})();

		await flushPromise;

		if (pendingUpdates().length > 0) {
			scheduleFlush();
		}
	}

	function adjustCount(itemId: Id<'items'>, containerId: Id<'containers'>, delta: number) {
		const key = countKey(itemId, containerId);
		const next = Math.max(0, countFor(containerId, itemId) + delta);
		const serverCount = serverCountFor(containerId, itemId);
		const canDropPending =
			next === serverCount &&
			inFlightSent?.[key] === undefined &&
			lastFlushedCounts[key] === undefined;

		if (canDropPending) {
			const { [key]: _removed, ...rest } = pendingCounts;
			pendingCounts = rest;
		} else {
			pendingCounts = { ...pendingCounts, [key]: next };
		}

		scheduleFlush();
	}

	$effect(() => {
		const nextPending = { ...pendingCounts };
		const nextFlushed = { ...lastFlushedCounts };
		let pendingChanged = false;
		let flushedChanged = false;

		for (const [key, pendingCount] of Object.entries(nextPending)) {
			const { itemId, containerId } = parseCountKey(key);
			const serverCount = serverCountFor(containerId, itemId);
			if (pendingCount === serverCount && nextFlushed[key] === pendingCount) {
				delete nextPending[key];
				delete nextFlushed[key];
				pendingChanged = true;
				flushedChanged = true;
			}
		}

		if (pendingChanged) pendingCounts = nextPending;
		if (flushedChanged) lastFlushedCounts = nextFlushed;
	});

	beforeNavigate(async () => {
		clearFlushTimer();
		try {
			await flushPending();
		} catch {
			// Keep optimistic counts; the toast from flushPending already reported the error.
		}
	});

	function flushOnHide() {
		if (document.visibilityState !== 'hidden') return;
		clearFlushTimer();
		void flushPending().catch(() => {
			// Toast already shown by flushPending.
		});
	}

	onDestroy(() => {
		clearFlushTimer();
		if (!browser) return;
		void flushPending().catch(() => {
			// Toast already shown by flushPending.
		});
	});

	const countedItems = $derived(items.filter((item) => totalFor(item._id) > 0).length);
	const totalUnits = $derived(items.reduce((acc, item) => acc + totalFor(item._id), 0));

	let expandedIds = $state(new Set<string>());

	function isExpanded(itemId: string) {
		return expandedIds.has(itemId);
	}

	function toggleItem(itemId: string) {
		const next = new Set(expandedIds);
		if (next.has(itemId)) {
			next.delete(itemId);
		} else {
			next.add(itemId);
		}
		expandedIds = next;
	}

	const typeLabel = $derived(
		inventory?.inventoryType === 'close'
			? 'Closing'
			: inventory?.inventoryType === 'spill'
				? 'Spill'
				: inventory?.inventoryType === 'intake'
					? 'Intake'
					: 'Opening'
	);

	const pageTitle = $derived(`${location?.name} - ${inventory?.date} - ${typeLabel} Tally`);
</script>

<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

<svelte:document onvisibilitychange={flushOnHide} />

{#if countPageDataQuery.error}
	<div class="mb-6 flex items-center gap-4">
		<a href="/" class="text-xl text-goldleaf">&lsaquo;</a>
		<h2 class="font-display text-2xl font-semibold tracking-tight text-cream">
			{countPageDataQuery.error instanceof Error
				? countPageDataQuery.error.message
				: String(countPageDataQuery.error)}
		</h2>
	</div>
{:else if countPageDataQuery.isLoading}
	<div class="py-8 text-center text-cream/60">Loading…</div>
{:else if !inventory}
	<div class="mb-6 flex items-center gap-4">
		<a href="/" class="text-xl text-goldleaf">&lsaquo;</a>
		<h2 class="font-display text-xl font-semibold text-cream">No such reckoning.</h2>
	</div>
{:else}
	<header
		class="-mx-4 mb-4 flex items-center justify-between gap-3 boardface px-4 py-3 carved sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
	>
		<div class="flex min-w-0 items-center gap-3">
			<a href={`/locations/${inventory.locationId}`} class="text-xl text-goldleaf">&lsaquo;</a>
			<div class="min-w-0">
				<div class="truncate gilt font-display text-xl leading-none font-bold">
					{location?.name}
				</div>
				<div class="mt-1 font-num text-xs text-cream/60">
					{formatCalendarDate(String(inventory.date))}
				</div>
			</div>
		</div>
		<span
			class="shrink-0 rounded-sm leaf px-2 py-0.5 font-num text-[10px] font-bold tracking-widest text-board uppercase"
		>
			{inventory.inventoryType}
		</span>
	</header>

	<ul class="mb-24 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
		{#each items as item (item._id)}
			{@const open = isExpanded(item._id)}
			<li class="overflow-hidden rounded-sm border-2 border-goldleaf/70 painted shadow-lg carved">
				<button
					type="button"
					class="flex w-full items-center gap-2 bg-oak/12 px-3 py-2 text-left {open
						? 'border-b-2 border-oak/25'
						: ''}"
					aria-expanded={open}
					onclick={() => toggleItem(item._id)}
				>
					<span
						class="inline-block shrink-0 text-xl leading-none text-gules transition-transform duration-150"
						style:transform={open ? 'rotate(90deg)' : 'none'}
						aria-hidden="true">&rsaquo;</span
					>
					<span class="min-w-0 flex-1 font-display font-bold">{item.name}</span>
					<span
						class="flex h-10 w-9 shrink-0 items-start justify-center bg-azure pt-1.5 text-cream ring-1 ring-goldleaf/60 shield"
					>
						<span class="font-num text-sm font-bold">{totalFor(item._id)}</span>
					</span>
				</button>
				{#if open}
					<div class="space-y-2 p-2">
						{#each containersFor(item._id) as container}
							<div class="w-full">
								<div class="grid grid-cols-[56px_1fr_56px] gap-2">
									<button
										type="button"
										class="h-12 rounded-sm border-2 border-oak/45 bg-white/60 text-xl font-semibold"
										onclick={() => adjustCount(item._id, container._id, -1)}
									>
										&minus;
									</button>
									<div class="flex h-12 items-center justify-center gap-2 rounded-sm bg-white/45">
										<span class="font-num text-xl font-bold"
											>{countFor(container._id, item._id)}</span
										>
										<span class="text-sm text-muted italic"
											>&times; {container.size}
											{packLabel(
												container.type,
												container.size,
												countFor(container._id, item._id)
											)}</span
										>
									</div>
									<button
										type="button"
										class="h-12 rounded-sm border-2 border-goldleaf/80 leaf text-xl font-bold text-board"
										onclick={() => adjustCount(item._id, container._id, 1)}
									>
										+
									</button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</li>
		{/each}
	</ul>

	<div
		class="fixed inset-x-0 bottom-0 z-30 border-t-2 border-goldleaf/60 boardface p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
	>
		<div class="flex items-center gap-3">
			<div class="font-num text-xs text-cream/60">
				<div>{countedItems} of {items.length} wares tallied</div>
				<div class="text-base font-bold text-cream">{totalUnits} units</div>
			</div>
		</div>
	</div>
{/if}
