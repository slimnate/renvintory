<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	let { inventory, location, lines } = data;

	type Line = {
		item_id: number;
		name: string;
		price: number;
		container_id: number;
		container_size: number;
		count: number;
	};

	function groupByItem(rows: Line[]) {
		const map = new Map<
			number,
			{
				name: string;
				price: number;
				perContainer: Array<{ size: number; count: number }>;
				total: number;
			}
		>();
		for (const r of rows as any as Line[]) {
			const current = map.get(r.item_id) ?? {
				name: r.name,
				price: Number(r.price),
				perContainer: [],
				total: 0
			};
			const size = Number(r.container_size);
			const count = Number(r.count) || 0;
			current.perContainer.push({ size, count });
			current.total += size * count;
			map.set(r.item_id, current);
		}
		for (const entry of map.values()) {
			entry.perContainer.sort((a, b) => a.size - b.size);
		}
		return Array.from(map.entries()).map(([itemId, data]) => ({ itemId, ...data }));
	}

	const grouped = groupByItem(lines as any);
</script>

{#if !inventory}
	<h2 class="text-xl font-semibold">Inventory not found</h2>
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

	<section>
		<div class="flex justify-between gap-4">
			<h3 class="mb-3 text-lg font-medium">Counts</h3>

			<a class="btn btn-sm btn-primary" href={`/count/${inventory.id}`}>Edit</a>
		</div>
		{#if (lines?.length ?? 0) === 0}
			<div class="mb-4 alert">
				<span>No counts recorded for this inventory.</span>
			</div>
			<a class="btn btn-sm btn-primary" href={`/count/${inventory.id}`}>Start Counting</a>
		{:else}
			<div class="overflow-x-auto">
				{#if inventory.time_of_day === 'close'}
					<a href={`/reports/${inventory.id}`}>
						<button class="btn btn-sm btn-primary">Final report</button>
					</a>
				{:else}
					<a href={`/reports/${inventory.id}`}>
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
				{#if inventory.time_of_day === 'close'}
					<a href={`/reports/${inventory.id}`}>
						<button class="btn btn-sm btn-primary">Final report</button>
					</a>
				{:else}
					<a href={`/reports/${inventory.id}`}>
						<button class="btn btn-sm btn-primary">Starting report</button>
					</a>
				{/if}
			</div>
		{/if}
	</section>
{/if}
