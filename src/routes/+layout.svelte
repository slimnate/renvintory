<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-dvh bg-base-200 text-base-content">
	<header class="border-b bg-base-100">
		<div class="mx-auto navbar max-w-7xl px-4 py-0 sm:px-6 lg:px-8">
			<div class="flex-1">
				<a href="/" class="btn text-lg font-semibold tracking-tight btn-ghost">Renvintory</a>
			</div>
			<div class="flex-none">
				<a class="btn btn-ghost btn-sm" href="/">Home</a>
			</div>
		</div>
	</header>
	<main class="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
		{@render children?.()}
	</main>
	<footer class="border-t bg-base-100">
		<div class="container mx-auto px-4 py-6 text-xs text-base-content/60 sm:px-6 lg:px-8">
			&copy; {new Date().getFullYear()} Renvintory
		</div>
	</footer>
</div>
