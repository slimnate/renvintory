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

	let closingTotals = [];
</script>

<div>
	{#if reportData.error}
		<h1>Error loading report: {reportData.error}</h1>
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
		<p>Inventory: {inventory?._id}</p>
		<p>Location: {location?.name}</p>
		<p>Counts: {counts?.length}</p>
		<table class="table">
			<thead>
				<tr>
					<th>Item</th>
					<th>Total</th>
				</tr>
			</thead>
			<tbody>
				{#each totals as itemTotal}
					<tr>
						<td>{itemTotal.item_name}</td>
						<td>{itemTotal.total}</td>
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
					<th>Total</th>
				</tr>
			</thead>
			<tbody>
				{#each totals as itemTotal}
					<tr>
						<td>{itemTotal.item_name}</td>
						<td>{itemTotal.total}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>
