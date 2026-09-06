<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../../../../convex/_generated/api';
	import type { Id } from '../../../../convex/_generated/dataModel';
	import { formatCalendarDate } from '$lib/dates';
	let { params }: { params: { location_id: string; date: string } } = $props();

	const dataQuery = useQuery(api.inventories.getInventoriesByLocationAndDate, {
		locationId: params.location_id as Id<'locations'>,
		date: params.date
	});

	const location = $derived(dataQuery.data?.location ?? null);
	const inventories = $derived(
		dataQuery.data?.inventories ?? { open: null, close: null, spill: null, intake: null }
	);
	const counts = $derived(dataQuery.data?.counts ?? { open: [], close: [], spill: [], intake: [] });

	function groupByItem(
		rows: Array<{
			itemId: Id<'items'>;
			item: { name: string; price: number } | null;
			containerId: Id<'containers'>;
			container: { size: number; type: 'can' | 'bottle' | 'cup' } | null;
			count: number;
		}>
	) {
		const map = new Map<
			string,
			{
				name: string;
				price: number;
				perContainer: Array<{ size: number; count: number }>;
				total: number;
			}
		>();
		for (const r of rows) {
			if (!r.item || !r.container) continue;
			const itemId = r.itemId;
			const current = map.get(itemId) ?? {
				name: r.item.name,
				price: r.item.price,
				perContainer: [],
				total: 0
			};
			const size = r.container.size;
			const count = r.count || 0;
			current.perContainer.push({ size, count });
			current.total += size * count;
			map.set(itemId, current);
		}
		for (const entry of map.values()) {
			entry.perContainer.sort((a, b) => a.size - b.size);
		}
		return Array.from(map.entries()).map(([itemId, data]) => ({
			itemId: itemId as Id<'items'>,
			...data
		}));
	}

	const groupedOpen = $derived(groupByItem(counts.open));
	const groupedClose = $derived(groupByItem(counts.close));
	const groupedSpill = $derived(groupByItem(counts.spill));
	const groupedIntake = $derived(groupByItem(counts.intake));

	const formattedDate = $derived(formatCalendarDate(params.date));

	const pageTitle = $derived(`${location?.name} - ${formattedDate} - Reckonings`);

	function renderInventorySection(
		type: 'open' | 'close' | 'spill' | 'intake',
		inventory: { _id: Id<'inventories'> } | null,
		grouped: Array<{
			itemId: Id<'items'>;
			name: string;
			price: number;
			perContainer: Array<{ size: number; count: number }>;
			total: number;
		}>,
		showReport: boolean
	) {
		const typeLabels = {
			open: 'Open',
			close: 'Close',
			spill: 'Spill',
			intake: 'Intake'
		};

		const reportLabels = {
			open: 'Opening Account',
			close: 'Closing Account',
			spill: 'Spill Account',
			intake: 'Intake Account'
		};

		if (!inventory) return null;

		return {
			type,
			inventory,
			grouped,
			showReport,
			label: typeLabels[type],
			reportLabel: reportLabels[type]
		};
	}
</script>

