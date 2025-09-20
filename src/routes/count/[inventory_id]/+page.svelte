<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	let { inventory, location, items, itemContainers, counts } = data;

	function totalFor(itemId: number) {
		const itemCounts = counts?.filter((c: any) => Number(c.item_id) === Number(itemId));
		const res =
			itemCounts?.reduce(
				(acc: number, count: any) => acc + Number(count.count) * Number(count.container_size),
				0
			) ?? 0;
		return res;
	}

	function countFor(containerId: number, itemId: number) {
		const row = counts?.find(
			(c: any) =>
				Number(c.container_id) === Number(containerId) && Number(c.item_id) === Number(itemId)
		);
		return row?.count ?? 0;
	}

	function containersFor(itemId: number) {
		return itemContainers.filter((ic: any) => Number(ic.item_id) === Number(itemId));
	}
</script>

{#if !inventory}
	<h2 class="text-xl font-semibold">Inventory not found</h2>
{:else}
	<div class="mb-6 flex w-full items-center justify-between gap-4">
		<a href={`/inventories/${inventory.id}`} class="link text-sm text-nowrap link-hover">← Back</a>
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

	<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each items as item}
			<li class="card border bg-base-100 shadow-sm">
				<div class="card-body gap-3">
					<div class="flex items-center justify-between">
						<span class="card-title text-base">{item.name}</span>
						<span class="badge badge-neutral">Total: {totalFor(Number(item.id))}</span>
					</div>
					<div class="grid w-full grid-cols-1 gap-2">
						{#each containersFor(Number(item.id)) as ic}
							<form method="POST" action="?/increment" class="w-full">
								<input type="hidden" name="item_id" value={String(item.id)} />
								<input type="hidden" name="container_id" value={String(ic.container_id)} />
								<div class="join grid w-full grid-cols-8">
									<button name="op" value="dec" type="submit" class="btn col-span-2 btn-sm">
										-
									</button>
									<div class="btn-disabled col-span-4 gap-2 bg-neutral/10 pl-4 text-left btn-sm">
										<span class="text-xl text-neutral"
											>{countFor(Number(ic.container_id), Number(item.id))}</span
										>
										<span class="text-neutral/60">x</span>
										<span class="text-sm text-neutral/60">{ic.size} pack</span>
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
