<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { useQuery } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api';
	import type { Id } from '../../../convex/_generated/dataModel';
	let { params }: { params: { id: string } } = $props();

	const locationQuery = useQuery(api.locations.getLocationById, { id: params.id as Id<"locations"> });
	const inventoriesQuery = useQuery(api.inventories.getInventoriesByLocationId, { locationId: params.id as Id<"locations"> });
	const itemsQuery = useQuery(api.items.getItemsByLocationId, { locationId: params.id as Id<"locations"> });

	const form = $derived(page.form);
	const location = $derived(locationQuery.data);
	const inventories = $derived(inventoriesQuery.data ?? []);
	const items = $derived(itemsQuery.data ?? []);
</script>

<svelte:head>
    <title>{location?.name} - Renvintory</title>
</svelte:head>

{#if locationQuery.error || inventoriesQuery.error || itemsQuery.error}
	<div class="mb-6 flex items-center gap-4">
		<a href="/" class="link text-sm link-hover">← Back</a>
		<h2 class="text-2xl font-semibold tracking-tight">{locationQuery.error || inventoriesQuery.error || itemsQuery.error}</h2>
	</div>
{:else}
	<div class="mb-6 flex items-center gap-4">
		<a href="/" class="link text-sm link-hover">← Back</a>
		<h2 class="text-2xl font-semibold tracking-tight">{location?.name}</h2>
	</div>

	<section class="mb-8">
		<div class="mb-3 flex items-center justify-between gap-4">
			<h3 class="text-lg font-medium">Inventories</h3>
			<form method="POST" action="?/createInventory" use:enhance>
				<button type="submit" class="btn btn-sm btn-primary">New inventory</button>
			</form>
		</div>
		{#if form?.success}
			{#if form?.op === 'createInventory'}
				<div class="mb-3 alert alert-success">
					<span>Inventory created successfully.</span>
				</div>
			{/if}
			{#if form?.op === 'deleteInventory'}
				<div class="mb-3 alert alert-success">
					<span>Inventory deleted successfully.</span>
				</div>
			{/if}
		{:else if form?.error}
			<div class="mb-3 alert alert-error">
				<span>{form.error}</span>
			</div>
		{/if}
		{#if inventories.length === 0}
			<p class="text-gray-600">No inventories yet.</p>
		{:else}
			<ul class="w-full rounded-box border bg-base-100 shadow-sm">
				{#each inventories as inv}
					<li class="flex flex-row items-center justify-between gap-4 p-2 px-4">
						<span>
							<span class="font-medium">{inv.date}</span>
							{#if inv.inventoryType}
								<span class="ml-2 opacity-70">{inv.inventoryType}</span>
							{/if}
						</span>
						<div class="flex gap-2">
							<a class="" href={`/inventories/${inv._id}`}>
								<span class="btn btn-outline">View</span>
							</a>
                            <a class="" href={`/reports/${inv._id}`}>
                                <span class="btn btn-primary">Report</span>
                            </a>
							<form method="POST" action="?/deleteInventory" use:enhance>
								<input type="hidden" name="id" value={inv._id} />
								<button type="submit" class="btn btn-error">Delete</button>
							</form>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<section>
		<h3 class="mb-3 text-lg font-medium">Available items</h3>
		{#if items.length === 0}
			<div class="alert">
				<span>No items configured for this location.</span>
			</div>
		{:else}
			<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each items as item}
					<li class="card border bg-base-100 shadow-sm">
						<div class="card-body flex flex-row items-center justify-between gap-4">
							<span class="card-title text-base">{item.name}</span>
							<span class="badge badge-neutral">${item.price}</span>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
{/if}
