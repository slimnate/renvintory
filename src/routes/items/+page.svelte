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

	let editingItemId = $state<Id<'items'> | null>(null);
	let editName = $state('');
	let editPrice = $state('');
	let editSelectedContainers = $state<Set<Id<'containers'>>>(new Set());

	// Create form state
	let createSelectedContainers = $state<Set<Id<'containers'>>>(new Set());
	let createContainerTypeFilter = $state<'can' | 'bottle' | 'cup'>('can');
	let createNewContainerSize = $state('');
	let createNewContainerType = $state<'can' | 'bottle' | 'cup'>('can');
	let isCreatingContainer = $state(false);

	// Edit form state
	let editContainerTypeFilter = $state<'can' | 'bottle' | 'cup'>('can');
	let editNewContainerSize = $state('');
	let editNewContainerType = $state<'can' | 'bottle' | 'cup'>('can');
	let isEditingContainer = $state(false);

	// Delete confirmation modal state
	let showDeleteModal = $state(false);
	let itemToDelete = $state<{ _id: Id<'items'>; name: string } | null>(null);
	let pendingDeleteItemId: Id<'items'> | null = null;
	let deleteButtonDisabled = $state(false);
	let deleteButtonTimeoutId: number | null = null;

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
		return createFilteredContainers().some((c) => c.size === size);
	});

	// Validation: check if size already exists for edit form
	const editSizeExists = $derived.by(() => {
		if (!editNewContainerSize) return false;
		const size = parseFloat(editNewContainerSize);
		if (isNaN(size)) return false;
		return editFilteredContainers().some((c) => c.size === size);
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

	function startEdit(item: {
		_id: Id<'items'>;
		name: string;
		price: number;
		containers: Id<'containers'>[];
	}) {
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

	function toggleContainer(containerId: Id<'containers'>, isEdit: boolean) {
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

	function formatContainerLabel(container: {
		size: number;
		type: 'can' | 'bottle' | 'cup';
	}): string {
		return `${container.size} ${container.type}${container.size !== 1 ? 's' : ''}`;
	}

	function resetCreateForm() {
		createSelectedContainers = new Set();
		createContainerTypeFilter = 'can';
		createNewContainerSize = '';
		createNewContainerType = 'can';
		isCreatingContainer = false;
	}

	function handleDeleteClick(item: { _id: Id<'items'>; name: string }) {
		itemToDelete = item;
		pendingDeleteItemId = item._id;
		showDeleteModal = true;
		deleteButtonDisabled = true;
		if (deleteButtonTimeoutId) {
			clearTimeout(deleteButtonTimeoutId);
		}
		deleteButtonTimeoutId = window.setTimeout(() => {
			deleteButtonDisabled = false;
			deleteButtonTimeoutId = null;
		}, 2000);
	}

	function cancelDelete() {
		showDeleteModal = false;
		itemToDelete = null;
		pendingDeleteItemId = null;
		deleteButtonDisabled = false;
		if (deleteButtonTimeoutId) {
			clearTimeout(deleteButtonTimeoutId);
			deleteButtonTimeoutId = null;
		}
	}

	function confirmDelete() {
		// Find and submit the form for the pending item
		if (pendingDeleteItemId) {
			const form = document.querySelector(
				`form[data-item-id="${pendingDeleteItemId}"]`
			) as HTMLFormElement;
			if (form) {
				form.requestSubmit();
			}
		}
		cancelDelete();
	}

	// Query locations for the item being deleted
	const locationsQueryArgs = $derived(
		itemToDelete ? { itemId: itemToDelete._id } : { itemId: null }
	);
	const locationsQuery = $derived(useQuery(api.items.getLocationsByItemId, locationsQueryArgs));
	const itemLocations = $derived(locationsQuery.data ?? []);

	$inspect(itemLocations);
	$inspect(locationsQuery);
	$inspect(locationsQueryArgs);
</script>

<svelte:head>
	<title>The Ware Ledger - Renvintory</title>
</svelte:head>

<header
	class="-mx-4 mb-4 flex items-center gap-3 boardface px-4 py-3 carved sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
>
	<a href="/" class="text-xl text-goldleaf">&lsaquo;</a>
	<div class="gilt font-display text-xl leading-none font-bold">The Ware Ledger</div>
</header>

{#if itemsQuery.error}
	<div class="mb-4 alert alert-error">
		<span
			>{itemsQuery.error instanceof Error
				? itemsQuery.error.message
				: String(itemsQuery.error)}</span
		>
	</div>
{:else}
	<section class="mb-8">
		<div class="mb-3 bg-gules px-3 pt-1.5 pb-3.5 text-center shadow-md banner">
			<span class="font-display text-xs font-bold tracking-[0.25em] text-goldleaf uppercase"
				>Enter a New Ware</span
			>
		</div>
		<div class="rounded-sm border-2 border-goldleaf/70 painted p-4 shadow-lg carved">
			<form
				method="POST"
				action="?/createItem"
				use:enhance={() => {
					return ({ result, update }) => {
						update();
						if (result.type === 'success') {
							const data = result.data as { success?: boolean; error?: string } | undefined;
							if (data?.success) {
								toast.success('Ware entered in the ledger.');
								resetCreateForm();
							} else if (data?.error) {
								toast.error(data.error);
							}
						} else if (result.type === 'failure') {
							const data = result.data as { error?: string } | undefined;
							const error = data?.error || 'The ware could not be entered in the ledger.';
							toast.error(error);
						}
					};
				}}
			>
				<div class="space-y-4">
					<div class="flex gap-2">
						<input
							type="text"
							name="name"
							placeholder="Ware name"
							class="input-bordered input flex-1"
							required
						/>
						<input
							type="number"
							name="price"
							placeholder="Price"
							step="0.01"
							min="0"
							class="input-bordered input w-32 font-num"
							required
						/>
					</div>

					<div class="space-y-3">
						<h3 class="font-display text-xs font-bold tracking-[0.2em] text-oak/70 uppercase">
							Vessels
						</h3>
						{#if containersQuery.error}
							<div class="alert alert-error">
								<span>Error loading vessels</span>
							</div>
						{:else if containers.length === 0}
							<p class="text-sm text-muted">No vessels available. Create one below.</p>
						{:else}
							<div class="space-y-3">
								<div
									class="grid grid-cols-3 overflow-hidden rounded-sm border-2 border-goldleaf/60"
								>
									{#each ['can', 'bottle', 'cup'] as type}
										<button
											type="button"
											class="py-2 font-display text-[10px] font-bold tracking-widest uppercase {createContainerTypeFilter ===
											type
												? 'leaf text-board carved'
												: 'boardface text-goldleaf/80'}"
											onclick={() =>
												(createContainerTypeFilter = type as 'can' | 'bottle' | 'cup')}
										>
											{type}
										</button>
									{/each}
								</div>

								{#if createFilteredContainers().length === 0}
									<p class="text-sm text-muted">
										No {createContainerTypeFilter}s available. Create one below.
									</p>
								{:else}
									<div class="flex flex-wrap gap-2">
										{#each createFilteredContainers() as container}
											{@const selected = createSelectedContainers.has(container._id)}
											<label class="cursor-pointer">
												<input
													type="checkbox"
													class="sr-only"
													checked={selected}
													onchange={() => toggleContainer(container._id, false)}
												/>
												<span
													class="inline-block rounded-sm border-2 px-2.5 py-1 text-sm {selected
														? 'border-goldleaf leaf font-semibold text-board carved'
														: 'border-oak/25 bg-cream/60 text-ink'}"
												>
													{formatContainerLabel(container)}
												</span>
												{#if selected}
													<input type="hidden" name="containerIds" value={container._id} />
												{/if}
											</label>
										{/each}
									</div>
								{/if}
							</div>
						{/if}
					</div>

					<button
						type="submit"
						class="rounded-sm leaf px-5 py-2.5 font-display text-xs font-bold tracking-[0.15em] text-board uppercase carved"
					>
						Add
					</button>
				</div>
			</form>

			<div class="mt-4 border-t-2 border-goldleaf/40 pt-3">
				<div class="space-y-2">
					<label
						for="create-new-container-size"
						class="font-display text-[10px] font-bold tracking-widest text-oak/70 uppercase"
					>
						Add new {createContainerTypeFilter}
					</label>
					<form
						method="POST"
						action="?/createContainer"
						use:enhance={({ cancel }) => {
							// Validate before submission
							if (!createNewContainerSize) {
								toast.error('Name the vessel size.');
								cancel();
								return;
							}

							const size = parseFloat(createNewContainerSize);
							if (isNaN(size) || size <= 0) {
								toast.error('Vessel size must be a fair positive number.');
								cancel();
								return;
							}

							if (createSizeExists) {
								toast.error(
									`A ${createContainerTypeFilter} vessel of size ${size} is already in the ledger.`
								);
								cancel();
								return;
							}

							isCreatingContainer = true;
							return ({ result, update }) => {
								update();
								isCreatingContainer = false;

								if (result.type === 'success') {
									const data = result.data as
										| { success?: boolean; containerId?: Id<'containers'>; error?: string }
										| undefined;
									if (data?.success && data?.containerId) {
										const containerId = data.containerId;
										createSelectedContainers.add(containerId);
										createSelectedContainers = new Set(createSelectedContainers);
										createNewContainerSize = '';
										toast.success('Vessel forged and chosen.');
									} else if (data?.error) {
										toast.error(data.error);
									}
								} else if (result.type === 'failure') {
									const data = result.data as { error?: string } | undefined;
									const error = data?.error || 'The vessel could not be forged.';
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
								class="input-bordered input input-sm flex-1"
								name="size"
								class:input-error={createSizeExists}
								required
							/>
							<input type="hidden" name="type" value={createContainerTypeFilter} />
							<button
								type="submit"
								class="rounded-sm leaf px-3 py-1.5 font-display text-[10px] font-bold tracking-wider text-board uppercase carved disabled:opacity-40"
								disabled={!createNewContainerSize || createSizeExists || isCreatingContainer}
							>
								{isCreatingContainer ? 'Adding...' : 'Quick Add'}
							</button>
						</div>
					</form>
					{#if createSizeExists}
						<p class="text-xs text-error">
							A {createContainerTypeFilter} vessel of size {createNewContainerSize} is already in the ledger.
						</p>
					{/if}
					{#if createNewContainerSize && !createSizeExists && parseFloat(createNewContainerSize) > 0}
						<p class="text-xs text-vert">
							Ready to create: {createNewContainerSize}
							{createContainerTypeFilter}{parseFloat(createNewContainerSize) !== 1 ? 's' : ''}
						</p>
					{/if}
				</div>
			</div>
		</div>
	</section>

	<section>
		<div class="mb-3 bg-gules px-3 pt-1.5 pb-3.5 text-center shadow-md banner">
			<span class="font-display text-xs font-bold tracking-[0.25em] text-goldleaf uppercase"
				>All Wares</span
			>
		</div>
		{#if items.length === 0}
			<div class="alert">
				<span>No wares in the ledger.</span>
			</div>
		{:else}
			<ul
				class="divide-y divide-oak/20 rounded-sm border-2 border-goldleaf/60 painted shadow-lg carved"
			>
				{#each items as item}
					<li class="p-3 {editingItemId === item._id ? 'bg-oak/10' : ''}">
						{#if editingItemId === item._id}
							<div class="mb-2 bg-gules px-3 pt-1.5 pb-3.5 text-center shadow-md banner">
								<span class="font-display text-xs font-bold tracking-[0.25em] text-goldleaf uppercase"
									>Edit Ware</span
								>
							</div>
							<div class="rounded-sm border-2 border-goldleaf/70 painted p-3 shadow-md carved">
								<form
									method="POST"
									action="?/updateItem"
									use:enhance={() => {
										return ({ result, update }) => {
											update();
											if (result.type === 'success') {
												const data = result.data as
													| { success?: boolean; error?: string }
													| undefined;
												if (data?.success) {
													toast.success('Ware updated.');
													cancelEdit();
												} else if (data?.error) {
													toast.error(data.error);
												}
											} else if (result.type === 'failure') {
												const data = result.data as { error?: string } | undefined;
												const error = data?.error || 'The ware could not be amended.';
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
											class="input-bordered input flex-1"
											required
										/>
										<input
											type="number"
											name="price"
											bind:value={editPrice}
											step="0.01"
											min="0"
											class="input-bordered input w-28 font-num"
											required
										/>
									</div>

									<div class="space-y-3">
										<h3
											class="font-display text-xs font-bold tracking-[0.2em] text-oak/70 uppercase"
										>
											Vessels
										</h3>
										{#if containersQuery.error}
											<div class="alert alert-error">
												<span>Error loading vessels</span>
											</div>
										{:else if containers.length === 0}
											<p class="text-sm text-muted">No vessels available. Create one below.</p>
										{:else}
											<div class="space-y-3">
												<div
													class="grid grid-cols-3 overflow-hidden rounded-sm border-2 border-goldleaf/60"
												>
													{#each ['can', 'bottle', 'cup'] as type}
														<button
															type="button"
															class="py-2 font-display text-[10px] font-bold tracking-widest uppercase {editContainerTypeFilter ===
															type
																? 'leaf text-board carved'
																: 'boardface text-goldleaf/80'}"
															onclick={() =>
																(editContainerTypeFilter = type as 'can' | 'bottle' | 'cup')}
														>
															{type}
														</button>
													{/each}
												</div>

												{#if editFilteredContainers().length === 0}
													<p class="text-sm text-muted">
														No {editContainerTypeFilter}s available. Create one below.
													</p>
												{:else}
													<div class="flex flex-wrap gap-2">
														{#each editFilteredContainers() as container}
															{@const selected = editSelectedContainers.has(container._id)}
															<label class="cursor-pointer">
																<input
																	type="checkbox"
																	class="sr-only"
																	checked={selected}
																	onchange={() => toggleContainer(container._id, true)}
																/>
																<span
																	class="inline-block rounded-sm border-2 px-2.5 py-1 text-sm {selected
																		? 'border-goldleaf leaf font-semibold text-board carved'
																		: 'border-oak/25 bg-cream/60 text-ink'}"
																>
																	{formatContainerLabel(container)}
																</span>
																{#if selected}
																	<input type="hidden" name="containerIds" value={container._id} />
																{/if}
															</label>
														{/each}
													</div>
												{/if}
											</div>
										{/if}
									</div>

									<div class="flex gap-2">
										<button
											type="submit"
											class="rounded-sm leaf px-4 py-2 font-display text-xs font-bold tracking-[0.15em] text-board uppercase carved"
										>
											Save
										</button>
										<button
											type="button"
											class="rounded-sm border-2 border-oak/30 px-4 py-2 font-display text-xs font-bold tracking-[0.15em] uppercase"
											onclick={cancelEdit}
										>
											Cancel
										</button>
									</div>
								</form>

								<div class="mt-4 border-t-2 border-goldleaf/40 pt-3">
									<div class="space-y-2">
										<label
											for="edit-new-container-size"
											class="font-display text-[10px] font-bold tracking-widest text-oak/70 uppercase"
										>
											Add new {editContainerTypeFilter}
										</label>
										<form
											method="POST"
											action="?/createContainer"
											use:enhance={({ cancel }) => {
												if (!editNewContainerSize) {
													toast.error('Name the vessel size.');
													cancel();
													return;
												}

												const size = parseFloat(editNewContainerSize);
												if (isNaN(size) || size <= 0) {
													toast.error('Vessel size must be a fair positive number.');
													cancel();
													return;
												}

												if (editSizeExists) {
													toast.error(
														`A ${editContainerTypeFilter} vessel of size ${size} is already in the ledger.`
													);
													cancel();
													return;
												}

												isEditingContainer = true;
												return ({ result, update }) => {
													update();
													isEditingContainer = false;

													if (result.type === 'success') {
														const data = result.data as
															| {
																	success?: boolean;
																	containerId?: Id<'containers'>;
																	error?: string;
															  }
															| undefined;
														if (data?.success && data?.containerId) {
															const containerId = data.containerId;
															editSelectedContainers.add(containerId);
															editSelectedContainers = new Set(editSelectedContainers);
															editNewContainerSize = '';
															toast.success('Vessel forged and chosen.');
														} else if (data?.error) {
															toast.error(data.error);
														}
													} else if (result.type === 'failure') {
														const data = result.data as { error?: string } | undefined;
														const error = data?.error || 'The vessel could not be forged.';
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
													class="input-bordered input input-sm flex-1"
													name="size"
													class:input-error={editSizeExists}
													required
												/>
												<input type="hidden" name="type" value={editContainerTypeFilter} />
												<button
													type="submit"
													class="rounded-sm leaf px-3 py-1.5 font-display text-[10px] font-bold tracking-wider text-board uppercase carved disabled:opacity-40"
													disabled={!editNewContainerSize ||
														editSizeExists ||
														isEditingContainer}
												>
													{isEditingContainer ? 'Adding...' : 'Quick Add'}
												</button>
											</div>
										</form>
										{#if editSizeExists}
											<p class="text-xs text-error">
												A {editContainerTypeFilter} vessel of size {editNewContainerSize} is already in the ledger.
											</p>
										{/if}
										{#if editNewContainerSize && !editSizeExists && parseFloat(editNewContainerSize) > 0}
											<p class="text-xs text-vert">
												Ready to create: {editNewContainerSize}
												{editContainerTypeFilter}{parseFloat(editNewContainerSize) !== 1
													? 's'
													: ''}
											</p>
										{/if}
									</div>
								</div>
							</div>
						{:else}
							<div class="grid grid-cols-[1fr_auto_auto] items-center gap-3">
								<div>
									<span class="font-display font-bold">{item.name}</span>
									{#if item.containers && item.containers.length > 0}
										<div class="mt-1 flex flex-wrap gap-1">
											{#each item.containers as containerId}
												{@const container = containers.find((c) => c._id === containerId)}
												{#if container}
													<span
														class="inline-block rounded-sm border border-oak/30 px-1.5 py-0.5 text-xs"
														>{formatContainerLabel(container)}</span
													>
												{/if}
											{/each}
										</div>
									{/if}
								</div>
								<span class="font-num text-sm font-semibold text-azure">${item.price}</span>
								<div class="flex gap-2">
									<button
										type="button"
										class="rounded-sm border-2 border-oak/30 px-2.5 py-1 font-display text-[10px] font-bold tracking-wider uppercase"
										onclick={() => startEdit(item)}
									>
										Edit
									</button>
									<form
										method="POST"
										action="?/deleteItem"
										data-item-id={item._id}
										use:enhance={() => {
											return ({ result, update }) => {
												update();
												showDeleteModal = false;
												itemToDelete = null;
												pendingDeleteItemId = null;
												if (result.type === 'success') {
													const data = result.data as
														| { success?: boolean; error?: string }
														| undefined;
													if (data?.success) {
														toast.success('Ware deleted.');
													} else if (data?.error) {
														toast.error(data.error);
													}
												} else if (result.type === 'failure') {
													const data = result.data as { error?: string } | undefined;
													const error = data?.error || 'The ware could not be struck from the ledger.';
													toast.error(error);
												}
											};
										}}
									>
										<input type="hidden" name="itemId" value={item._id} />
										<button
											type="button"
											class="rounded-sm bg-gules px-2.5 py-1 font-display text-[10px] font-bold tracking-wider text-cream uppercase carved"
											onclick={() => handleDeleteClick(item)}
										>
											Delete
										</button>
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

{#if showDeleteModal && itemToDelete}
	<div class="modal-open modal">
		<div class="modal-box border-2 border-goldleaf/70 painted carved">
			<h3 class="mb-4 font-display text-lg font-bold">Delete Ware</h3>
			<p class="mb-4">
				Are you sure you want to delete <strong>{itemToDelete.name}</strong>?
			</p>
			{#if locationsQuery.isLoading}
				<div class="flex justify-center py-4">
					<span class="loading loading-spinner"></span>
				</div>
			{:else if itemLocations.length > 0}
				<div class="mb-4 flex gap-3 rounded-sm border-2 border-gules/40 bg-gules/10 p-3">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mt-0.5 h-5 w-5 shrink-0 text-gules"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
					<div>
						<p class="font-semibold">This ware is assigned to the following houses:</p>
						<ul class="mt-2 list-inside list-disc">
							{#each itemLocations as location}
								<li>{location.name}</li>
							{/each}
						</ul>
						<p class="mt-2 text-sm">Deleting this ware will remove it from all houses.</p>
					</div>
				</div>
			{/if}
			<div class="modal-action">
				<button
					type="button"
					class="rounded-sm border-2 border-oak/30 px-4 py-2 font-display text-xs font-bold tracking-[0.15em] uppercase"
					onclick={cancelDelete}>Cancel</button
				>
				<button
					type="button"
					class="rounded-sm bg-gules px-4 py-2 font-display text-xs font-bold tracking-[0.15em] text-cream uppercase carved disabled:opacity-40"
					onclick={confirmDelete}
					disabled={deleteButtonDisabled}
				>
					Delete
				</button>
			</div>
		</div>
		<form method="dialog">
			<button class="modal-backdrop" onclick={cancelDelete}></button>
		</form>
	</div>
{/if}
