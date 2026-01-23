<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../../../../convex/_generated/api';
	import type { Id } from '../../../../convex/_generated/dataModel';
	let { params }: { params: { location_id: string; date: string } } = $props();

	const dataQuery = useQuery(api.inventories.getInventoriesByLocationAndDate, {
		locationId: params.location_id as Id<'locations'>,
		date: params.date
	});

	const location = $derived(dataQuery.data?.location ?? null);
	const inventories = $derived(dataQuery.data?.inventories ?? { open: null, close: null, spill: null, intake: null });
	const counts = $derived(dataQuery.data?.counts ?? { open: [], close: [], spill: [], intake: [] });

	function groupByItem(
		rows: Array<{
			itemId: Id<'items'>;
			item: { name: string; price: number } | null;
			containerId: Id<'containers'>;
			container: { size: number; type: 'can' | 'bottle' | 'cup' } | null;
			count: number;
		}>
	) {
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

	const groupedOpen = $derived(groupByItem(counts.open));
	const groupedClose = $derived(groupByItem(counts.close));
	const groupedSpill = $derived(groupByItem(counts.spill));
	const groupedIntake = $derived(groupByItem(counts.intake));

	const pageTitle = $derived(
		`${location?.name} - ${new Date(params.date).toLocaleDateString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric'
		})} - Inventories`
	);

	function renderInventorySection(
		type: 'open' | 'close' | 'spill' | 'intake',
		inventory: { _id: Id<'inventories'> } | null,
		grouped: Array<{ itemId: Id<'items'>; name: string; price: number; perContainer: Array<{ size: number; count: number }>; total: number }>,
		showReport: boolean
	) {
		const typeLabels = {
			open: 'Opening',
			close: 'Closing',
			spill: 'Spill',
			intake: 'Intake'
		};

		const reportLabels = {
			open: 'Starting report',
			close: 'Final report',
			spill: 'Spill report',
			intake: 'Intake report'
		};

		if (!inventory) return null;

		return {
			type,
			inventory,
			grouped,
			showReport,
			label: typeLabels[type],
			reportLabel: reportLabels[type]
		};
	}
</script>

<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

{#if dataQuery.error}
	<div class="mb-6 flex items-center gap-4">
		<a href="/" class="link text-sm link-hover">← Back</a>
		<h2 class="text-2xl font-semibold tracking-tight">{dataQuery.error}</h2>
	</div>
{:else if !location}
	<div class="mb-6 flex items-center gap-4">
		<a href="/" class="link text-sm link-hover">← Back</a>
		<h2 class="text-xl font-semibold">Location not found</h2>
	</div>
{:else}
	<div class="mb-6 flex w-full items-center justify-between gap-4">
		<a href={`/locations/${params.location_id}`} class="link text-sm link-hover">← Back</a>
		<h2 class="flex items-end gap-2 text-2xl font-semibold tracking-tight">
			<span class="border-r-1 border-neutral/20 pr-2 text-neutral">{location.name}</span>
			<span class="text-neutral"
				>{new Date(params.date).toLocaleDateString('en-US', {
					weekday: 'short',
					month: 'short',
					day: 'numeric'
				})}</span
			>
		</h2>
	</div>

	{#if inventories.open}
		{@const section = renderInventorySection('open', inventories.open, groupedOpen, true)}
		{#if section}
			<section class="mb-8">
				<div class="flex justify-between gap-4 mb-3">
					<h3 class="text-lg font-medium flex items-center gap-2">
						<span>{section.label} Inventory</span>
					</h3>
					<a class="btn btn-sm btn-primary" href={`/count/${section.inventory._id}`}>Edit</a>
				</div>
				{#if section.grouped.length === 0}
					<div class="mb-4 alert">
						<span>No counts recorded for this inventory.</span>
					</div>
					<a class="btn btn-sm btn-primary" href={`/count/${section.inventory._id}`}>Start Counting</a>
				{:else}
					<div class="overflow-x-auto">
						{#if section.showReport}
							<a href={`/reports/${section.inventory._id}`} class="mb-3 inline-block">
								<button class="btn btn-sm btn-primary">{section.reportLabel}</button>
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
								{#each section.grouped as row}
									<tr>
										<td>{row.name}</td>
										<td>${row.price}</td>
										<td>
											<div class="flex flex-wrap gap-2">
												{#each row.perContainer as pc}
													<span>{pc.count} x {pc.size}</span>
												{/each}
											</div>
										</td>
										<td class="text-right">{row.total}</td>
									</tr>
								{/each}
							</tbody>
						</table>
						{#if section.showReport}
							<a href={`/reports/${section.inventory._id}`} class="mt-3 inline-block">
								<button class="btn btn-sm btn-primary">{section.reportLabel}</button>
							</a>
						{/if}
					</div>
				{/if}
			</section>
			<div class="divider"></div>
		{/if}
	{/if}

	{#if inventories.close}
		{@const section = renderInventorySection('close', inventories.close, groupedClose, true)}
		{#if section}
			<section class="mb-8">
				<div class="flex justify-between gap-4 mb-3">
					<h3 class="text-lg font-medium flex items-center gap-2">
						<span>{section.label} Inventory</span>
					</h3>
					<a class="btn btn-sm btn-primary" href={`/count/${section.inventory._id}`}>Edit</a>
				</div>
				{#if section.grouped.length === 0}
					<div class="mb-4 alert">
						<span>No counts recorded for this inventory.</span>
					</div>
					<a class="btn btn-sm btn-primary" href={`/count/${section.inventory._id}`}>Start Counting</a>
				{:else}
					<div class="overflow-x-auto">
						{#if section.showReport}
							<a href={`/reports/${section.inventory._id}`} class="mb-3 inline-block">
								<button class="btn btn-sm btn-primary">{section.reportLabel}</button>
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
								{#each section.grouped as row}
									<tr>
										<td>{row.name}</td>
										<td>${row.price}</td>
										<td>
											<div class="flex flex-wrap gap-2">
												{#each row.perContainer as pc}
													<span>{pc.count} x {pc.size}</span>
												{/each}
											</div>
										</td>
										<td class="text-right">{row.total}</td>
									</tr>
								{/each}
							</tbody>
						</table>
						{#if section.showReport}
							<a href={`/reports/${section.inventory._id}`} class="mt-3 inline-block">
								<button class="btn btn-sm btn-primary">{section.reportLabel}</button>
							</a>
						{/if}
					</div>
				{/if}
			</section>
			<div class="divider"></div>
		{/if}
	{/if}

	{#if inventories.spill}
		{@const section = renderInventorySection('spill', inventories.spill, groupedSpill, false)}
		{#if section}
			<section class="mb-8">
				<div class="flex justify-between gap-4 mb-3">
					<h3 class="text-lg font-medium flex items-center gap-2">
						<span>{section.label} Inventory</span>
					</h3>
					<a class="btn btn-sm btn-primary" href={`/count/${section.inventory._id}`}>Edit</a>
				</div>
				{#if section.grouped.length === 0}
					<div class="mb-4 alert">
						<span>No counts recorded for this inventory.</span>
					</div>
					<a class="btn btn-sm btn-primary" href={`/count/${section.inventory._id}`}>Start Counting</a>
				{:else}
					<div class="overflow-x-auto">
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
								{#each section.grouped as row}
									<tr>
										<td>{row.name}</td>
										<td>${row.price}</td>
										<td>
											<div class="flex flex-wrap gap-2">
												{#each row.perContainer as pc}
													<span>{pc.count} x {pc.size}</span>
												{/each}
											</div>
										</td>
										<td class="text-right">{row.total}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</section>
			<div class="divider"></div>
		{/if}
	{/if}

	{#if inventories.intake}
		{@const section = renderInventorySection('intake', inventories.intake, groupedIntake, false)}
		{#if section}
			<section class="mb-8">
				<div class="flex justify-between gap-4 mb-3">
					<h3 class="text-lg font-medium flex items-center gap-2">
						<span>{section.label} Inventory</span>
					</h3>
					<a class="btn btn-sm btn-primary" href={`/count/${section.inventory._id}`}>Edit</a>
				</div>
				{#if section.grouped.length === 0}
					<div class="mb-4 alert">
						<span>No counts recorded for this inventory.</span>
					</div>
					<a class="btn btn-sm btn-primary" href={`/count/${section.inventory._id}`}>Start Counting</a>
				{:else}
					<div class="overflow-x-auto">
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
								{#each section.grouped as row}
									<tr>
										<td>{row.name}</td>
										<td>${row.price}</td>
										<td>
											<div class="flex flex-wrap gap-2">
												{#each row.perContainer as pc}
													<span>{pc.count} x {pc.size}</span>
												{/each}
											</div>
										</td>
										<td class="text-right">{row.total}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</section>
		{/if}
	{/if}
{/if}
