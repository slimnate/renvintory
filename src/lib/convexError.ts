import { ConvexError } from 'convex/values';

export function getErrorMessage(error: unknown, fallback: string): string {
	if (error instanceof ConvexError && typeof error.data === 'string') {
		return error.data;
	}
	if (error instanceof Error) {
		return error.message;
	}
	return fallback;
}
