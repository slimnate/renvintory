<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api';
	import type { Id } from '../../../convex/_generated/dataModel';
	let { params }: { params: { inventory_id: string } } = $props();

	const reportData = useQuery(api.inventories.getReportData, { 
		inventoryId: params.inventory_id as Id<"inventories"> 
	});

	const inventory = $derived(reportData.data?.inventory ?? null);
	const location = $derived(reportData.data?.location ?? null);
	const counts = $derived(reportData.data?.counts ?? []);
	const totals = $derived(reportData.data?.totals ?? []);
	const closeReport = $derived(reportData.data?.closeReport ?? null);
    const pageTitle = $derived(`${location?.name} - ${inventory?.date} - ${inventory?.inventoryType === 'close' ? 'Closing' : inventory?.inventoryType === 'spill' ? 'Spill' : inventory?.inventoryType === 'intake' ? 'Intake' : 'Opening'} Report`);
</script>

<svelte:head>
    <title>{pageTitle} - Renvintory</title>
</svelte:head>

<div>
	{#if reportData.error}
		<h1>Error loading report: {reportData.error instanceof Error ? reportData.error.message : String(reportData.error)}</h1>
	{:else if !inventory}
		<h1>Inventory not found</h1>
	{:else if inventory.inventoryType === 'close'}
		<div class="mb-6 flex w-full items-center justify-between gap-4">
			<a href={`/locations/${inventory.locationId}`} class="link text-sm link-hover">← Back</a>
			<h2 class="flex items-end gap-2 text-2xl font-semibold tracking-tight">
				<span class="border-r-1 border-neutral/20 pr-2 text-neutral">{location?.name}</span>
				<span class="text-neutral"
					>{new Date(String(inventory.date)).toLocaleDateString('en-US', {
						weekday: 'short',
						month: 'short',
						day: 'numeric'
					})}</span
				>
				<span class="badge uppercase badge-neutral">{inventory.inventoryType}</span>
			</h2>
		</div>
		<h1>Report - Close</h1>
		{#if closeReport}
			<div class="overflow-x-auto">
				<table class="table">
					<thead>
						<tr>
							<th>Item</th>
							<th>Price</th>
							<th class="text-right">Open</th>
							<th class="text-right">Close</th>
							<th class="text-right">Spill</th>
							<th class="text-right">Intake</th>
							<th class="text-right">Open + Intake</th>
							<th class="text-right">Total Used</th>
							<th class="text-right">Spilled Value</th>
							<th class="text-right">Sales</th>
						</tr>
					</thead>
					<tbody>
						{#each closeReport.rows as row}
							<tr>
								<td>{row.name}</td>
								<td>${row.price.toFixed(2)}</td>
								<td class="text-right">{row.openCount}</td>
								<td class="text-right">{row.closeCount}</td>
								<td class="text-right">{row.spillCount}</td>
								<td class="text-right">{row.intakeCount}</td>
								<td class="text-right">{row.openPlusIntakeCount}</td>
								<td class="text-right">{row.totalUsed}</td>
								<td class="text-right">${row.spilledValue.toFixed(2)}</td>
								<td class="text-right">${row.sales.toFixed(2)}</td>
							</tr>
						{/each}
					</tbody>
					<tfoot>
						<tr>
							<th colspan="9" class="text-right">Total sales for the location for that day:</th>
							<th class="text-right">${closeReport.totals.totalSales.toFixed(2)}</th>
						</tr>
						<tr>
							<th colspan="9" class="text-right">Total spillage for that day:</th>
							<th class="text-right">${closeReport.totals.totalSpillage.toFixed(2)}</th>
						</tr>
					</tfoot>
				</table>
			</div>
		{:else}
			<p>No close report data available.</p>
		{/if}
	{:else if inventory.inventoryType === 'spill'}
		<div class="mb-6 flex w-full items-center justify-between gap-4">
			<a href={`/locations/${inventory.locationId}`} class="link text-sm link-hover">← Back</a>
			<h2 class="flex items-end gap-2 text-2xl font-semibold tracking-tight">
				<span class="border-r-1 border-neutral/20 pr-2 text-neutral">{location?.name}</span>
				<span class="text-neutral"
					>{new Date(String(inventory.date)).toLocaleDateString('en-US', {
						weekday: 'short',
						month: 'short',
						day: 'numeric'
					})}</span
				>
				<span class="badge uppercase badge-neutral">{inventory.inventoryType}</span>
			</h2>
		</div>
		<h1>Report - Spill</h1>
		<p>Inventory: {inventory?._id}</p>
		<p>Location: {location?.name}</p>
		<p>Counts: {counts?.length}</p>
		<table class="table">
			<thead>
				<tr>
					<th>Item</th>
					<th>Price</th>
					<th>Per container</th>
					<th class="text-right">Total</th>
				</tr>
			</thead>
			<tbody>
				{#each totals as itemTotal}
					<tr>
						<td>{itemTotal.item_name}</td>
						<td>${itemTotal.price}</td>
						<td>
							<div class="flex flex-wrap gap-2">
								{#each itemTotal.perContainer as pc}
									<span class="badge badge-ghost">{pc.count} x {pc.size}</span>
								{/each}
							</div>
						</td>
						<td class="text-right">{itemTotal.total}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{:else if inventory.inventoryType === 'intake'}
		<div class="mb-6 flex w-full items-center justify-between gap-4">
			<a href={`/locations/${inventory.locationId}`} class="link text-sm link-hover">← Back</a>
			<h2 class="flex items-end gap-2 text-2xl font-semibold tracking-tight">
				<span class="border-r-1 border-neutral/20 pr-2 text-neutral">{location?.name}</span>
				<span class="text-neutral"
					>{new Date(String(inventory.date)).toLocaleDateString('en-US', {
						weekday: 'short',
						month: 'short',
						day: 'numeric'
					})}</span
				>
				<span class="badge uppercase badge-neutral">{inventory.inventoryType}</span>
			</h2>
		</div>
		<h1>Report - Intake</h1>
		<p>Inventory: {inventory?._id}</p>
		<p>Location: {location?.name}</p>
		<p>Counts: {counts?.length}</p>
		<table class="table">
			<thead>
				<tr>
					<th>Item</th>
					<th>Price</th>
					<th>Per container</th>
					<th class="text-right">Total</th>
				</tr>
			</thead>
			<tbody>
				{#each totals as itemTotal}
					<tr>
						<td>{itemTotal.item_name}</td>
						<td>${itemTotal.price}</td>
						<td>
							<div class="flex flex-wrap gap-2">
								{#each itemTotal.perContainer as pc}
									<span class="badge badge-ghost">{pc.count} x {pc.size}</span>
								{/each}
							</div>
						</td>
						<td class="text-right">{itemTotal.total}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<div class="mb-6 flex w-full items-center justify-between gap-4">
			<a href={`/locations/${inventory.locationId}`} class="link text-sm link-hover">← Back</a>
			<h2 class="flex items-end gap-2 text-2xl font-semibold tracking-tight">
				<span class="border-r-1 border-neutral/20 pr-2 text-neutral">{location?.name}</span>
				<span class="text-neutral"
					>{new Date(String(inventory.date)).toLocaleDateString('en-US', {
						weekday: 'short',
						month: 'short',
						day: 'numeric'
					})}</span
				>
				<span class="badge uppercase badge-neutral">{inventory.inventoryType}</span>
			</h2>
		</div>
		<h1>Report - Open</h1>
		<p>Inventory: {inventory?._id}</p>
		<p>Location: {location?.name}</p>
		<p>Counts: {counts?.length}</p>
		<table class="table">
			<thead>
				<tr>
					<th>Item</th>
					<th>Price</th>
					<th>Per container</th>
					<th class="text-right">Total</th>
				</tr>
			</thead>
			<tbody>
				{#each totals as itemTotal}
					<tr>
						<td>{itemTotal.item_name}</td>
						<td>${itemTotal.price}</td>
						<td>
							<div class="flex flex-wrap gap-2">
								{#each itemTotal.perContainer as pc}
									<span class="badge badge-ghost">{pc.count} x {pc.size}</span>
								{/each}
							</div>
						</td>
						<td class="text-right">{itemTotal.total}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>
