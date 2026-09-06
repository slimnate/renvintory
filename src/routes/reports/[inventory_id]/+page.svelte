<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api';
	import type { Id } from '../../../convex/_generated/dataModel';
	import { axisLockScroll } from '$lib/actions/axisLockScroll';
	import { formatCalendarDate } from '$lib/dates';
	let { params }: { params: { inventory_id: string } } = $props();

	const reportData = useQuery(api.inventories.getReportData, {
		inventoryId: params.inventory_id as Id<'inventories'>
	});

	const inventory = $derived(reportData.data?.inventory ?? null);
	const location = $derived(reportData.data?.location ?? null);
	const totals = $derived(reportData.data?.totals ?? []);
	const closeReport = $derived(reportData.data?.closeReport ?? null);

	const formattedDate = $derived(inventory ? formatCalendarDate(String(inventory.date)) : '');

	const typeLabel = $derived(
		inventory?.inventoryType === 'close'
			? 'Closing'
			: inventory?.inventoryType === 'spill'
				? 'Spill'
				: inventory?.inventoryType === 'intake'
					? 'Intake'
					: 'Opening'
	);

	const pageTitle = $derived(`${location?.name} - ${inventory?.date} - ${typeLabel} Account`);
</script>

<svelte:head>
	<title>{pageTitle} - Renvintory</title>
</svelte:head>

