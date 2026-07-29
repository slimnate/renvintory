<script lang="ts">
	import type { EmblemId } from '$lib/emblems';

	let { id, class: className = 'h-14 w-12' }: { id: EmblemId; class?: string } = $props();

	const field: Record<EmblemId, string> = {
		dragon: '#8c2318',
		wizard: '#26456e',
		boar: '#3f6b4a',
		mullet: '#1e3558',
		crown: '#7a1f16',
		tankard: '#6a1810'
	};

	const clipId = `field-${id}-${Math.random().toString(36).slice(2, 9)}`;
</script>

<svg class={className} viewBox="0 0 64 64" aria-hidden="true">
	<defs>
		<clipPath id={clipId}>
			<path d="M32 54C22 48 13.5 40.5 13.5 28.5V13h37v15.5c0 12-8.5 19.5-18.5 25.5z" />
		</clipPath>
	</defs>

	<!-- outer bronze edge -->
	<path fill="#8a6a14" d="M32 63C17.5 54.5 5 44 5 27.5V5h54v22.5C59 44 46.5 54.5 32 63z" />
	<!-- gold rim face -->
	<path fill="#d4af37" d="M32 61C18.5 53 7.5 43 7.5 28V7.5h49V28c0 15-11 25-24.5 33z" />
	<!-- top highlight -->
	<path fill="#f0d97a" opacity="0.65" d="M9 8.5h46v3.5H9z" />
	<!-- inner recess -->
	<path fill="#a8821b" d="M32 56.5C21.5 50 12 41.5 12 28.5V11.5h40v17c0 13-9.5 21.5-20 28z" />
	<!-- field -->
	<path
		fill={field[id]}
		d="M32 54C22 48 13.5 40.5 13.5 28.5V13h37v15.5c0 12-8.5 19.5-18.5 25.5z"
	/>
	<!-- tip shade -->
	<path
		fill="#000"
		opacity="0.2"
		d="M32 54C22 48 13.5 40.5 13.5 37c5 3 11 7.5 18.5 11.5 7.5-4 13.5-8.5 18.5-11.5 0 3.5-8.5 11-18.5 17z"
	/>

	<!-- rim rivets -->
	<g fill="#f0d97a">
		<circle cx="12" cy="12" r="1.35" />
		<circle cx="32" cy="10.2" r="1.35" />
		<circle cx="52" cy="12" r="1.35" />
		<circle cx="10.5" cy="28" r="1.25" />
		<circle cx="53.5" cy="28" r="1.25" />
		<circle cx="16" cy="44" r="1.2" />
		<circle cx="48" cy="44" r="1.2" />
		<circle cx="32" cy="57.5" r="1.2" />
	</g>
	<g fill="#8a6a14" opacity="0.55">
		<circle cx="12" cy="12" r="0.45" />
		<circle cx="32" cy="10.2" r="0.45" />
		<circle cx="52" cy="12" r="0.45" />
		<circle cx="10.5" cy="28" r="0.4" />
		<circle cx="53.5" cy="28" r="0.4" />
		<circle cx="16" cy="44" r="0.4" />
		<circle cx="48" cy="44" r="0.4" />
		<circle cx="32" cy="57.5" r="0.4" />
	</g>

	<!-- charges clipped to field -->
	<g clip-path="url(#{clipId})">
		{#if id === 'dragon'}
			<g fill="#f0d97a">
				<!-- bat wing (behind) -->
				<path
					d="M28 30c2-8 8-14 16-16 1 5-1 10-4 14 4-1 8 1 10 5-6 1-11 0-15-2-3 1-5.5 3-7 6 0-3 0-5 0-7z"
				/>
				<!-- wing ribs -->
				<path
					d="M32 24l8-4M31 28l10-2M30 32l10 1"
					fill="none"
					stroke={field.dragon}
					stroke-width="1.3"
					stroke-linecap="round"
					opacity="0.55"
				/>
				<!-- body -->
				<path d="M20 34c3-5 8-8 14-8 3 3 4 8 3 13-6 1-11 0-15-3-1-1-2-1.5-2-2z" />
				<!-- neck + head -->
				<path d="M34 26c2-4 5-7 9-8 2 2 2 5 1 7l-4 3c-2 0-4-1-6-2z" />
				<path d="M42 18c2-2 5-3 7-2l2 3.5-4.5 1.5c-1.5 0-3.5-.5-4.5-3z" />
				<!-- jaws -->
				<path d="M48 20.5l6 .8-1.5 2.2-5-.5z" />
				<path d="M47.5 23l5 2.5-5.5.8z" />
				<!-- horns + crest -->
				<path d="M43 16.5l-1-3.5 3 1.5M46.5 15.5l1-3.5 2 2.5M41 19l-2.5-2.5 3 .5" />
				<!-- eye -->
				<circle cx="45.5" cy="19" r="1.1" fill={field.dragon} />
				<!-- foreleg -->
				<path d="M30 37l-2.5 8 3 .5 2-6.5z" />
				<!-- hindleg -->
				<path d="M23 38l-3 8 3.2.6 2.2-6.5z" />
				<!-- curling tail -->
				<path
					d="M20 36c-4 1-7 5-5 9 2-2 5-2 6-4-.5 3-2 5-4.5 6 5 0 8.5-4 7.5-8z"
				/>
			</g>
		{:else if id === 'wizard'}
			<g fill="#f0d97a">
				<path d="M32 14l11 22H21z" />
				<path d="M14 36h36l-3.5 4.5H17.5z" />
				<rect x="23" y="29" width="18" height="3.5" fill={field.wizard} />
				<circle cx="32" cy="30.75" r="1.5" fill="#f0d97a" />
				<path d="M32 9l1.5 3.2h3.4l-2.7 2.1 1 3.3L32 15.5l-3.2 2.1 1-3.3-2.7-2.1h3.4z" />
				<path d="M16 20l1.1 2.4h2.5l-2 1.6.7 2.5-2.3-1.5-2.3 1.5.7-2.5-2-1.6h2.5z" />
				<path d="M47 21l1 2.1h2.2l-1.8 1.4.6 2.2-2-1.3-2 1.3.6-2.2-1.8-1.4h2.2z" />
				<rect x="47.5" y="18" width="2.2" height="26" rx="1" />
				<circle cx="48.6" cy="16.2" r="2.8" />
				<circle cx="48.6" cy="16.2" r="1.2" fill={field.wizard} />
			</g>
		{:else if id === 'boar'}
			<g fill="#f0d97a">
				<!-- erased neck -->
				<path d="M14 42c2.5-6 7-11 13-13 0 4 2 8 5 10-5.5 2-11 4.5-15.5 8-1.5-1-2.5-3-2.5-5z" />
				<!-- head -->
				<path
					d="M22 25c6-9 17-11 26-6 3.5 1.5 5.5 4.5 5.5 8 0 5.5-3.5 9-9 11-4.5 1.5-10 1.5-15.5 0-5.5-1.5-9-7-7-13z"
				/>
				<!-- snout -->
				<path d="M45 30c4.5.5 8 2 10 4.5 1 1.3.6 3.2-1.2 4H45c0-2.5 0-6 0-8.5z" />
				<circle cx="52" cy="36" r="1" fill={field.boar} />
				<circle cx="49.5" cy="36.5" r="0.9" fill={field.boar} />
				<!-- tusk -->
				<path d="M43 36c3.5 1.5 7.5 0 10.5-3-3.5 4.5-8.5 6-12 5z" />
				<!-- ear -->
				<path d="M28 18c-1.5-5 2-9.5 6.5-10.5-1.5 4.5-1 8 1 11z" />
				<!-- eye -->
				<circle cx="36.5" cy="28" r="1.8" fill={field.boar} />
				<path d="M32.5 25h8l-1 1.8h-6z" opacity="0.75" />
				<!-- bristles -->
				<path
					d="M23 23l-3.5-5 5.5 2.5M29 18.5l-1.5-5 4.5 3M19 29l-5-3.5 4.5 5.5"
					fill="none"
					stroke="#f0d97a"
					stroke-width="1.6"
					stroke-linecap="round"
				/>
			</g>
		{:else if id === 'mullet'}
			<g fill="#f0d97a">
				<path
					fill-rule="evenodd"
					d="M32 12l5.6 15.2H54L41.2 36.8l4.4 15.2L32 42.4 18.4 52l4.4-15.2L10 27.2h16.4zm0 11a7.2 7.2 0 1 0 0 14.4 7.2 7.2 0 0 0 0-14.4z"
				/>
			</g>
		{:else if id === 'crown'}
			<g fill="#f0d97a">
				<path d="M14 38h36v6.5c0 2-2 3.5-4 3.5H18c-2 0-4-1.5-4-3.5z" />
				<circle cx="21" cy="41.5" r="1.8" fill={field.crown} />
				<circle cx="32" cy="41.5" r="1.8" fill={field.crown} />
				<circle cx="43" cy="41.5" r="1.8" fill={field.crown} />
				<path d="M16 38V23l8.5 8.5L32 14l7.5 17.5L48 23v15z" />
				<circle cx="16" cy="21.5" r="2.3" />
				<circle cx="32" cy="12.5" r="2.6" />
				<circle cx="48" cy="21.5" r="2.3" />
				<path fill={field.crown} d="M30.7 17h2.6v7.5h-2.6z" />
				<path fill={field.crown} d="M28 19.5h8v2.5h-8z" />
			</g>
		{:else if id === 'tankard'}
			<g fill="#f0d97a">
				<path d="M20 16h20l1.8 3.5H18.2z" />
				<circle cx="38.5" cy="17.5" r="1.6" />
				<path d="M21.5 19.5h17v19.5a5 5 0 0 1-5 5h-7a5 5 0 0 1-5-5z" />
				<rect x="21.5" y="25" width="17" height="2" fill={field.tankard} opacity="0.5" />
				<rect x="21.5" y="32" width="17" height="2" fill={field.tankard} opacity="0.5" />
				<path d="M23.5 44h13v3H23.5z" />
			</g>
			<path
				d="M38.5 23.5h3.2a6.5 6.5 0 0 1 0 13h-3.2"
				fill="none"
				stroke="#f0d97a"
				stroke-width="3.2"
			/>
		{/if}
	</g>
</svg>