{#snippet inventorySection(
	section: {
		type: string;
		inventory: { _id: Id<'inventories'> };
		grouped: Array<{
			itemId: Id<'items'>;
			name: string;
			price: number;
			perContainer: Array<{ size: number; count: number }>;
			total: number;
		}>;
		showReport: boolean;
		label: string;
		reportLabel: string;
	},
	showDivider: boolean
)}
	<section class="mb-8">
		<div class="mb-3 flex items-center justify-between gap-4">
			<div class="flex-1 bg-gules px-3 pt-1.5 pb-3.5 text-center shadow-md banner">
				<span class="font-display text-xs font-bold tracking-[0.25em] text-goldleaf uppercase"
					>{section.label}</span
				>
			</div>
			<a class="btn shrink-0 btn-sm btn-primary" href={`/count/${section.inventory._id}`}>Amend</a>
		</div>
		{#if section.grouped.length === 0}
			<div class="mb-4 alert">
				<span>No counts recorded for this reckoning.</span>
			</div>
			<a class="btn btn-sm btn-primary" href={`/count/${section.inventory._id}`}>Begin the Tally</a>
		{:else}
			<div class="overflow-x-auto rounded-sm border-2 border-goldleaf/70 painted shadow-lg carved">
				{#if section.showReport}
					<a href={`/reports/${section.inventory._id}`} class="m-3 inline-block">
						<button class="btn btn-sm btn-primary">{section.reportLabel}</button>
					</a>
				{/if}
				<table class="table font-num">
					<thead class="boardface text-[10px] tracking-wider text-goldleaf uppercase">
						<tr>
							<th>Ware</th>
							<th>Price</th>
							<th>Per vessel</th>
							<th class="text-right">Total</th>
						</tr>
					</thead>
					<tbody>
						{#each section.grouped as row}
							<tr>
								<th class="painted px-3 py-2 text-left font-medium whitespace-nowrap">{row.name}</th
								>
								<td>${row.price}</td>
								<td>
									<div class="flex flex-wrap gap-1.5">
										{#each row.perContainer as pc}
											<span class="shrink-0 whitespace-nowrap rounded-sm border border-oak/25 bg-oak/10 px-2 py-0.5 text-xs"
												>{pc.count}&nbsp;&times;&nbsp;{pc.size}</span
											>
										{/each}
									</div>
								</td>
								<td class="text-right">{row.total}</td>
							</tr>
						{/each}
					</tbody>
				</table>
				{#if section.showReport}
					<a href={`/reports/${section.inventory._id}`} class="m-3 inline-block">
						<button class="btn btn-sm btn-primary">{section.reportLabel}</button>
					</a>
				{/if}
			</div>
		{/if}
	</section>
	{#if showDivider}
		<div class="mb-8 border-t-2 border-goldleaf/40"></div>
	{/if}
{/snippet}

<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

{#if dataQuery.error}
	<div class="mb-6 flex items-center gap-4">
		<a href="/" class="text-xl text-goldleaf">&lsaquo;</a>
		<h2 class="font-display text-2xl font-semibold tracking-tight text-cream">
			{dataQuery.error instanceof Error ? dataQuery.error.message : String(dataQuery.error)}
		</h2>
	</div>
{:else if !location}
	<div class="mb-6 flex items-center gap-4">
		<a href="/" class="text-xl text-goldleaf">&lsaquo;</a>
		<h2 class="font-display text-xl font-semibold text-cream">No such house.</h2>
	</div>
{:else}
	<header
		class="-mx-4 mb-4 flex items-center gap-3 boardface px-4 py-3 carved sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
	>
		<a href={`/locations/${params.location_id}`} class="text-xl text-goldleaf">&lsaquo;</a>
		<div>
			<div class="gilt font-display text-xl leading-none font-bold">{location.name}</div>
			<div class="mt-1 font-num text-xs text-cream/60">{formattedDate}</div>
		</div>
	</header>

	{#if inventories.open}
		{@const section = renderInventorySection('open', inventories.open, groupedOpen, true)}
		{#if section}
			{@render inventorySection(
				section,
				!!(inventories.close || inventories.spill || inventories.intake)
			)}
		{/if}
	{/if}

	{#if inventories.close}
		{@const section = renderInventorySection('close', inventories.close, groupedClose, true)}
		{#if section}
			{@render inventorySection(section, !!(inventories.spill || inventories.intake))}
		{/if}
	{/if}

	{#if inventories.spill}
		{@const section = renderInventorySection('spill', inventories.spill, groupedSpill, false)}
		{#if section}
			{@render inventorySection(section, !!inventories.intake)}
		{/if}
	{/if}

	{#if inventories.intake}
		{@const section = renderInventorySection('intake', inventories.intake, groupedIntake, false)}
		{#if section}
			{@render inventorySection(section, false)}
		{/if}
	{/if}
{/if}