{#snippet reportHeader()}
	<header
		class="-mx-4 mb-4 flex items-center justify-between gap-3 boardface px-4 py-3 carved sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
	>
		<div class="flex min-w-0 items-center gap-3">
			<a href={`/locations/${inventory!.locationId}`} class="text-xl text-goldleaf">&lsaquo;</a>
			<div class="min-w-0">
				<div class="truncate gilt font-display text-xl leading-none font-bold">
					{location?.name}
				</div>
				<div class="mt-1 font-num text-xs text-cream/60">{formattedDate}</div>
			</div>
		</div>
		<span
			class="shrink-0 rounded-sm leaf px-2 py-0.5 font-num text-[10px] font-bold tracking-widest text-board uppercase"
		>
			{inventory!.inventoryType}
		</span>
	</header>
	<div class="mb-3 bg-gules px-3 pt-1.5 pb-3.5 text-center shadow-md banner">
		<span class="font-display text-xs font-bold tracking-[0.25em] text-goldleaf uppercase"
			>The Day's Reckoning</span
		>
	</div>
	<p class="mb-3 text-center font-num text-[10px] tracking-wider text-cream/50 uppercase">
		{formattedDate}
	</p>
{/snippet}

{#snippet simpleTable()}
	<p class="mb-2 text-xs text-cream/70 italic">Swipe the board sideways for all columns.</p>
	<div
		class="-mx-4 max-h-[70vh] overflow-auto rounded-sm border-2 border-goldleaf/70 painted shadow-lg carved sm:-mx-6 lg:-mx-8"
		use:axisLockScroll
	>
		<table class="report-board table-pin-rows table font-num">
			<thead class="boardface text-[10px] tracking-wider text-goldleaf uppercase">
				<tr>
					<th class="pin-ware boardface sticky top-0 z-30">Ware</th>
					<th class="boardface sticky top-0 z-20">Price</th>
					<th class="boardface sticky top-0 z-20">Per vessel</th>
					<th class="boardface sticky top-0 z-20 text-right">Total</th>
				</tr>
			</thead>
			<tbody>
				{#each totals as itemTotal}
					<tr>
						<th class="pin-ware painted z-10 text-left font-medium whitespace-nowrap"
							>{itemTotal.item_name}</th
						>
						<td class="whitespace-nowrap">${itemTotal.price.toFixed(0)}</td>
						<td>
							<div class="flex flex-wrap gap-0.5">
								{#each itemTotal.perContainer as pc}
									<span
										class="shrink-0 whitespace-nowrap rounded-sm border border-oak/25 bg-oak/10 px-1 text-[10px] leading-4"
										>{pc.count}&times;{pc.size}</span
									>
								{/each}
							</div>
						</td>
						<td class="text-right whitespace-nowrap">{itemTotal.total}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/snippet}

<div>
	{#if reportData.error}
		<h1 class="font-display text-cream">
			The tally could not be read: {reportData.error instanceof Error
				? reportData.error.message
				: String(reportData.error)}
		</h1>
	{:else if reportData.isLoading}
		<div class="py-8 text-center text-cream/60">Loading…</div>
	{:else if !inventory}
		<h1 class="font-display text-cream">No such reckoning.</h1>
	{:else if inventory.inventoryType === 'close'}
		{@render reportHeader()}
		{#if closeReport}
			<div class="mb-4 flex justify-center gap-4">
				<div
					class="flex h-28 w-24 flex-col items-center justify-start bg-vert pt-4 text-cream ring-1 ring-goldleaf/70 shield"
				>
					<span class="font-display text-[9px] font-bold tracking-widest uppercase">Sales</span>
					<span class="font-num text-2xl font-bold"
						>${closeReport.totals.totalSales.toFixed(0)}</span
					>
				</div>
				<div
					class="flex h-28 w-24 flex-col items-center justify-start bg-gules pt-4 text-cream ring-1 ring-goldleaf/70 shield"
				>
					<span class="font-display text-[9px] font-bold tracking-widest uppercase">Spilt</span>
					<span class="font-num text-2xl font-bold"
						>${closeReport.totals.totalSpillage.toFixed(0)}</span
					>
				</div>
			</div>
			<p class="mb-2 text-xs text-cream/70 italic">Swipe the board sideways for all columns.</p>
			<div
				class="-mx-4 max-h-[70vh] overflow-auto rounded-t-sm border-2 border-b-0 border-goldleaf/70 painted shadow-lg carved sm:-mx-6 lg:-mx-8"
				use:axisLockScroll
			>
				<table class="report-board table-pin-rows table font-num">
					<thead class="boardface text-[10px] tracking-wider text-goldleaf uppercase">
						<tr>
							<th class="pin-ware boardface sticky top-0 z-30">Ware</th>
							<th class="boardface sticky top-0 z-20">Price</th>
							<th class="boardface sticky top-0 z-20 text-right">Open</th>
							<th class="boardface sticky top-0 z-20 text-right">Close</th>
							<th class="boardface sticky top-0 z-20 text-right">Spill</th>
							<th class="boardface sticky top-0 z-20 text-right">Intake</th>
							<th class="boardface sticky top-0 z-20 text-right">Total</th>
							<th class="boardface sticky top-0 z-20 text-right">Used</th>
							<th class="boardface sticky top-0 z-20 text-right">Sold</th>
							<th class="boardface sticky top-0 z-20 text-right">Spilt $</th>
							<th class="boardface sticky top-0 z-20 text-right">Sales</th>
						</tr>
					</thead>
					<tbody>
						{#each closeReport.rows as row}
							<tr>
								<th class="pin-ware painted z-10 text-left font-medium whitespace-nowrap"
									>{row.name}</th
								>
								<td>${row.price.toFixed(0)}</td>
								<td class="text-right">{row.openCount}</td>
								<td class="text-right">{row.closeCount}</td>
								<td class="text-right">{row.spillCount}</td>
								<td class="text-right">{row.intakeCount}</td>
								<td class="text-right">{row.openPlusIntakeCount}</td>
								<td class="text-right">{row.totalUsed}</td>
								<td class="text-right">{row.soldCount}</td>
								<td class="text-right">${row.spilledValue.toFixed(0)}</td>
								<td class="text-right">${row.sales.toFixed(0)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<div
				class="boardface carved -mx-4 flex items-center justify-between gap-4 rounded-b-sm border-2 border-goldleaf/70 px-3 py-2 sm:-mx-6 lg:-mx-8"
			>
				<div class="flex flex-col">
					<span class="font-display text-[10px] tracking-widest text-goldleaf uppercase"
						>Sum</span
					>
					<span class="font-num text-lg font-bold text-cream"
						>${closeReport.totals.totalSales.toFixed(0)}</span
					>
				</div>
				<div class="flex flex-col text-right">
					<span class="font-display text-[10px] tracking-widest text-goldleaf uppercase"
						>Spilt</span
					>
					<span class="font-num text-lg font-bold text-cream"
						>${closeReport.totals.totalSpillage.toFixed(0)}</span
					>
				</div>
			</div>
		{:else}
			<p class="text-cream/70">No reckoning was recorded for this day.</p>
		{/if}
	{:else if inventory.inventoryType === 'spill'}
		{@render reportHeader()}
		{@render simpleTable()}
	{:else if inventory.inventoryType === 'intake'}
		{@render reportHeader()}
		{@render simpleTable()}
	{:else}
		{@render reportHeader()}
		{@render simpleTable()}
	{/if}
</div>
