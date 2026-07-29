<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../convex/_generated/api';
	import { emblemFor } from '$lib/emblems';
	import Emblem from '$lib/components/Emblem.svelte';

	const locationsQuery = useQuery(api.locations.getLocations);
	const itemsQuery = useQuery(api.items.getAllItems);

	const items = $derived(itemsQuery.data ?? []);
</script>

<svelte:head>
	<title>Renvintory</title>
</svelte:head>

<section class="mb-10 pt-6">
	<div class="mb-3 bg-gules px-3 pt-1.5 pb-3.5 text-center shadow-md banner">
		<span class="font-display text-xs font-bold tracking-[0.25em] text-goldleaf uppercase"
			>Houses</span
		>
	</div>
	{#if locationsQuery.error}
		<div class="mb-4 alert alert-error">
			<span
				>{locationsQuery.error instanceof Error
					? locationsQuery.error.message
					: String(locationsQuery.error)}</span
			>
		</div>
	{:else if locationsQuery.data && locationsQuery.data.length === 0}
		<div class="mb-4 alert alert-info">
			<span>No houses have been raised yet.</span>
		</div>
	{:else if locationsQuery.data}
		<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each locationsQuery.data as location}
				<li class="rounded-sm border-2 border-goldleaf/70 painted shadow-lg carved">
					<a class="flex items-center gap-3 p-3" href={`/locations/${location._id}`}>
						<Emblem id={emblemFor(location._id, location.name)} class="h-14 w-12 shrink-0" />
						<span class="min-w-0 flex-1">
							<span class="block font-display text-lg leading-tight font-bold">{location.name}</span
							>
						</span>
						<span class="text-xl text-gules">&rsaquo;</span>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<section>
	<div class="mb-3 flex items-center justify-between gap-4">
		<div class="flex-1 bg-gules px-3 pt-1.5 pb-3.5 text-center shadow-md banner">
			<span class="font-display text-xs font-bold tracking-[0.25em] text-goldleaf uppercase"
				>Wares</span
			>
		</div>
		<a href="/items" class="btn shrink-0 btn-sm btn-primary">Manage Wares</a>
	</div>
	{#if itemsQuery.error}
		<div class="mb-4 alert alert-error">
			<span
				>{itemsQuery.error instanceof Error
					? itemsQuery.error.message
					: String(itemsQuery.error)}</span
			>
		</div>
	{:else if items.length === 0}
		<div class="mb-4 alert alert-info">
			<span>No wares in the ledger.</span>
		</div>
	{:else}
		<ul
			class="divide-y divide-oak/20 rounded-sm border-2 border-goldleaf/60 painted shadow-lg carved"
		>
			{#each items as item}
				<li class="flex items-center justify-between px-4 py-3">
					<span class="font-display font-bold">{item.name}</span>
					<span class="font-num text-sm font-semibold text-azure">${item.price}</span>
				</li>
			{/each}
		</ul>
	{/if}
</section>
