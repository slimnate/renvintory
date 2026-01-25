<script lang="ts">
	import { enhance } from '$app/forms';
	import { useQuery } from 'convex-svelte';
	import { api } from '../../convex/_generated/api';
	import type { Id } from '../../convex/_generated/dataModel';
	import { toast } from '$lib/stores/toast';

	const itemsQuery = useQuery(api.items.getAllItems);
	const items = $derived(itemsQuery.data ?? []);

	const containersQuery = useQuery(api.items.getAllContainers);
	const containers = $derived(containersQuery.data ?? []);

	// Group containers by type
	const containersByType = $derived(() => {
		const grouped: Record<'can' | 'bottle' | 'cup', typeof containers> = {
			can: [],
			bottle: [],
			cup: []
		};
		for (const container of containers) {
			grouped[container.type].push(container);
		}
		return grouped;
	});

	let editingItemId = $state<Id<"items"> | null>(null);
	let editName = $state('');
	let editPrice = $state('');
	let editSelectedContainers = $state<Set<Id<"containers">>>(new Set());

	// Create form state
	let createSelectedContainers = $state<Set<Id<"containers">>>(new Set());
	let createContainerTypeFilter = $state<'can' | 'bottle' | 'cup'>('can');
	let createNewContainerSize = $state('');
	let createNewContainerType = $state<'can' | 'bottle' | 'cup'>('can');
	let isCreatingContainer = $state(false);

	// Edit form state
	let editContainerTypeFilter = $state<'can' | 'bottle' | 'cup'>('can');
	let editNewContainerSize = $state('');
	let editNewContainerType = $state<'can' | 'bottle' | 'cup'>('can');
	let isEditingContainer = $state(false);

	// Filtered containers for create form
	const createFilteredContainers = $derived(() => {
		return containersByType()[createContainerTypeFilter];
	});

	// Filtered containers for edit form
	const editFilteredContainers = $derived(() => {
		return containersByType()[editContainerTypeFilter];
	});

	// Validation: check if size already exists for create form
	const createSizeExists = $derived.by(() => {
		if (!createNewContainerSize) return false;
		const size = parseFloat(createNewContainerSize);
		if (isNaN(size)) return false;
		return createFilteredContainers().some(c => c.size === size);
	});

	// Validation: check if size already exists for edit form
	const editSizeExists = $derived.by(() => {
		if (!editNewContainerSize) return false;
		const size = parseFloat(editNewContainerSize);
		if (isNaN(size)) return false;
		return editFilteredContainers().some(c => c.size === size);
	});

	// Auto-sync container type when filter changes
	$effect(() => {
		if (createContainerTypeFilter) {
			createNewContainerType = createContainerTypeFilter;
		}
	});

	$effect(() => {
		if (editContainerTypeFilter) {
			editNewContainerType = editContainerTypeFilter;
		}
	});

	function startEdit(item: { _id: Id<"items">; name: string; price: number; containers: Id<"containers">[] }) {
		editingItemId = item._id;
		editName = item.name;
		editPrice = item.price.toString();
		editSelectedContainers = new Set(item.containers);
	}

	function cancelEdit() {
		editingItemId = null;
		editName = '';
		editPrice = '';
		editSelectedContainers = new Set();
		editContainerTypeFilter = 'can';
		editNewContainerSize = '';
		editNewContainerType = 'can';
		isEditingContainer = false;
	}

	function toggleContainer(containerId: Id<"containers">, isEdit: boolean) {
		if (isEdit) {
			if (editSelectedContainers.has(containerId)) {
				editSelectedContainers.delete(containerId);
			} else {
				editSelectedContainers.add(containerId);
			}
			editSelectedContainers = new Set(editSelectedContainers);
		} else {
			if (createSelectedContainers.has(containerId)) {
				createSelectedContainers.delete(containerId);
			} else {
				createSelectedContainers.add(containerId);
			}
			createSelectedContainers = new Set(createSelectedContainers);
		}
	}

	function formatContainerLabel(container: { size: number; type: 'can' | 'bottle' | 'cup' }): string {
		return `${container.size} ${container.type}${container.size !== 1 ? 's' : ''}`;
	}

	function resetCreateForm() {
		createSelectedContainers = new Set();
		createContainerTypeFilter = 'can';
		createNewContainerSize = '';
		createNewContainerType = 'can';
		isCreatingContainer = false;
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
		<span>{itemsQuery.error instanceof Error ? itemsQuery.error.message : String(itemsQuery.error)}</span>
	</div>
{:else}

	<section class="mb-8">
		<div class="border rounded-box bg-base-100 p-4">
			<h2 class="mb-3 text-lg font-medium flex items-center gap-2">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				Add New Item
			</h2>
			<form method="POST" action="?/createItem" use:enhance={() => {
				return ({ result, update }) => {
					update();
					if (result.type === 'success') {
						const data = result.data as { success?: boolean; error?: string } | undefined;
						if (data?.success) {
							toast.success('Item created successfully.');
							resetCreateForm();
						} else if (data?.error) {
							toast.error(data.error);
						}
					} else if (result.type === 'failure') {
						const data = result.data as { error?: string } | undefined;
						const error = data?.error || 'Failed to create item';
						toast.error(error);
					}
				};
			}}>
				<div class="space-y-4">
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
					</div>

					<!-- Container Selection -->
					<div class="space-y-3">
						<h3 class="text-sm font-medium">Available Containers</h3>
						{#if containersQuery.error}
							<div class="alert alert-error">
								<span>Error loading containers</span>
							</div>
						{:else if containers.length === 0}
							<p class="text-sm text-neutral/60">No containers available. Create one below.</p>
						{:else}
							<div class="space-y-3">
								<!-- Container Type Selector -->
								<div>
									<label for="create-container-type" class="label">
										<span class="label-text text-xs">Select container type</span>
									</label>
									<select
										id="create-container-type"
										bind:value={createContainerTypeFilter}
										class="select select-bordered select-sm w-full"
									>
										<option value="can">Can</option>
										<option value="bottle">Bottle</option>
										<option value="cup">Cup</option>
									</select>
								</div>

								<!-- Filtered Container Sizes -->
								{#if createFilteredContainers().length === 0}
									<p class="text-sm text-neutral/60">No {createContainerTypeFilter}s available. Create one below.</p>
								{:else}
									<div class="space-y-2">
										<h4 class="text-xs font-semibold uppercase text-neutral/70">{createContainerTypeFilter}s</h4>
										<div class="flex flex-wrap gap-2">
											{#each createFilteredContainers() as container}
												<label class="cursor-pointer">
													<input
														type="checkbox"
														class="checkbox checkbox-sm mr-2"
														checked={createSelectedContainers.has(container._id)}
														onchange={() => toggleContainer(container._id, false)}
													/>
													<span class="text-sm">{formatContainerLabel(container)}</span>
													{#if createSelectedContainers.has(container._id)}
														<input
															type="hidden"
															name="containerIds"
															value={container._id}
														/>
													{/if}
												</label>
											{/each}
										</div>
									</div>
								{/if}
							</div>
						{/if}
					</div>

					<button type="submit" class="btn btn-primary">Add Item</button>
				</div>
			</form>

			<!-- Inline New Container Creation (outside main form) -->
			<div class="border-t pt-3 mt-3">
				<div class="space-y-2">
					<label for="create-new-container-size" class="label">
						<span class="label-text text-xs">Add new {createContainerTypeFilter}</span>
					</label>
					<form 
						method="POST" 
						action="?/createContainer" 
						use:enhance={({ cancel }) => {
							// Validate before submission
							if (!createNewContainerSize) {
								toast.error('Please enter a container size');
								cancel();
								return;
							}

							const size = parseFloat(createNewContainerSize);
							if (isNaN(size) || size <= 0) {
								toast.error('Size must be a valid positive number');
								cancel();
								return;
							}

							if (createSizeExists) {
								toast.error(`A ${createContainerTypeFilter} with size ${size} already exists`);
								cancel();
								return;
							}

							isCreatingContainer = true;
							return ({ result, update }) => {
								update();
								isCreatingContainer = false;
								
								if (result.type === 'success') {
									const data = result.data as { success?: boolean; containerId?: Id<'containers'>; error?: string } | undefined;
									if (data?.success && data?.containerId) {
										const containerId = data.containerId;
										createSelectedContainers.add(containerId);
										createSelectedContainers = new Set(createSelectedContainers);
										createNewContainerSize = '';
										toast.success('Container created and selected');
									} else if (data?.error) {
										toast.error(data.error);
									}
								} else if (result.type === 'failure') {
									const data = result.data as { error?: string } | undefined;
									const error = data?.error || 'Failed to create container';
									toast.error(error);
								}
							};
						}}
					>
						<div class="flex gap-2">
							<input
								id="create-new-container-size"
								type="number"
								bind:value={createNewContainerSize}
								placeholder="Number of items"
								step="1"
								min="1"
								class="input input-bordered input-sm flex-1"
								name="size"
								class:input-error={createSizeExists}
								required
							/>
							<input
								type="hidden"
								name="type"
								value={createContainerTypeFilter}
							/>
							<button
								type="submit"
								class="btn btn-sm btn-primary"
								disabled={!createNewContainerSize || createSizeExists || isCreatingContainer}
							>
								{isCreatingContainer ? 'Adding...' : 'Quick Add'}
							</button>
						</div>
					</form>
					{#if createSizeExists}
						<p class="text-xs text-error">
							A {createContainerTypeFilter} with size {createNewContainerSize} already exists.
						</p>
					{/if}
					{#if createNewContainerSize && !createSizeExists && parseFloat(createNewContainerSize) > 0}
						<p class="text-xs text-success">
							Ready to create: {createNewContainerSize} {createContainerTypeFilter}{parseFloat(createNewContainerSize) !== 1 ? 's' : ''}
						</p>
					{/if}
				</div>
			</div>
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
					<li class="p-4 border-b last:border-b-0">
						{#if editingItemId === item._id}
							<form 
								method="POST" 
								action="?/updateItem" 
								use:enhance={() => {
									return ({ result, update }) => {
										update();
										if (result.type === 'success') {
											const data = result.data as { success?: boolean; error?: string } | undefined;
											if (data?.success) {
												toast.success('Item updated successfully.');
												cancelEdit();
											} else if (data?.error) {
												toast.error(data.error);
											}
										} else if (result.type === 'failure') {
											const data = result.data as { error?: string } | undefined;
											const error = data?.error || 'Failed to update item';
											toast.error(error);
										}
									};
								}}
								class="space-y-4"
							>
								<input type="hidden" name="itemId" value={item._id} />
								<div class="flex gap-2">
									<input
										type="text"
										name="name"
										bind:value={editName}
										class="input input-bordered flex-1"
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
								</div>

								<!-- Container Selection for Edit -->
								<div class="space-y-3">
									<h3 class="text-sm font-medium">Available Containers</h3>
									{#if containersQuery.error}
										<div class="alert alert-error">
											<span>Error loading containers</span>
										</div>
									{:else if containers.length === 0}
										<p class="text-sm text-neutral/60">No containers available. Create one below.</p>
									{:else}
										<div class="space-y-3">
											<!-- Container Type Selector -->
											<div>
												<label for="edit-container-type" class="label">
													<span class="label-text text-xs">Select container type</span>
												</label>
												<select
													id="edit-container-type"
													bind:value={editContainerTypeFilter}
													class="select select-bordered select-sm w-full"
												>
													<option value="can">Can</option>
													<option value="bottle">Bottle</option>
													<option value="cup">Cup</option>
												</select>
											</div>

											<!-- Filtered Container Sizes -->
											{#if editFilteredContainers().length === 0}
												<p class="text-sm text-neutral/60">No {editContainerTypeFilter}s available. Create one below.</p>
											{:else}
												<div class="space-y-2">
													<h4 class="text-xs font-semibold uppercase text-neutral/70">{editContainerTypeFilter}s</h4>
													<div class="flex flex-wrap gap-2">
														{#each editFilteredContainers() as container}
															<label class="cursor-pointer">
																<input
																	type="checkbox"
																	class="checkbox checkbox-sm mr-2"
																	checked={editSelectedContainers.has(container._id)}
																	onchange={() => toggleContainer(container._id, true)}
																/>
																<span class="text-sm">{formatContainerLabel(container)}</span>
																{#if editSelectedContainers.has(container._id)}
																	<input
																		type="hidden"
																		name="containerIds"
																		value={container._id}
																	/>
																{/if}
															</label>
														{/each}
													</div>
												</div>
											{/if}
										</div>
									{/if}
								</div>

								<div class="flex gap-2">
									<button type="submit" class="btn btn-sm btn-primary">Save</button>
									<button 
										type="button" 
										class="btn btn-sm btn-ghost"
										onclick={cancelEdit}
									>
										Cancel
									</button>
								</div>
							</form>

							<!-- Inline New Container Creation for Edit (outside main form) -->
							<div class="border-t pt-3 mt-3">
								<div class="space-y-2">
									<label for="edit-new-container-size" class="label">
										<span class="label-text text-xs">Add new {editContainerTypeFilter}</span>
									</label>
									<form 
										method="POST" 
										action="?/createContainer" 
										use:enhance={({ cancel }) => {
											// Validate before submission
											if (!editNewContainerSize) {
												toast.error('Please enter a container size');
												cancel();
												return;
											}

											const size = parseFloat(editNewContainerSize);
											if (isNaN(size) || size <= 0) {
												toast.error('Size must be a valid positive number');
												cancel();
												return;
											}

											if (editSizeExists) {
												toast.error(`A ${editContainerTypeFilter} with size ${size} already exists`);
												cancel();
												return;
											}

											isEditingContainer = true;
											return ({ result, update }) => {
												update();
												isEditingContainer = false;
												
												if (result.type === 'success') {
													const data = result.data as { success?: boolean; containerId?: Id<'containers'>; error?: string } | undefined;
													if (data?.success && data?.containerId) {
														const containerId = data.containerId;
														editSelectedContainers.add(containerId);
														editSelectedContainers = new Set(editSelectedContainers);
														editNewContainerSize = '';
														toast.success('Container created and selected');
													} else if (data?.error) {
														toast.error(data.error);
													}
												} else if (result.type === 'failure') {
													const data = result.data as { error?: string } | undefined;
													const error = data?.error || 'Failed to create container';
													toast.error(error);
												}
											};
										}}
									>
										<div class="flex gap-2">
											<input
												id="edit-new-container-size"
												type="number"
												bind:value={editNewContainerSize}
												placeholder="Number of items"
												step="1"
												min="1"
												class="input input-bordered input-sm flex-1"
												name="size"
												class:input-error={editSizeExists}
												required
											/>
											<input
												type="hidden"
												name="type"
												value={editContainerTypeFilter}
											/>
											<button
												type="submit"
												class="btn btn-sm btn-primary"
												disabled={!editNewContainerSize || editSizeExists || isEditingContainer}
											>
												{isEditingContainer ? 'Adding...' : 'Quick Add'}
											</button>
										</div>
									</form>
									{#if editSizeExists}
										<p class="text-xs text-error">
											A {editContainerTypeFilter} with size {editNewContainerSize} already exists.
										</p>
									{/if}
									{#if editNewContainerSize && !editSizeExists && parseFloat(editNewContainerSize) > 0}
										<p class="text-xs text-success">
											Ready to create: {editNewContainerSize} {editContainerTypeFilter}{parseFloat(editNewContainerSize) !== 1 ? 's' : ''}
										</p>
									{/if}
								</div>
							</div>
						{:else}
							<div class="grid grid-cols-[1fr_auto_auto] items-center gap-4">
								<div>
									<span class="font-medium">{item.name}</span>
									{#if item.containers && item.containers.length > 0}
										<div class="mt-1 flex flex-wrap gap-1">
											{#each item.containers as containerId}
												{@const container = containers.find(c => c._id === containerId)}
												{#if container}
													<span class="badge badge-sm badge-outline">{formatContainerLabel(container)}</span>
												{/if}
											{/each}
										</div>
									{/if}
								</div>
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
												return;
											}
											return ({ result, update }) => {
												update();
												if (result.type === 'success') {
													const data = result.data as { success?: boolean; error?: string } | undefined;
													if (data?.success) {
														toast.success('Item deleted successfully.');
													} else if (data?.error) {
														toast.error(data.error);
													}
												} else if (result.type === 'failure') {
													const data = result.data as { error?: string } | undefined;
													const error = data?.error || 'Failed to delete item';
													toast.error(error);
												}
											};
										}}
									>
										<input type="hidden" name="itemId" value={item._id} />
										<button type="submit" class="btn btn-sm btn-error">Delete</button>
									</form>
								</div>
							</div>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</section>
{/if}
