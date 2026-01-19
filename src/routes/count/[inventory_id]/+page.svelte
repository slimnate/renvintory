<script lang="ts">
	import { enhance } from '$app/forms';
	import { useQuery } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api';
	import type { Id } from '../../../convex/_generated/dataModel';
	let { params }: { params: { inventory_id: string } } = $props();

	const countPageDataQuery = useQuery(api.inventories.getCountPageData, { 
		inventoryId: params.inventory_id as Id<"inventories"> 
	});

	const inventory = $derived(countPageDataQuery.data?.inventory);
	const location = $derived(countPageDataQuery.data?.location);
	const items = $derived(countPageDataQuery.data?.items ?? []);
	const counts = $derived(countPageDataQuery.data?.counts ?? []);

	function totalFor(itemId: Id<"items">) {
		const itemCounts = counts.filter((c) => c.itemId === itemId);
		// Get container sizes from items data
		const item = items.find((i) => i._id === itemId);
		if (!item) return 0;
		
		const res = itemCounts.reduce((acc, count) => {
			const container = item.containers.find((c) => c._id === count.containerId);
			if (!container) return acc;
			return acc + count.count * container.size;
		}, 0);
		return res;
	}

	function countFor(containerId: Id<"containers">, itemId: Id<"items">) {
		const row = counts.find(
			(c) => c.containerId === containerId && c.itemId === itemId
		);
		return row?.count ?? 0;
	}

	function containersFor(itemId: Id<"items">) {
		const item = items.find((i) => i._id === itemId);
		return item?.containers ?? [];
	}

    const pageTitle = $derived(`${location?.name} - ${inventory?.date} - ${inventory?.inventoryType === 'close' ? 'Closing' : 'Opening'} Count`);
</script>

<svelte:head>
    <title>{pageTitle}</title>
</svelte:head>

{#if countPageDataQuery.error}
	<div class="mb-6 flex items-center gap-4">
		<a href="/" class="link text-sm link-hover">← Back</a>
		<h2 class="text-2xl font-semibold tracking-tight">{countPageDataQuery.error}</h2>
	</div>
{:else if !inventory}
	<div class="mb-6 flex items-center gap-4">
		<a href="/" class="link text-sm link-hover">← Back</a>
		<h2 class="text-xl font-semibold">Inventory not found</h2>
	</div>
{:else}
	<div class="mb-6 flex w-full items-center justify-between gap-4">
		<a href={`/inventories/${inventory._id}`} class="link text-sm text-nowrap link-hover">← Back</a>
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

	<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each items as item}
			<li class="card border bg-base-100 shadow-sm">
				<div class="card-body gap-3">
					<div class="flex items-center justify-between">
						<span class="card-title text-base">{item.name}</span>
						<span class="badge badge-neutral">Total: {totalFor(item._id)}</span>
					</div>
					<div class="grid w-full grid-cols-1 gap-2">
						{#each containersFor(item._id) as container}
							<form method="POST" action="?/increment" class="w-full" use:enhance>
								<input type="hidden" name="item_id" value={item._id} />
								<input type="hidden" name="container_id" value={container._id} />
								<div class="join grid w-full grid-cols-8">
									<button name="op" value="dec" type="submit" class="btn col-span-2 btn-sm">
										-
									</button>
									<div class="btn-disabled col-span-4 gap-2 bg-neutral/10 pl-4 text-left btn-sm">
										<span class="text-xl text-neutral"
											>{countFor(container._id, item._id)}</span
										>
										<span class="text-neutral/60">x</span>
										<span class="text-sm text-neutral/60">{container.size} pack</span>
									</div>
									<button
										name="op"
										value="inc"
										type="submit"
										class="btn col-span-2 btn-sm btn-primary"
									>
										+
									</button>
								</div>
							</form>
						{/each}
					</div>
				</div>
			</li>
		{/each}
	</ul>
{/if}
