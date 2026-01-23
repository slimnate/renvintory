<script lang="ts">
	import type { PageData } from './$types';
	import { useQuery } from 'convex-svelte';
	import { api } from '../convex/_generated/api';

	// const { data }: { data: PageData } = $props();
	const locationsQuery = useQuery(api.locations.getLocations);
	const itemsQuery = useQuery(api.items.getAllItems);
	
	const items = $derived(itemsQuery.data ?? []);
</script>

<svelte:head>
    <title>Renvintory</title>
</svelte:head>

<h1 class="mb-6 text-2xl font-semibold tracking-tight">Locations</h1>
{#if locationsQuery.error}
	<div class="mb-4 alert alert-error">
		<span>{locationsQuery.error}</span>
	</div>
{:else if locationsQuery.data && locationsQuery.data.length === 0}
	<div class="mb-4 alert alert-info">
		<span>No locations available.</span>
	</div>
{:else if locationsQuery.data}
	<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each locationsQuery.data as location}
			<li class="card border bg-base-100 shadow-sm transition hover:shadow">
				<a
					class="card-body flex flex-row items-center justify-between gap-4"
					href={`/locations/${location._id}`}
				>
					<span class="card-title text-base">{location.name}</span>
					<span class="btn btn-link btn-sm">View</span>
				</a>
			</li>
		{/each}
	</ul>
{/if}

<section class="mt-12">
	<div class="mb-3 flex items-center justify-between gap-4">
		<h2 class="text-2xl font-semibold tracking-tight">Items</h2>
		<a href="/items" class="btn btn-sm btn-primary">Manage items</a>
	</div>
	{#if itemsQuery.error}
		<div class="mb-4 alert alert-error">
			<span>{itemsQuery.error}</span>
		</div>
	{:else if items.length === 0}
		<div class="mb-4 alert alert-info">
			<span>No items available.</span>
		</div>
	{:else}
		<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each items as item}
				<li class="card border bg-base-100 shadow-sm transition hover:shadow">
					<div class="card-body flex flex-row items-center justify-between gap-4">
						<span class="card-title text-base">{item.name}</span>
						<span class="badge badge-neutral text-right">${item.price}</span>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</section>
