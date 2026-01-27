<script lang="ts">
	import { enhance } from '$app/forms';
	import { useQuery } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api';
	import type { Id } from '../../../convex/_generated/dataModel';
	import { toast } from '$lib/stores/toast';
	let { params }: { params: { id: string } } = $props();

	const locationQuery = useQuery(api.locations.getLocationById, { id: params.id as Id<"locations"> });
	const inventoriesQuery = useQuery(api.inventories.getInventoriesByLocationId, { locationId: params.id as Id<"locations"> });
	const itemsQuery = useQuery(api.items.getItemsByLocationId, { locationId: params.id as Id<"locations"> });
	const allItemsQuery = useQuery(api.items.getAllItems);

const location = $derived(locationQuery.data);
const items = $derived(itemsQuery.data ?? []);
const allItems = $derived(allItemsQuery.data ?? []);

let showAddModal = $state(false);
let selectedItemId = $state<string | null>(null);
let editMode = $state(false);
let showDeleteDayModal = $state(false);
let dayToDelete = $state<string | null>(null);
let pendingDeleteDate: string | null = null;
let showRemoveItemModal = $state(false);
let itemToRemove = $state<{ _id: Id<'items'>; name: string } | null>(null);
let pendingRemoveItemId: Id<'items'> | null = null;

	// Inventory type definition
	type Inventory = {
		_id: Id<'inventories'>;
		locationId: Id<'locations'>;
		date: string;
		inventoryType: 'open' | 'close' | 'spill' | 'intake';
		createdAt: string;
	};

	const inventories = $derived(inventoriesQuery.data ?? []) as Inventory[];

	// Filter out items that are already in the location
	const availableItems = $derived(
		allItems.filter(item => !items.some(locationItem => locationItem._id === item._id))
	);

	// Format date to human-readable format (e.g., "Sat - 1/23/26")
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		const dayAbbr = date.toLocaleDateString('en-US', { weekday: 'short' });
		const month = date.getMonth() + 1;
		const day = date.getDate();
		const year = date.getFullYear().toString().slice(-2);
		return `${dayAbbr} - ${month}/${day}/${year}`;
	}

// Group inventories by date
const inventoriesByDate = $derived.by(() => {
	if (!inventories || inventories.length === 0) {
		return [];
	}
	const grouped = new Map<string, Inventory[]>();
	for (const inv of inventories) {
		const date = inv.date;
		if (!grouped.has(date)) {
			grouped.set(date, []);
		}
		grouped.get(date)!.push(inv);
	}
	// Sort dates descending (most recent first) and convert to array
	return Array.from(grouped.entries()).sort((a, b) => b[0].localeCompare(a[0]));
});

function handleDeleteDayClick(date: string) {
	dayToDelete = date;
	pendingDeleteDate = date;
	showDeleteDayModal = true;
}

function cancelDeleteDay() {
	showDeleteDayModal = false;
	dayToDelete = null;
	pendingDeleteDate = null;
}

function confirmDeleteDay() {
	if (pendingDeleteDate) {
		const form = document.querySelector(`form[data-delete-date="${pendingDeleteDate}"]`) as HTMLFormElement | null;
		if (form) {
			form.requestSubmit();
		}
	}
	cancelDeleteDay();
}

function handleRemoveItemClick(item: { _id: Id<'items'>; name: string }) {
	itemToRemove = item;
	pendingRemoveItemId = item._id;
	showRemoveItemModal = true;
}

function cancelRemoveItem() {
	showRemoveItemModal = false;
	itemToRemove = null;
	pendingRemoveItemId = null;
}

function confirmRemoveItem() {
	if (pendingRemoveItemId) {
		const form = document.querySelector(`form[data-remove-item-id="${pendingRemoveItemId}"]`) as HTMLFormElement | null;
		if (form) {
			form.requestSubmit();
		}
	}
	cancelRemoveItem();
}
</script>

<svelte:head>
    <title>{location?.name} - Renvintory</title>
</svelte:head>

