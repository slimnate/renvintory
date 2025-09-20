<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	let { inventory, location, counts, totals } = data;
</script>

<div>
	{#if !inventory}
		<h1>Inventory not found</h1>
	{:else if inventory.time_of_day === 'close'}
		<div class="mb-6 flex w-full items-center justify-between gap-4">
			<a href={`/locations/${inventory.location_id}`} class="link text-sm link-hover">← Back</a>
			<h2 class="flex items-end gap-2 text-2xl font-semibold tracking-tight">
				<span class="border-r-1 border-neutral/20 pr-2 text-neutral">{location?.name}</span>
				<span class="text-neutral"
					>{new Date(String(inventory.date)).toLocaleDateString('en-US', {
						weekday: 'short',
						month: 'short',
						day: 'numeric'
					})}</span
				>
				<span class="badge uppercase badge-neutral">{inventory.time_of_day}</span>
			</h2>
		</div>
		<h1>Report - Close</h1>
		<p>Inventory: {inventory?.id}</p>
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
				{#each totals ?? [] as itemTotal}
					<tr>
						<td>{itemTotal.item_name}</td>
						<td>{itemTotal.total}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<div class="mb-6 flex w-full items-center justify-between gap-4">
			<a href={`/locations/${inventory.location_id}`} class="link text-sm link-hover">← Back</a>
			<h2 class="flex items-end gap-2 text-2xl font-semibold tracking-tight">
				<span class="border-r-1 border-neutral/20 pr-2 text-neutral">{location?.name}</span>
				<span class="text-neutral"
					>{new Date(String(inventory.date)).toLocaleDateString('en-US', {
						weekday: 'short',
						month: 'short',
						day: 'numeric'
					})}</span
				>
				<span class="badge uppercase badge-neutral">{inventory.time_of_day}</span>
			</h2>
		</div>
		<h1>Report - Close</h1>
		<p>Inventory: {inventory?.id}</p>
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
				{#each totals ?? [] as itemTotal}
					<tr>
						<td>{itemTotal.item_name}</td>
						<td>{itemTotal.total}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>
