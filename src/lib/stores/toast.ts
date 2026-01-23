import { writable } from 'svelte/store';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
	id: string;
	message: string;
	type: ToastType;
	duration: number;
}

const toasts = writable<Toast[]>([]);

function createToast(message: string, type: ToastType, duration: number = 5000): void {
	const id = crypto.randomUUID();
	const toast: Toast = { id, message, type, duration };

	toasts.update((current) => [...current, toast]);

	// Auto-dismiss after duration
	setTimeout(() => {
		removeToast(id);
	}, duration);
}

function removeToast(id: string): void {
	toasts.update((current) => current.filter((t) => t.id !== id));
}

export const toast = {
	success: (message: string, duration: number = 4000) => createToast(message, 'success', duration),
	error: (message: string, duration: number = 6000) => createToast(message, 'error', duration),
	info: (message: string, duration: number = 5000) => createToast(message, 'info', duration),
	dismiss: (id: string) => removeToast(id),
	subscribe: toasts.subscribe
};
