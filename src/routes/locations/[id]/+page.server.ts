import type { Actions } from './$types';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../convex/_generated/api';
import { PUBLIC_CONVEX_URL } from '$env/static/public';
import type { Id } from '../../../convex/_generated/dataModel';

export const actions: Actions = {
	createInventory: async ({ params }) => {
		const client = new ConvexHttpClient(PUBLIC_CONVEX_URL);
		const locationId = params.id as Id<"locations">;
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
				error: error instanceof Error ? error.message : 'Failed to create inventory'
			};
		}
	},
	deleteInventory: async ({ request }) => {
		const client = new ConvexHttpClient(PUBLIC_CONVEX_URL);
		const form = await request.formData();
		const inventoryId = form.get('id') as Id<"inventories">;

		if (!inventoryId) {
			return {
				op: 'deleteInventory',
				success: false,
				error: 'Inventory ID is required'
			};
		}

		try {
			await client.mutation(api.inventories.deleteInventory, {
				inventoryId
			});
			return { op: 'deleteInventory', success: true };
		} catch (error) {
			return {
				op: 'deleteInventory',
				success: false,
				error: error instanceof Error ? error.message : 'Failed to delete inventory'
			};
		}
	},
	removeItem: async ({ params, request }) => {
		const client = new ConvexHttpClient(PUBLIC_CONVEX_URL);
		const form = await request.formData();
		const locationId = params.id as Id<"locations">;
		const itemId = form.get('itemId') as Id<"items">;

		if (!itemId) {
			return {
				op: 'removeItem',
				success: false,
				error: 'Item ID is required'
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
				error: error instanceof Error ? error.message : 'Failed to remove item'
			};
		}
	},
	addItem: async ({ params, request }) => {
		const client = new ConvexHttpClient(PUBLIC_CONVEX_URL);
		const form = await request.formData();
		const locationId = params.id as Id<"locations">;
		const itemId = form.get('itemId') as Id<"items">;

		if (!itemId) {
			return {
				op: 'addItem',
				success: false,
				error: 'Item ID is required'
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
				error: error instanceof Error ? error.message : 'Failed to add item'
			};
		}
	}
};
