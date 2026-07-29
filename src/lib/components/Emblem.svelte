<script lang="ts">
	import type { EmblemId } from '$lib/emblems';

	let { id, class: className = 'h-14 w-12' }: { id: EmblemId; class?: string } = $props();

	const field: Record<EmblemId, string> = {
		dragon: '#8c2318',
		wizard: '#26456e',
		pig: '#3f6b4a',
		mullet: '#1e3558',
		crown: '#7a1f16',
		tankard: '#6a1810'
	};

	const uid = $props.id();
	const clipId = `emblem-field-${uid}`;
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
	<path fill={field[id]} d="M32 54C22 48 13.5 40.5 13.5 28.5V13h37v15.5c0 12-8.5 19.5-18.5 25.5z" />
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
			<!-- dragon's head erased, facing dexter -->
			<g fill="#f0d97a">
				<!-- horns swept back -->
				<path d="M39.5 19.5L48.5 14.5 43.5 22.5z" />
				<path d="M34 17.5L38.5 13.6 37.5 20z" />
				<!-- neck frill spikes -->
				<path d="M45 26.5L49.5 25.5 46 30.5z" />
				<path d="M44.5 33L48.5 34.5 43.5 37.5z" />
				<!-- skull -->
				<path
					d="M30 19c8-1.5 15 2 16.5 9.5 1 6.5-3 11-9.5 10.5-5-.5-9-3.5-10.5-7.5-1-4 0-9 3.5-12z"
				/>
				<!-- upper snout -->
				<path d="M28 23.5L14 29.5l.8 3.1 13.7.9c2-3.5 2-7.5 0-10z" />
				<!-- lower jaw -->
				<path d="M17.5 35l10.5 1c3 2 6 3 9 2.5l-1 3.5c-6 .5-13-1.5-17.5-4.5z" />
				<!-- chin spike -->
				<path d="M19.5 37.5L16.8 41 23 39.8z" />
				<!-- fangs -->
				<path d="M18 32.8l1.6 3.4 1.4-3.3z" />
				<path d="M23.5 33.2l1.4 3.2 1.3-3.1z" />
				<path d="M30.5 36.8l1.1-2.8 1.4 3.4z" />
			</g>
			<!-- brow -->
			<path
				d="M29.5 22.5c3-1.5 6.5-1.5 9 0"
				fill="none"
				stroke={field.dragon}
				stroke-width="1.5"
				stroke-linecap="round"
			/>
			<!-- eye -->
			<circle cx="34" cy="26" r="2.5" fill={field.dragon} />
			<circle cx="34" cy="26" r="0.9" fill="#f0d97a" />
			<!-- nostril -->
			<ellipse cx="18.5" cy="30.2" rx="1.7" ry="1.2" fill={field.dragon} />
			<!-- scales on the cheek -->
			<path
				d="M37 30h5M36.5 33h5"
				fill="none"
				stroke={field.dragon}
				stroke-width="1.1"
				stroke-linecap="round"
				opacity="0.45"
			/>
		{:else if id === 'wizard'}
			<!-- wizard's hat -->
			<g fill="#f0d97a">
				<!-- cone with a drooping tip -->
				<path
					d="M24 34.5c1-8 4-15 10-20 2.5-2.5 6-1.5 7.5 1-2.5 1.5-4.5 3.5-5.5 6 2.5 4 4 8 4 13z"
				/>
				<!-- brim -->
				<ellipse cx="32" cy="36.5" rx="17" ry="4.2" />
			</g>
			<!-- band and buckle -->
			<rect x="24" y="30" width="16.5" height="4" fill={field.wizard} />
			<circle cx="32" cy="32" r="1.9" fill="#f0d97a" />
			<!-- star punched into the cone -->
			<path
				fill={field.wizard}
				d="M31.5 22l1 2.2h2.3l-1.9 1.5.7 2.3-2.1-1.4-2.1 1.4.7-2.3-1.9-1.5h2.3z"
			/>
			<!-- attendant stars -->
			<g fill="#f0d97a">
				<path d="M45.5 20l1.2 2.5h2.6l-2.1 1.7.8 2.6-2.5-1.5-2.5 1.5.8-2.6-2.1-1.7h2.6z" />
				<path d="M19 21l1 2.2h2.3l-1.9 1.5.7 2.3-2.1-1.4-2.1 1.4.7-2.3-1.9-1.5h2.3z" />
			</g>
		{:else if id === 'pig'}
			<!-- pig's head caboshed -->
			<g fill="#f0d97a">
				<!-- ears -->
				<path d="M20.5 23L16.5 13.5 27.5 18.5z" />
				<path d="M43.5 23L47.5 13.5 36.5 18.5z" />
				<!-- head -->
				<path d="M32 17.5c9.5 0 15 5.5 15 13.5s-6.5 15-15 15-15-6-15-15 5.5-13.5 15-13.5z" />
			</g>
			<!-- eyes -->
			<circle cx="24.5" cy="27" r="2.1" fill={field.pig} />
			<circle cx="39.5" cy="27" r="2.1" fill={field.pig} />
			<!-- snout -->
			<ellipse
				cx="32"
				cy="36"
				rx="9.5"
				ry="6.4"
				fill="#f0d97a"
				stroke={field.pig}
				stroke-width="1.5"
			/>
			<ellipse cx="28.6" cy="36" rx="1.5" ry="2.3" fill={field.pig} />
			<ellipse cx="35.4" cy="36" rx="1.5" ry="2.3" fill={field.pig} />
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
