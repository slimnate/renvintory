<script lang="ts">
	import { enhance } from '$app/forms';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api';
	import type { Id } from '../../../convex/_generated/dataModel';
	import { toast } from '$lib/stores/toast';
	import { emblemFor } from '$lib/emblems';
	import Emblem from '$lib/components/Emblem.svelte';
	import { formatCalendarDateShort, todayCalendarDate } from '$lib/dates';
	import { sortableList } from '$lib/actions/sortableList';
	import { getErrorMessage } from '$lib/convexError';
	let { params }: { params: { id: string } } = $props();

	const convex = useConvexClient();

	const locationQuery = useQuery(api.locations.getLocationById, {
		id: params.id as Id<'locations'>
	});
	const inventoriesQuery = useQuery(api.inventories.getInventoriesByLocationId, {
		locationId: params.id as Id<'locations'>
	});
	const itemsQuery = useQuery(api.items.getItemsByLocationId, {
		locationId: params.id as Id<'locations'>
	});
	const allItemsQuery = useQuery(api.items.getAllItems);

	const location = $derived(locationQuery.data);
	const items = $derived(itemsQuery.data ?? []);
	const allItems = $derived(allItemsQuery.data ?? []);
	let optimisticItems = $state<typeof items | null>(null);
	const displayItems = $derived(optimisticItems ?? items);

	let activeTab = $state<'inventories' | 'items'>('inventories');
	let showAddModal = $state(false);
	let selectedItemId = $state<string | null>(null);
	let editMode = $state(false);
	let showDeleteDayModal = $state(false);
	let dayToDelete = $state<string | null>(null);
	let pendingDeleteDate: string | null = null;
	let deleteDayButtonDisabled = $state(false);
	let deleteDayTimeoutId: number | null = null;
	let showRemoveItemModal = $state(false);
	let itemToRemove = $state<{ _id: Id<'items'>; name: string } | null>(null);
	let pendingRemoveItemId: Id<'items'> | null = null;
	let removeItemButtonDisabled = $state(false);
	let removeItemTimeoutId: number | null = null;

	type Inventory = {
		_id: Id<'inventories'>;
		locationId: Id<'locations'>;
		date: string;
		inventoryType: 'open' | 'close' | 'spill' | 'intake';
		createdAt: string;
	};

	const inventories = $derived(inventoriesQuery.data ?? []) as Inventory[];

	const availableItems = $derived(
		allItems.filter((item) => !items.some((locationItem) => locationItem._id === item._id))
	);

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
		return Array.from(grouped.entries()).sort((a, b) => b[0].localeCompare(a[0]));
	});

	function handleDeleteDayClick(date: string) {
		dayToDelete = date;
		pendingDeleteDate = date;
		showDeleteDayModal = true;
		deleteDayButtonDisabled = true;
		if (deleteDayTimeoutId) {
			clearTimeout(deleteDayTimeoutId);
		}
		deleteDayTimeoutId = window.setTimeout(() => {
			deleteDayButtonDisabled = false;
			deleteDayTimeoutId = null;
		}, 2000);
	}

	function cancelDeleteDay() {
		showDeleteDayModal = false;
		dayToDelete = null;
		pendingDeleteDate = null;
		deleteDayButtonDisabled = false;
		if (deleteDayTimeoutId) {
			clearTimeout(deleteDayTimeoutId);
			deleteDayTimeoutId = null;
		}
	}

	function confirmDeleteDay() {
		if (pendingDeleteDate) {
			const form = document.querySelector(
				`form[data-delete-date="${pendingDeleteDate}"]`
			) as HTMLFormElement | null;
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
		removeItemButtonDisabled = true;
		if (removeItemTimeoutId) {
			clearTimeout(removeItemTimeoutId);
		}
		removeItemTimeoutId = window.setTimeout(() => {
			removeItemButtonDisabled = false;
			removeItemTimeoutId = null;
		}, 2000);
	}

	function cancelRemoveItem() {
		showRemoveItemModal = false;
		itemToRemove = null;
		pendingRemoveItemId = null;
		removeItemButtonDisabled = false;
		if (removeItemTimeoutId) {
			clearTimeout(removeItemTimeoutId);
			removeItemTimeoutId = null;
		}
	}

	function confirmRemoveItem() {
		if (pendingRemoveItemId) {
			const form = document.querySelector(
				`form[data-remove-item-id="${pendingRemoveItemId}"]`
			) as HTMLFormElement | null;
			if (form) {
				form.requestSubmit();
			}
		}
		cancelRemoveItem();
	}

	$effect(() => {
		const serverItems = items;
		const pending = optimisticItems;
		if (!pending) return;

		const serverSet = [...serverItems.map((item) => item._id)].sort().join(',');
		const pendingSet = [...pending.map((item) => item._id)].sort().join(',');
		if (serverSet !== pendingSet) {
			optimisticItems = null;
			return;
		}

		const serverOrder = serverItems.map((item) => item._id).join(',');
		const pendingOrder = pending.map((item) => item._id).join(',');
		if (serverOrder === pendingOrder) {
			optimisticItems = null;
		}
	});

	async function handleReorder(orderedIds: string[]) {
		const previous = displayItems;
		const next = orderedIds
			.map((id) => previous.find((item) => item._id === id))
			.filter((item): item is (typeof previous)[number] => item != null);
		optimisticItems = next;
		try {
			await convex.mutation(api.locations.reorderLocationItems, {
				locationId: params.id as Id<'locations'>,
				itemIds: orderedIds as Id<'items'>[]
			});
		} catch (error) {
			optimisticItems = previous;
			toast.error(getErrorMessage(error, 'The wares could not be reordered.'));
		}
	}
</script>

<svelte:head>
	<title>{location?.name} - Renvintory</title>
</svelte:head>

{#if locationQuery.error || inventoriesQuery.error || itemsQuery.error}
	<div class="mb-6 flex items-center gap-4">
		<a href="/" class="text-xl text-goldleaf">&lsaquo;</a>
		<h2 class="font-display text-2xl font-semibold tracking-tight text-cream">
			{locationQuery.error
				? locationQuery.error instanceof Error
					? locationQuery.error.message
					: String(locationQuery.error)
				: inventoriesQuery.error
					? inventoriesQuery.error instanceof Error
						? inventoriesQuery.error.message
						: String(inventoriesQuery.error)
					: itemsQuery.error
						? itemsQuery.error instanceof Error
							? itemsQuery.error.message
							: String(itemsQuery.error)
						: 'Something went awry.'}
		</h2>
	</div>
{:else}
	<header
		class="-mx-4 mb-4 flex items-center gap-3 boardface px-4 py-3 carved sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
	>
		<a href="/" class="text-xl text-goldleaf">&lsaquo;</a>
		<Emblem id={emblemFor(params.id, location?.name)} class="h-11 w-9 shrink-0" />
		<div>
			<div class="gilt font-display text-xl leading-none font-bold">{location?.name}</div>
			<div class="text-[10px] tracking-[0.2em] text-cream/40 uppercase">at the sign of</div>
		</div>
	</header>

	{#if activeTab === 'inventories'}
		<section class="mb-8">
			{#if inventories.length === 0}
				<p class="text-cream/70">No reckonings recorded at this house.</p>
			{:else}
				<ul class="space-y-3">
					{#each inventoriesByDate as [date, dateInventories]}
						{@const openInv = dateInventories.find((inv) => inv.inventoryType === 'open')}
						{@const closeInv = dateInventories.find((inv) => inv.inventoryType === 'close')}
						{@const spillInv = dateInventories.find((inv) => inv.inventoryType === 'spill')}
						{@const intakeInv = dateInventories.find((inv) => inv.inventoryType === 'intake')}
						<li
							class="overflow-hidden rounded-sm border-2 border-goldleaf/70 painted shadow-lg carved"
						>
							<div
								class="flex items-center justify-between border-b-2 border-oak/25 bg-oak/12 px-3 py-2"
							>
								<span class="font-num font-bold">{formatCalendarDateShort(date)}</span>
								<div class="flex items-center gap-3">
									<a
										href={`/inventories/${params.id}/${date}`}
										class="font-num text-xs font-medium text-gules">Details</a
									>
									<form
										method="POST"
										action="?/deleteInventory"
										data-delete-date={date}
										use:enhance={() => {
											return ({ result, update }) => {
												update();
												if (result.type === 'success') {
													const data = result.data as
														| { success?: boolean; error?: string }
														| undefined;
													if (data?.success) {
														toast.success("The day's reckonings were struck from the record.");
													} else if (data?.error) {
														toast.error(data.error);
													}
												} else if (result.type === 'failure') {
													const data = result.data as { error?: string } | undefined;
													const error =
														data?.error || 'The reckonings could not be struck from the record.';
													toast.error(error);
												}
											};
										}}
									>
										<input type="hidden" name="date" value={date} />
										<button
											type="button"
											class="font-num text-xs font-medium text-error"
											onclick={() => handleDeleteDayClick(date)}
										>
											Delete
										</button>
									</form>
								</div>
							</div>
							<div class="grid grid-cols-4 gap-1.5 p-2">
								{#if openInv}
									<a
										href={`/count/${openInv._id}`}
										class="rounded-sm border-2 border-goldleaf/80 leaf py-2.5 text-center font-num text-xs font-bold text-board carved"
										>Open</a
									>
								{/if}
								{#if closeInv}
									<a
										href={`/count/${closeInv._id}`}
										class="rounded-sm border-2 border-goldleaf/80 leaf py-2.5 text-center font-num text-xs font-bold text-board carved"
										>Close</a
									>
								{/if}
								{#if spillInv}
									<a
										href={`/count/${spillInv._id}`}
										class="rounded-sm border-2 border-goldleaf/80 leaf py-2.5 text-center font-num text-xs font-bold text-board carved"
										>Spill</a
									>
								{/if}
								{#if intakeInv}
									<a
										href={`/count/${intakeInv._id}`}
										class="rounded-sm border-2 border-goldleaf/80 leaf py-2.5 text-center font-num text-xs font-bold text-board carved"
										>Intake</a
									>
								{/if}
							</div>
							<div class="grid grid-cols-2 gap-1.5 px-2 pb-2">
								{#if openInv}
									<a
										href={`/reports/${openInv._id}`}
										class="rounded-sm border-2 border-goldleaf/70 boardface py-2.5 text-center font-num text-[11px] font-bold text-goldleaf carved"
									>
										Opening Account
									</a>
								{/if}
								{#if closeInv}
									<a
										href={`/reports/${closeInv._id}`}
										class="rounded-sm border-2 border-goldleaf/70 boardface py-2.5 text-center font-num text-[11px] font-bold text-goldleaf carved"
									>
										Closing Account
									</a>
								{/if}
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	{/if}

	{#if activeTab === 'items'}
		<section>
			{#if items.length === 0 && availableItems.length === 0}
				<div class="alert">
					<span>No wares stocked at this house.</span>
				</div>
			{:else}
				<div
					class="overflow-hidden rounded-sm border-2 border-goldleaf/60 painted shadow-lg carved"
				>
					<ul
						class="divide-y divide-oak/20"
						use:sortableList={{
							enabled: editMode && displayItems.length > 1,
							onReorder: handleReorder
						}}
					>
						{#each displayItems as item (item._id)}
							<li
								data-sortable-id={item._id}
								class="flex items-center gap-2 px-4 py-3 {editMode ? 'select-none pl-1' : ''}"
							>
								{#if editMode}
									<button
										type="button"
										data-drag-handle
										class="touch-none flex h-11 w-11 shrink-0 cursor-grab items-center justify-center text-oak/45 active:cursor-grabbing"
										aria-label={`Reorder ${item.name}`}
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											class="h-5 w-5"
											fill="currentColor"
											aria-hidden="true"
										>
											<circle cx="9" cy="6" r="1.6" />
											<circle cx="15" cy="6" r="1.6" />
											<circle cx="9" cy="12" r="1.6" />
											<circle cx="15" cy="12" r="1.6" />
											<circle cx="9" cy="18" r="1.6" />
											<circle cx="15" cy="18" r="1.6" />
										</svg>
									</button>
								{/if}
								<span class="min-w-0 flex-1 font-display font-bold">{item.name}</span>
								<div class="flex items-center gap-2 pr-2">
									<span class="font-num text-sm font-semibold text-azure">${item.price}</span>
									{#if editMode}
										<form
											method="POST"
											action="?/removeItem"
											data-remove-item-id={item._id}
											use:enhance={() => {
												return ({ result, update }) => {
													update();
													if (result.type === 'success') {
														const data = result.data as
															| { success?: boolean; error?: string }
															| undefined;
														if (data?.success) {
															toast.success('Ware removed.');
														} else if (data?.error) {
															toast.error(data.error);
														}
													} else if (result.type === 'failure') {
														const data = result.data as { error?: string } | undefined;
														const error = data?.error || 'The ware could not be removed.';
														toast.error(error);
													}
												};
											}}
											class="flex-shrink-0"
										>
											<input type="hidden" name="itemId" value={item._id} />
											<button
												type="button"
												class="btn btn-circle h-6 min-h-0 w-6 p-0 btn-sm btn-error"
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
							</li>
						{/each}
					</ul>
					{#if editMode && availableItems.length > 0}
						<button
							type="button"
							class="flex min-h-[80px] w-full flex-row items-center justify-center gap-4 border-t-2 border-dashed border-goldleaf/50 transition-colors hover:bg-oak/5"
							onclick={() => (showAddModal = true)}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 4v16m8-8H4"
								/>
							</svg>
							<span class="font-display text-base font-medium">Add Ware</span>
						</button>
					{/if}
				</div>
			{/if}
		</section>
	{/if}

	<div
		class="fixed inset-x-0 bottom-[calc(3.25rem+env(safe-area-inset-bottom))] z-30 border-t-2 border-goldleaf/60 boardface p-3"
	>
		{#if activeTab === 'inventories'}
			<form
				method="POST"
				action="?/createInventory"
				use:enhance={() => {
					return ({ result, update }) => {
						update();
						if (result.type === 'success') {
							const data = result.data as { success?: boolean; error?: string } | undefined;
							if (data?.success) {
								toast.success('Reckoning begun.');
							} else if (data?.error) {
								toast.error(data.error);
							}
						} else if (result.type === 'failure') {
							const data = result.data as { error?: string } | undefined;
							const error = data?.error || 'The reckoning could not be begun.';
							toast.error(error);
						}
					};
				}}
			>
				<input type="hidden" name="date" value={todayCalendarDate()} />
				<button
					type="submit"
					class="w-full rounded-sm leaf py-3.5 font-display text-sm font-bold tracking-[0.2em] text-board uppercase carved"
				>
					New Reckoning
				</button>
			</form>
		{:else}
			<button
				type="button"
				class="w-full rounded-sm leaf py-3.5 font-display text-sm font-bold tracking-[0.2em] text-board uppercase carved"
				onclick={() => (editMode = !editMode)}
			>
				{editMode ? 'Done' : 'Manage Wares'}
			</button>
		{/if}
	</div>

	<nav
		class="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 border-t-2 border-goldleaf/60 boardface pb-[env(safe-area-inset-bottom)]"
	>
		<button
			type="button"
			class="py-3.5 font-display text-xs font-bold tracking-widest uppercase {activeTab ===
			'inventories'
				? 'text-goldleaf'
				: 'text-cream/45'}"
			onclick={() => (activeTab = 'inventories')}
		>
			Reckonings
		</button>
		<button
			type="button"
			class="py-3.5 font-display text-xs font-bold tracking-widest uppercase {activeTab === 'items'
				? 'text-goldleaf'
				: 'text-cream/45'}"
			onclick={() => (activeTab = 'items')}
		>
			Wares
		</button>
	</nav>

	{#if showAddModal}
		<div class="modal-open modal">
			<div class="modal-box border-2 border-goldleaf/70">
				<h3 class="mb-4 font-display text-lg font-bold">Add ware to house</h3>
				{#if availableItems.length === 0}
					<p class="text-muted">Every ware in the ledger is already stocked here.</p>
				{:else}
					<form
						method="POST"
						action="?/addItem"
						use:enhance={() => {
							return ({ result, update }) => {
								update();
								if (result.type === 'success') {
									const data = result.data as { success?: boolean; error?: string } | undefined;
									if (data?.success) {
										toast.success('Ware stocked.');
										showAddModal = false;
										selectedItemId = null;
									} else if (data?.error) {
										toast.error(data.error);
									}
								} else if (result.type === 'failure') {
									const data = result.data as { error?: string } | undefined;
									const error = data?.error || 'The ware could not be stocked.';
									toast.error(error);
								}
							};
						}}
					>
						<div class="form-control mb-4">
							<label for="item-select" class="label">
								<span class="label-text">Select a ware</span>
							</label>
							<select
								id="item-select"
								name="itemId"
								class="select-bordered select w-full"
								bind:value={selectedItemId}
								required
							>
								<option value="">Choose a ware...</option>
								{#each availableItems as item}
									<option value={item._id}>{item.name} - ${item.price}</option>
								{/each}
							</select>
						</div>
						<div class="modal-action">
							<button
								type="button"
								class="btn"
								onclick={() => {
									showAddModal = false;
									selectedItemId = null;
								}}>Cancel</button
							>
							<button type="submit" class="btn btn-primary" disabled={!selectedItemId}>Add</button>
						</div>
					</form>
				{/if}
			</div>
			<form method="dialog">
				<button
					class="modal-backdrop"
					onclick={() => {
						showAddModal = false;
						selectedItemId = null;
					}}>close</button
				>
			</form>
		</div>
	{/if}
	{#if showDeleteDayModal && dayToDelete}
		<div class="modal-open modal">
			<div class="modal-box border-2 border-goldleaf/70">
				<h3 class="mb-4 font-display text-lg font-bold">Delete reckonings</h3>
				<p class="mb-4">
					Are you sure you want to delete <strong>all reckonings</strong> for{' '}
					<strong>{formatCalendarDateShort(dayToDelete)}</strong>?
				</p>
				<p class="mb-4 text-sm text-neutral/70">
					This action cannot be undone and will remove all counts for this date at this house.
				</p>
				<div class="modal-action">
					<button type="button" class="btn" onclick={cancelDeleteDay}>Cancel</button>
					<button
						type="button"
						class="btn btn-error"
						onclick={confirmDeleteDay}
						disabled={deleteDayButtonDisabled}
					>
						Delete
					</button>
				</div>
			</div>
			<form method="dialog">
				<button class="modal-backdrop" onclick={cancelDeleteDay}></button>
			</form>
		</div>
	{/if}
	{#if showRemoveItemModal && itemToRemove}
		<div class="modal-open modal">
			<div class="modal-box border-2 border-goldleaf/70">
				<h3 class="mb-4 font-display text-lg font-bold">Remove ware from house</h3>
				<p class="mb-4">
					Are you sure you want to remove <strong>{itemToRemove.name}</strong> from this house?
				</p>
				<p class="mb-4 text-sm text-neutral/70">
					This will not delete the ware itself, only its association with this house.
				</p>
				<div class="modal-action">
					<button type="button" class="btn" onclick={cancelRemoveItem}>Cancel</button>
					<button
						type="button"
						class="btn btn-error"
						onclick={confirmRemoveItem}
						disabled={removeItemButtonDisabled}
					>
						Remove
					</button>
				</div>
			</div>
			<form method="dialog">
				<button class="modal-backdrop" onclick={cancelRemoveItem}></button>
			</form>
		</div>
	{/if}
{/if}
