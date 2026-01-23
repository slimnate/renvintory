<script lang="ts">
	import { toast } from '$lib/stores/toast';

	let toasts = $state<Array<{ id: string; message: string; type: string; duration: number }>>([]);

	$effect(() => {
		const unsubscribe = toast.subscribe((value) => {
			toasts = value;
		});
		return unsubscribe;
	});

	function getToastClass(type: string): string {
		switch (type) {
			case 'success':
				return 'alert-success';
			case 'error':
				return 'alert-error';
			case 'info':
				return 'alert-info';
			default:
				return '';
		}
	}

	function getIcon(type: string) {
		switch (type) {
			case 'success':
				return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
			case 'error':
				return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';
			case 'info':
				return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
			default:
				return '';
		}
	}
</script>

<div class="toast toast-top toast-end z-50">
	{#each toasts as toastItem (toastItem.id)}
		<div
			class="alert {getToastClass(
				toastItem.type
			)} animate-in fade-in slide-in-from-top-2 mb-2 shadow-lg"
			role="alert"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6 shrink-0 stroke-current"
				fill="none"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d={getIcon(toastItem.type)}
				/>
			</svg>
			<span>{toastItem.message}</span>
			<button
				class="btn btn-sm btn-ghost"
				onclick={() => toast.dismiss(toastItem.id)}
				aria-label="Dismiss"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>
	{/each}
</div>
