import type { Actions } from './$types';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';
import { PUBLIC_CONVEX_URL } from '$env/static/public';
import type { Id } from '../../convex/_generated/dataModel';

export const actions: Actions = {
	createItem: async ({ request }) => {
		const client = new ConvexHttpClient(PUBLIC_CONVEX_URL);
		const form = await request.formData();
		const name = form.get('name') as string;
		const priceStr = form.get('price') as string;

		if (!name || !priceStr) {
			return {
				op: 'createItem',
				success: false,
				error: 'Name and price are required'
			};
		}

		const price = parseFloat(priceStr);
		if (isNaN(price) || price < 0) {
			return {
				op: 'createItem',
				success: false,
				error: 'Price must be a valid positive number'
			};
		}

		try {
			await client.mutation(api.items.createItem, {
				name,
				price
			});
			return { op: 'createItem', success: true };
		} catch (error) {
			return {
				op: 'createItem',
				success: false,
				error: error instanceof Error ? error.message : 'Failed to create item'
			};
		}
	},
	updateItem: async ({ request }) => {
		const client = new ConvexHttpClient(PUBLIC_CONVEX_URL);
		const form = await request.formData();
		const itemId = form.get('itemId') as Id<"items">;
		const name = form.get('name') as string;
		const priceStr = form.get('price') as string;

		if (!itemId) {
			return {
				op: 'updateItem',
				success: false,
				error: 'Item ID is required'
			};
		}

		const updates: { name?: string; price?: number } = {};
		if (name !== null && name !== undefined && name !== '') {
			updates.name = name;
		}
		if (priceStr !== null && priceStr !== undefined && priceStr !== '') {
			const price = parseFloat(priceStr);
			if (isNaN(price) || price < 0) {
				return {
					op: 'updateItem',
					success: false,
					error: 'Price must be a valid positive number'
				};
			}
			updates.price = price;
		}

		if (Object.keys(updates).length === 0) {
			return {
				op: 'updateItem',
				success: false,
				error: 'At least one field (name or price) must be provided'
			};
		}

		try {
			await client.mutation(api.items.updateItem, {
				itemId,
				...updates
			});
			return { op: 'updateItem', success: true };
		} catch (error) {
			return {
				op: 'updateItem',
				success: false,
				error: error instanceof Error ? error.message : 'Failed to update item'
			};
		}
	},
	deleteItem: async ({ request }) => {
		const client = new ConvexHttpClient(PUBLIC_CONVEX_URL);
		const form = await request.formData();
		const itemId = form.get('itemId') as Id<"items">;

		if (!itemId) {
			return {
				op: 'deleteItem',
				success: false,
				error: 'Item ID is required'
			};
		}

		try {
			await client.mutation(api.items.deleteItem, {
				itemId
			});
			return { op: 'deleteItem', success: true };
		} catch (error) {
			return {
				op: 'deleteItem',
				success: false,
				error: error instanceof Error ? error.message : 'Failed to delete item'
			};
		}
	}
};
