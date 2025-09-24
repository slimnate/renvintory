<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	let { data, form }: { data: PageData; form: any } = $props();
	let { location, items } = data;

	const inventories = $derived(data.inventories);
</script>

{#if !location}
	<h2 class="text-xl font-semibold">Location not found</h2>
{:else}
	<div class="mb-6 flex items-center gap-4">
		<a href="/" class="link text-sm link-hover">← Back</a>
		<h2 class="text-2xl font-semibold tracking-tight">{location.name}</h2>
	</div>

	<section class="mb-8">
		<div class="mb-3 flex items-center justify-between gap-4">
			<h3 class="text-lg font-medium">Inventories</h3>
			<form method="POST" action="?/createInventory" use:enhance>
				<button type="submit" class="btn btn-sm btn-primary">New inventory</button>
			</form>
		</div>
		{#if form?.success}
			<div class="mb-3 alert alert-success">
				<span>Inventory created successfully.</span>
			</div>
		{:else if form?.error}
			<div class="mb-3 alert alert-error">
				<span>{form.error}</span>
			</div>
		{/if}
		{#if inventories.length === 0}
			<p class="text-gray-600">No inventories yet.</p>
		{:else}
			<ul class="w-full rounded-box border bg-base-100 shadow-sm">
				{#each inventories as inv}
					<li class="flex flex-row items-center justify-between gap-4 p-2 px-4">
						<span>
							<span class="font-medium">{inv.date}</span>
							{#if inv.time_of_day}
								<span class="ml-2 opacity-70">{inv.time_of_day}</span>
							{/if}
						</span>
						<a class="" href={`/inventories/${inv.id}`}>
							<span class="btn btn-outline">View</span>
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<section>
		<h3 class="mb-3 text-lg font-medium">Available items</h3>
		{#if items.length === 0}
			<div class="alert">
				<span>No items configured for this location.</span>
			</div>
		{:else}
			<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each items as item}
					<li class="card border bg-base-100 shadow-sm">
						<div class="card-body flex flex-row items-center justify-between gap-4">
							<span class="card-title text-base">{item.name}</span>
							<span class="badge badge-neutral">${item.price}</span>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
{/if}
