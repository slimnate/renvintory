import type { Actions } from './$types';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../convex/_generated/api';
import { PUBLIC_CONVEX_URL } from '$env/static/public';
import type { Id } from '../../../convex/_generated/dataModel';
import { getErrorMessage } from '$lib/convexError';

export const actions: Actions = {
	createInventory: async ({ params }) => {
		const client = new ConvexHttpClient(PUBLIC_CONVEX_URL);
		const locationId = params.id as Id<'locations'>;
		const now = new Date();
		const date = now.toISOString().slice(0, 10);

		try {
			await client.mutation(api.inventories.createInventory, {
				locationId,
				date
			});
			return { op: 'createInventory', success: true };
		} catch (error) {
			return {
				op: 'createInventory',
				success: false,
				error: getErrorMessage(error, 'The reckoning could not be begun.')
			};
		}
	},
	deleteInventory: async ({ params, request }) => {
		const client = new ConvexHttpClient(PUBLIC_CONVEX_URL);
		const form = await request.formData();
		const locationId = params.id as Id<'locations'>;
		const date = form.get('date') as string;

		if (!date) {
			return {
				op: 'deleteInventory',
				success: false,
				error: 'A day must be named.'
			};
		}

		try {
			await client.mutation(api.inventories.deleteInventoriesByDate, {
				locationId,
				date
			});
			return { op: 'deleteInventory', success: true };
		} catch (error) {
			return {
				op: 'deleteInventory',
				success: false,
				error: getErrorMessage(error, 'The reckonings could not be struck from the record.')
			};
		}
	},
	removeItem: async ({ params, request }) => {
		const client = new ConvexHttpClient(PUBLIC_CONVEX_URL);
		const form = await request.formData();
		const locationId = params.id as Id<'locations'>;
		const itemId = form.get('itemId') as Id<'items'>;

		if (!itemId) {
			return {
				op: 'removeItem',
				success: false,
				error: 'A ware must be chosen.'
			};
		}

		try {
			await client.mutation(api.locations.removeItemFromLocation, {
				locationId,
				itemId
			});
			return { op: 'removeItem', success: true };
		} catch (error) {
			return {
				op: 'removeItem',
				success: false,
				error: getErrorMessage(error, 'The ware could not be removed.')
			};
		}
	},
	addItem: async ({ params, request }) => {
		const client = new ConvexHttpClient(PUBLIC_CONVEX_URL);
		const form = await request.formData();
		const locationId = params.id as Id<'locations'>;
		const itemId = form.get('itemId') as Id<'items'>;

		if (!itemId) {
			return {
				op: 'addItem',
				success: false,
				error: 'A ware must be chosen.'
			};
		}

		try {
			await client.mutation(api.locations.addItemToLocation, {
				locationId,
				itemId
			});
			return { op: 'addItem', success: true };
		} catch (error) {
			return {
				op: 'addItem',
				success: false,
				error: getErrorMessage(error, 'The ware could not be stocked.')
			};
		}
	}
};
