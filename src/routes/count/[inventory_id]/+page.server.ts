import type { Actions } from './$types';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../convex/_generated/api';
import { PUBLIC_CONVEX_URL } from '$env/static/public';
import type { Id } from '../../../convex/_generated/dataModel';
import { getErrorMessage } from '$lib/convexError';

export const actions: Actions = {
	increment: async ({ params, request }) => {
		const client = new ConvexHttpClient(PUBLIC_CONVEX_URL);
		const form = await request.formData();
		const inventoryId = params.inventory_id as Id<'inventories'>;
		const itemId = form.get('item_id') as Id<'items'>;
		const containerId = form.get('container_id') as Id<'containers'>;
		const op = (form.get('op') ?? 'inc') as 'inc' | 'dec';

		if (!inventoryId || !itemId || !containerId) {
			return {
				success: false,
				error: 'The tally is missing its mark.'
			};
		}

		try {
			const result = await client.mutation(api.inventories.incrementCount, {
				inventoryId,
				itemId,
				containerId,
				op
			});
			return result;
		} catch (error) {
			return {
				success: false,
				error: getErrorMessage(error, 'The tally could not be marked.')
			};
		}
	}
};