{#if locationQuery.error || inventoriesQuery.error || itemsQuery.error}
	<div class="mb-6 flex items-center gap-4">
		<a href="/" class="link text-sm link-hover">← Back</a>
		<h2 class="text-2xl font-semibold tracking-tight">
			{locationQuery.error 
				? (locationQuery.error instanceof Error ? locationQuery.error.message : String(locationQuery.error))
				: inventoriesQuery.error
					? (inventoriesQuery.error instanceof Error ? inventoriesQuery.error.message : String(inventoriesQuery.error))
					: itemsQuery.error
						? (itemsQuery.error instanceof Error ? itemsQuery.error.message : String(itemsQuery.error))
						: 'Unknown error'}
		</h2>
	</div>
{:else}
	<div class="mb-6 flex items-center gap-4">
		<a href="/" class="link text-sm link-hover">← Back</a>
		<h2 class="text-2xl font-semibold tracking-tight">{location?.name}</h2>
	</div>

	<section class="mb-8">
		<div class="mb-3 flex items-center justify-between gap-4">
			<h3 class="text-lg font-medium">Inventories</h3>
			<form method="POST" action="?/createInventory" use:enhance={() => {
				return ({ result, update }) => {
					update();
					if (result.type === 'success') {
						const data = result.data as { success?: boolean; error?: string } | undefined;
						if (data?.success) {
							toast.success('Inventory created successfully.');
						} else if (data?.error) {
							toast.error(data.error);
						}
					} else if (result.type === 'failure') {
						const data = result.data as { error?: string } | undefined;
						const error = data?.error || 'Failed to create inventory';
						toast.error(error);
					}
				};
			}}>
				<button type="submit" class="btn btn-sm btn-primary">New inventory</button>
			</form>
		</div>
		{#if inventories.length === 0}
			<p class="text-gray-600">No inventories yet.</p>
		{:else}
			<ul class="w-full rounded-box border bg-base-100 shadow-sm">
				{#each inventoriesByDate as [date, dateInventories]}
					{@const openInv = dateInventories.find(inv => inv.inventoryType === 'open')}
					{@const closeInv = dateInventories.find(inv => inv.inventoryType === 'close')}
					{@const spillInv = dateInventories.find(inv => inv.inventoryType === 'spill')}
					{@const intakeInv = dateInventories.find(inv => inv.inventoryType === 'intake')}
					<li class="flex flex-row items-center justify-between gap-4 p-2 px-4">
						<span class="font-medium">{formatDate(date)}</span>
						<div class="flex gap-3 items-center flex-wrap">
							<div class="join">
								{#if openInv}
									<a href={`/count/${openInv._id}`} class="btn btn-sm btn-outline join-item">Open</a>
								{/if}
								{#if closeInv}
									<a href={`/count/${closeInv._id}`} class="btn btn-sm btn-outline join-item">Close</a>
								{/if}
								{#if spillInv}
									<a href={`/count/${spillInv._id}`} class="btn btn-sm btn-outline join-item">Spill</a>
								{/if}
								{#if intakeInv}
									<a href={`/count/${intakeInv._id}`} class="btn btn-sm btn-outline join-item">Intake</a>
								{/if}
							</div>
							<div class="join">
								{#if openInv}
									<a href={`/reports/${openInv._id}`} class="btn btn-sm btn-primary btn-outline join-item">
										Opening Report
									</a>
								{/if}
								{#if closeInv}
									<a href={`/reports/${closeInv._id}`} class="btn btn-sm btn-primary btn-outline join-item">
										Closing Report
									</a>
								{/if}
							</div>
							<a href={`/inventories/${params.id}/${date}`} class="btn btn-sm btn-outline">Details</a>
							<form
								method="POST"
								action="?/deleteInventory"
								data-delete-date={date}
								use:enhance={() => {
									return ({ result, update }) => {
										update();
										if (result.type === 'success') {
											const data = result.data as { success?: boolean; error?: string } | undefined;
											if (data?.success) {
												toast.success('All inventories for the day deleted successfully.');
											} else if (data?.error) {
												toast.error(data.error);
											}
										} else if (result.type === 'failure') {
											const data = result.data as { error?: string } | undefined;
											const error = data?.error || 'Failed to delete inventories';
											toast.error(error);
										}
									};
								}}
							>
								<input type="hidden" name="date" value={date} />
								<button
									type="button"
									class="btn btn-sm btn-error"
									onclick={() => handleDeleteDayClick(date)}
								>
									Delete
								</button>
							</form>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<section>
		<div class="mb-3 flex items-center justify-between gap-4">
			<h3 class="text-lg font-medium">Available items</h3>
			<button type="button" class="btn btn-sm btn-primary" onclick={() => editMode = !editMode}>
				{editMode ? 'Done' : 'Manage items'}
			</button>
		</div>
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
								{#if editMode}
									<form
										method="POST"
										action="?/removeItem"
										data-remove-item-id={item._id}
										use:enhance={() => {
											return ({ result, update }) => {
												update();
												if (result.type === 'success') {
													const data = result.data as { success?: boolean; error?: string } | undefined;
													if (data?.success) {
														toast.success('Item removed successfully.');
													} else if (data?.error) {
														toast.error(data.error);
													}
												} else if (result.type === 'failure') {
													const data = result.data as { error?: string } | undefined;
													const error = data?.error || 'Failed to remove item';
													toast.error(error);
												}
											};
										}}
										class="flex-shrink-0"
									>
										<input type="hidden" name="itemId" value={item._id} />
										<button
											type="button"
											class="btn btn-sm btn-error btn-circle w-6 h-6 min-h-0 p-0"
											aria-label={`Remove ${item.name} from location`}
											onclick={() => handleRemoveItemClick(item)}
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-4 w-4"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M6 18L18 6M6 6l12 12"
												/>
											</svg>
										</button>
									</form>
								{/if}
							</div>
						</div>
					</li>
				{/each}
				{#if editMode && availableItems.length > 0}
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
						return ({ result, update }) => {
							update();
							if (result.type === 'success') {
								const data = result.data as { success?: boolean; error?: string } | undefined;
								if (data?.success) {
									toast.success('Item added successfully.');
									showAddModal = false;
									selectedItemId = null;
								} else if (data?.error) {
									toast.error(data.error);
								}
							} else if (result.type === 'failure') {
								const data = result.data as { error?: string } | undefined;
								const error = data?.error || 'Failed to add item';
								toast.error(error);
							}
						};
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
	{#if showDeleteDayModal && dayToDelete}
		<div class="modal modal-open">
			<div class="modal-box">
				<h3 class="font-bold text-lg mb-4">Delete inventories</h3>
				<p class="mb-4">
					Are you sure you want to delete <strong>all inventories</strong> for{' '}
					<strong>{formatDate(dayToDelete)}</strong>?
				</p>
				<p class="text-sm text-neutral/70 mb-4">
					This action cannot be undone and will remove all counts for this date at this location.
				</p>
				<div class="modal-action">
					<button type="button" class="btn" onclick={cancelDeleteDay}>Cancel</button>
					<button type="button" class="btn btn-error" onclick={confirmDeleteDay}>Delete</button>
				</div>
			</div>
			<form method="dialog">
				<button class="modal-backdrop" onclick={cancelDeleteDay}></button>
			</form>
		</div>
	{/if}
	{#if showRemoveItemModal && itemToRemove}
		<div class="modal modal-open">
			<div class="modal-box">
				<h3 class="font-bold text-lg mb-4">Remove item from location</h3>
				<p class="mb-4">
					Are you sure you want to remove <strong>{itemToRemove.name}</strong> from this location?
				</p>
				<p class="text-sm text-neutral/70 mb-4">
					This will not delete the item itself, only its association with this location.
				</p>
				<div class="modal-action">
					<button type="button" class="btn" onclick={cancelRemoveItem}>Cancel</button>
					<button type="button" class="btn btn-error" onclick={confirmRemoveItem}>Remove</button>
				</div>
			</div>
			<form method="dialog">
				<button class="modal-backdrop" onclick={cancelRemoveItem}></button>
			</form>
		</div>
	{/if}
{/if}
