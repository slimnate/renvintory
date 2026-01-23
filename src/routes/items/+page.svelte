<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { useQuery } from 'convex-svelte';
	import { api } from '../../convex/_generated/api';
	import type { Id } from '../../convex/_generated/dataModel';

	const itemsQuery = useQuery(api.items.getAllItems);
	const form = $derived(page.form);
	const items = $derived(itemsQuery.data ?? []);

	let editingItemId = $state<Id<"items"> | null>(null);
	let editName = $state('');
	let editPrice = $state('');

	function startEdit(item: { _id: Id<"items">; name: string; price: number }) {
		editingItemId = item._id;
		editName = item.name;
		editPrice = item.price.toString();
	}

	function cancelEdit() {
		editingItemId = null;
		editName = '';
		editPrice = '';
	}
</script>

<svelte:head>
	<title>Manage Items - Renvintory</title>
</svelte:head>

<div class="mb-6 flex items-center gap-4">
	<a href="/" class="link text-sm link-hover">← Back</a>
	<h1 class="text-2xl font-semibold tracking-tight">Manage Items</h1>
</div>

{#if itemsQuery.error}
	<div class="mb-4 alert alert-error">
		<span>{itemsQuery.error}</span>
	</div>
{:else}
	{#if form?.success}
		{#if form?.op === 'createItem'}
			<div class="mb-3 alert alert-success">
				<span>Item created successfully.</span>
			</div>
		{/if}
		{#if form?.op === 'updateItem'}
			<div class="mb-3 alert alert-success">
				<span>Item updated successfully.</span>
			</div>
			{@const _ = cancelEdit()}
		{/if}
		{#if form?.op === 'deleteItem'}
			<div class="mb-3 alert alert-success">
				<span>Item deleted successfully.</span>
			</div>
		{/if}
	{:else if form?.error}
		<div class="mb-3 alert alert-error">
			<span>{form.error}</span>
		</div>
	{/if}

	<section class="mb-8">
		<div class="border rounded-box bg-base-100 p-4">
			<h2 class="mb-3 text-lg font-medium flex items-center gap-2">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				Add New Item
			</h2>
			<form method="POST" action="?/createItem" use:enhance={() => {
				// Reset form on success
			}}>
				<div class="flex gap-2">
					<input
						type="text"
						name="name"
						placeholder="Item name"
						class="input input-bordered flex-1"
						required
					/>
					<input
						type="number"
						name="price"
						placeholder="Price"
						step="0.01"
						min="0"
						class="input input-bordered w-32"
						required
					/>
					<button type="submit" class="btn btn-primary">Add Item</button>
				</div>
			</form>
		</div>
	</section>

	<section>
		<h2 class="mb-3 text-lg font-medium">All Items</h2>
		{#if items.length === 0}
			<div class="alert">
				<span>No items yet. Add your first item above.</span>
			</div>
		{:else}
			<ul class="w-full rounded-box border bg-base-100 shadow-sm">
				{#each items as item}
					<li class="grid grid-cols-[1fr_auto_auto] items-center gap-4 p-4 border-b last:border-b-0">
						{#if editingItemId === item._id}
							<form 
								method="POST" 
								action="?/updateItem" 
								use:enhance={() => {
									cancelEdit();
								}}
								class="col-span-3 grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center"
							>
								<input type="hidden" name="itemId" value={item._id} />
								<input
									type="text"
									name="name"
									bind:value={editName}
									class="input input-bordered"
									required
								/>
								<input
									type="number"
									name="price"
									bind:value={editPrice}
									step="0.01"
									min="0"
									class="input input-bordered w-32"
									required
								/>
								<button type="submit" class="btn btn-sm btn-primary">Save</button>
								<button 
									type="button" 
									class="btn btn-sm btn-ghost"
									onclick={cancelEdit}
								>
									Cancel
								</button>
							</form>
						{:else}
							<span class="font-medium">{item.name}</span>
							<span class="badge badge-neutral text-right justify-end">${item.price}</span>
							<div class="flex gap-2">
								<button 
									type="button"
									class="btn btn-sm btn-outline"
									onclick={() => startEdit(item)}
								>
									Edit
								</button>
								<form 
									method="POST" 
									action="?/deleteItem" 
									use:enhance={({ cancel }) => {
										if (!confirm(`Are you sure you want to delete ${item.name}?`)) {
											cancel();
										}
									}}
								>
									<input type="hidden" name="itemId" value={item._id} />
									<button type="submit" class="btn btn-sm btn-error">Delete</button>
								</form>
							</div>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</section>
{/if}
