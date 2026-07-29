<script lang="ts">
	import { enhance } from '$app/forms';
	import { useQuery } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api';
	import type { Id } from '../../../convex/_generated/dataModel';
	import { toast } from '$lib/stores/toast';
	let { params }: { params: { inventory_id: string } } = $props();

	const countPageDataQuery = useQuery(api.inventories.getCountPageData, {
		inventoryId: params.inventory_id as Id<'inventories'>
	});

	const inventory = $derived(countPageDataQuery.data?.inventory);
	const location = $derived(countPageDataQuery.data?.location);
	const items = $derived(countPageDataQuery.data?.items ?? []);
	const counts = $derived(countPageDataQuery.data?.counts ?? []);

	function totalFor(itemId: Id<'items'>) {
		const itemCounts = counts.filter((c) => c.itemId === itemId);
		const item = items.find((i) => i._id === itemId);
		if (!item) return 0;

		const res = itemCounts.reduce((acc, count) => {
			const container = item.containers.find((c) => c._id === count.containerId);
			if (!container) return acc;
			return acc + count.count * container.size;
		}, 0);
		return res;
	}

	function countFor(containerId: Id<'containers'>, itemId: Id<'items'>) {
		const row = counts.find((c) => c.containerId === containerId && c.itemId === itemId);
		return row?.count ?? 0;
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
					{new Date(String(inventory.date)).toLocaleDateString('en-US', {
						weekday: 'short',
						month: 'short',
						day: 'numeric'
					})}
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
							<form
								method="POST"
								action="?/increment"
								class="w-full"
								use:enhance={() => {
									return ({ result, update }) => {
										update();
										if (result.type === 'success') {
											const data = result.data as
												| { success?: boolean; error?: string }
												| undefined;
											if (data?.error) {
												toast.error(data.error);
											}
										} else if (result.type === 'failure') {
											const data = result.data as { error?: string } | undefined;
											const error = data?.error || 'The tally could not be marked.';
											toast.error(error);
										}
									};
								}}
							>
								<input type="hidden" name="item_id" value={item._id} />
								<input type="hidden" name="container_id" value={container._id} />
								<div class="grid grid-cols-[56px_1fr_56px] gap-2">
									<button
										name="op"
										value="dec"
										type="submit"
										class="h-12 rounded-sm border-2 border-oak/45 bg-white/60 text-xl font-semibold"
										>&minus;</button
									>
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
										name="op"
										value="inc"
										type="submit"
										class="h-12 rounded-sm border-2 border-goldleaf/80 leaf text-xl font-bold text-board"
										>+</button
									>
								</div>
							</form>
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
