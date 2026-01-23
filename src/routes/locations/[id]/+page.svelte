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
	const allItemsQuery = useQuery(api.items.getAllItems);

	const form = $derived(page.form);
	const location = $derived(locationQuery.data);
	const inventories = $derived(inventoriesQuery.data ?? []);
	const items = $derived(itemsQuery.data ?? []);
	const allItems = $derived(allItemsQuery.data ?? []);

	let showAddModal = $state(false);
	let selectedItemId = $state<string | null>(null);

	// Filter out items that are already in the location
	const availableItems = $derived(
		allItems.filter(item => !items.some(locationItem => locationItem._id === item._id))
	);
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
			{#if form?.op === 'removeItem'}
				<div class="mb-3 alert alert-success">
					<span>Item removed successfully.</span>
				</div>
			{/if}
			{#if form?.op === 'addItem'}
				<div class="mb-3 alert alert-success">
					<span>Item added successfully.</span>
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
							<form method="POST" action="?/deleteInventory" use:enhance={({ cancel}) => {
                                if(!confirm('Are you sure you want to delete this inventory?')) {
                                    cancel();
                                }
                            }}>
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
		{#if items.length === 0 && availableItems.length === 0}
			<div class="alert">
				<span>No items configured for this location.</span>
			</div>
		{:else}
			<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each items as item}
					<li class="card border bg-base-100 shadow-sm">
						<div class="card-body flex flex-row items-center justify-between gap-4">
							<span class="card-title text-base">{item.name}</span>
							<div class="flex items-center gap-2">
								<span class="badge badge-neutral">${item.price}</span>
								<form method="POST" action="?/removeItem" use:enhance={({ cancel }) => {
									if (!confirm(`Are you sure you want to remove ${item.name} from this location?`)) {
										cancel();
									}
								}}>
									<input type="hidden" name="itemId" value={item._id} />
									<button type="submit" class="btn btn-sm btn-error btn-circle" aria-label={`Remove ${item.name} from location`}>
										<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								</form>
							</div>
						</div>
					</li>
				{/each}
				{#if availableItems.length > 0}
					<li class="card border border-dashed bg-base-100 shadow-sm">
						<button 
							type="button" 
							class="card-body flex flex-row items-center justify-center gap-4 min-h-[80px] hover:bg-base-200 transition-colors"
							onclick={() => showAddModal = true}
						>
							<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
							</svg>
							<span class="text-base font-medium">Add item</span>
						</button>
					</li>
				{/if}
			</ul>
		{/if}
	</section>

	{#if showAddModal}
		<div class="modal modal-open">
			<div class="modal-box">
				<h3 class="font-bold text-lg mb-4">Add item to location</h3>
				{#if availableItems.length === 0}
					<p class="text-gray-600">All available items have been added to this location.</p>
				{:else}
					<form method="POST" action="?/addItem" use:enhance={() => {
						showAddModal = false;
						selectedItemId = null;
					}}>
						<div class="form-control mb-4">
							<label for="item-select" class="label">
								<span class="label-text">Select an item</span>
							</label>
							<select 
								id="item-select"
								name="itemId" 
								class="select select-bordered w-full"
								bind:value={selectedItemId}
								required
							>
								<option value="">Choose an item...</option>
								{#each availableItems as item}
									<option value={item._id}>{item.name} - ${item.price}</option>
								{/each}
							</select>
						</div>
						<div class="modal-action">
							<button type="button" class="btn" onclick={() => {
								showAddModal = false;
								selectedItemId = null;
							}}>Cancel</button>
							<button type="submit" class="btn btn-primary" disabled={!selectedItemId}>Add</button>
						</div>
					</form>
				{/if}
			</div>
			<form method="dialog">
				<button class="modal-backdrop" onclick={() => {
					showAddModal = false;
					selectedItemId = null;
				}}>close</button>
			</form>
		</div>
	{/if}
{/if}
