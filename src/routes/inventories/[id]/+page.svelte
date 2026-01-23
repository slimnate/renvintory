<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api';
	import type { Id } from '../../../convex/_generated/dataModel';
	let { params }: { params: { id: string } } = $props();

	const inventoryQuery = useQuery(api.inventories.getInventoryById, { id: params.id as Id<"inventories"> });
	const locationQuery = useQuery(
		api.locations.getLocationById,
		() => inventoryQuery.data ? { id: inventoryQuery.data.locationId } : "skip"
	);
	const countsQuery = useQuery(api.inventories.getCountsByInventoryId, { inventoryId: params.id as Id<"inventories"> });

	const inventory = $derived(inventoryQuery.data);
	const location = $derived(locationQuery.data);
	const counts = $derived(countsQuery.data ?? []);

	type Line = {
		itemId: Id<"items">;
		name: string;
		price: number;
		containerId: Id<"containers">;
		containerSize: number;
		count: number;
	};

	function groupByItem(rows: Array<{ itemId: Id<"items">; item: { name: string; price: number } | null; containerId: Id<"containers">; container: { size: number; type: "can" | "bottle" | "cup" } | null; count: number }>) {
		const map = new Map<
			string,
			{
				name: string;
				price: number;
				perContainer: Array<{ size: number; count: number }>;
				total: number;
			}
		>();
		for (const r of rows) {
			if (!r.item || !r.container) continue;
			const itemId = r.itemId;
			const current = map.get(itemId) ?? {
				name: r.item.name,
				price: r.item.price,
				perContainer: [],
				total: 0
			};
			const size = r.container.size;
			const count = r.count || 0;
			current.perContainer.push({ size, count });
			current.total += size * count;
			map.set(itemId, current);
		}
		for (const entry of map.values()) {
			entry.perContainer.sort((a, b) => a.size - b.size);
		}
		return Array.from(map.entries()).map(([itemId, data]) => ({ itemId, ...data }));
	}

	const grouped = $derived(groupByItem(counts));

    const pageTitle = $derived(`${location?.name} - ${inventory?.date} - ${inventory?.inventoryType === 'close' ? 'Closing' : 'Opening'} Inventory`);
</script>

<svelte:head>
    <title>{pageTitle}</title>
</svelte:head>

{#if inventoryQuery.error || locationQuery.error || countsQuery.error}
	<div class="mb-6 flex items-center gap-4">
		<a href="/" class="link text-sm link-hover">← Back</a>
		<h2 class="text-2xl font-semibold tracking-tight">{inventoryQuery.error || locationQuery.error || countsQuery.error}</h2>
	</div>
{:else if !inventory}
	<div class="mb-6 flex items-center gap-4">
		<a href="/" class="link text-sm link-hover">← Back</a>
		<h2 class="text-xl font-semibold">Inventory not found</h2>
	</div>
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

	<section>
		<div class="flex justify-between gap-4">
			<h3 class="mb-3 text-lg font-medium">Counts</h3>

			<a class="btn btn-sm btn-primary" href={`/count/${inventory._id}`}>Edit</a>
		</div>
		{#if (counts?.length ?? 0) === 0}
			<div class="mb-4 alert">
				<span>No counts recorded for this inventory.</span>
			</div>
			<a class="btn btn-sm btn-primary" href={`/count/${inventory._id}`}>Start Counting</a>
		{:else}
			<div class="overflow-x-auto">
				{#if inventory.inventoryType === 'close'}
					<a href={`/reports/${inventory._id}`}>
						<button class="btn btn-sm btn-primary">Final report</button>
					</a>
				{:else}
					<a href={`/reports/${inventory._id}`}>
						<button class="btn btn-sm btn-primary">Starting report</button>
					</a>
				{/if}
				<table class="table">
					<thead>
						<tr>
							<th>Item</th>
							<th>Price</th>
							<th>Per container</th>
							<th class="text-right">Total</th>
						</tr>
					</thead>
					<tbody>
						{#each grouped as row}
							<tr>
								<td>{row.name}</td>
								<td>${row.price}</td>
								<td>
									<div class="flex flex-wrap gap-2">
										{#each row.perContainer as pc}
											<span class="badge badge-ghost">{pc.count} x {pc.size}</span>
										{/each}
									</div>
								</td>
								<td class="text-right">{row.total}</td>
							</tr>
						{/each}
					</tbody>
				</table>
				{#if inventory.inventoryType === 'close'}
					<a href={`/reports/${inventory._id}`}>
						<button class="btn btn-sm btn-primary">Final report</button>
					</a>
				{:else}
					<a href={`/reports/${inventory._id}`}>
						<button class="btn btn-sm btn-primary">Starting report</button>
					</a>
				{/if}
			</div>
		{/if}
	</section>
{/if}
