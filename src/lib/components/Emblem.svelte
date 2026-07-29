<script lang="ts">
	import type { EmblemId } from '$lib/emblems';
	let { id, class: className = 'h-7 w-7' }: { id: EmblemId; class?: string } = $props();
</script>

<svg class={className} viewBox="0 0 64 64" fill="currentColor" aria-hidden="true">
	{#if id === 'dragon'}
		<path
			d="M8 47C12 31 22 22 34 20c2-6 6-10 10-12-1 5-1 8 1 11 7 3 11 11 11 19-4-4-8-5-12-4 3 4 3 9 1 13-4-5-9-7-15-6-8 1-14 3-22 6z"
		/>
	{:else if id === 'wizard'}
		<path d="M32 5l15 39H17z" />
		<ellipse cx="32" cy="46" rx="24" ry="6" />
	{:else if id === 'boar'}
		<path d="M13 23L8 7l19 9zM51 23l5-16-19 9z" />
		<ellipse cx="32" cy="37" rx="22" ry="19" />
	{:else if id === 'mullet'}
		<path d="M32 6l7 19h20L43 37l6 19-17-12-17 12 6-19L5 25h20z" />
	{:else if id === 'crown'}
		<path d="M8 44V20l12 10 12-16 12 16 12-10v24z" />
	{:else if id === 'tankard'}
		<path d="M14 18h26v30a6 6 0 0 1-6 6H20a6 6 0 0 1-6-6z" />
		<path d="M42 24h6a8 8 0 0 1 0 16h-6z" />
	{/if}
</svg>
