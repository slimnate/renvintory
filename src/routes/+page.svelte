<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let { locations } = data;
</script>

<h1 class="mb-6 text-2xl font-semibold tracking-tight">Locations</h1>
{#if locations.length === 0}
	<div class="alert">
		<span>No locations available.</span>
	</div>
{:else}
	<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each locations as location}
			<li class="card border bg-base-100 shadow-sm transition hover:shadow">
				<a
					class="card-body flex flex-row items-center justify-between gap-4"
					href={`/locations/${location.id}`}
				>
					<span class="card-title text-base">{location.name}</span>
					<span class="btn btn-link btn-sm">View</span>
				</a>
			</li>
		{/each}
	</ul>
{/if}
