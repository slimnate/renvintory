<script lang="ts">
	import '@fontsource-variable/cinzel';
	import '@fontsource-variable/eb-garamond';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { PUBLIC_CONVEX_URL } from '$env/static/public';
	import { setupConvex } from 'convex-svelte';
	import Toast from '$lib/components/Toast.svelte';

	const { children } = $props();

	setupConvex(PUBLIC_CONVEX_URL);
</script>

<svelte:head>
	<link rel="icon" href={favicon} type="image/svg+xml" />
	<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
</svelte:head>

<div class="min-h-dvh wood text-base-content">
	<header class="sticky top-0 z-40 border-b-2 border-goldleaf/60 boardface carved">
		<div class="mx-auto navbar max-w-7xl px-4 py-0 sm:px-6 lg:px-8">
			<div class="flex-1">
				<a href="/" class="gilt font-display text-xl font-bold tracking-[0.15em] uppercase">
					Renvintory
				</a>
			</div>
			<div class="flex-none">
				<a class="btn text-cream/70 btn-ghost btn-sm" href="/">Houses</a>
			</div>
		</div>
	</header>
	<main class="container mx-auto px-4 pt-0 pb-32 sm:px-6 lg:px-8">
		{@render children?.()}
	</main>

	<Toast />
</div>
