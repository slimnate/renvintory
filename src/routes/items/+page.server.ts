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

		// Parse container IDs from form data
		const containerIds: Id<'containers'>[] = [];
		const containerIdValues = form.getAll('containerIds');
		for (const id of containerIdValues) {
			if (id && typeof id === 'string') {
				containerIds.push(id as Id<'containers'>);
			}
		}

		// Handle new container creation
		const newContainerSizeStr = form.get('newContainerSize') as string;
		const newContainerType = form.get('newContainerType') as 'can' | 'bottle' | 'cup' | null;
		if (newContainerSizeStr && newContainerType) {
			const newContainerSize = parseFloat(newContainerSizeStr);
			if (!isNaN(newContainerSize) && newContainerSize > 0) {
				try {
					const result = await client.mutation(api.containers.createContainer, {
						size: newContainerSize,
						type: newContainerType
					});
					if (result.containerId) {
						containerIds.push(result.containerId);
					}
				} catch (error) {
					return {
						op: 'createItem',
						success: false,
						error: error instanceof Error ? error.message : 'Failed to create container'
					};
				}
			}
		}

		try {
			await client.mutation(api.items.createItem, {
				name,
				price,
				containers: containerIds
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
		const itemId = form.get('itemId') as Id<'items'>;
		const name = form.get('name') as string;
		const priceStr = form.get('price') as string;

		if (!itemId) {
			return {
				op: 'updateItem',
				success: false,
				error: 'Item ID is required'
			};
		}

		const updates: { name?: string; price?: number; containers?: Id<'containers'>[] } = {};
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

		// Parse container IDs from form data
		const containerIds: Id<'containers'>[] = [];
		const containerIdValues = form.getAll('containerIds');
		for (const id of containerIdValues) {
			if (id && typeof id === 'string') {
				containerIds.push(id as Id<'containers'>);
			}
		}

		// Handle new container creation
		const newContainerSizeStr = form.get('newContainerSize') as string;
		const newContainerType = form.get('newContainerType') as 'can' | 'bottle' | 'cup' | null;
		if (newContainerSizeStr && newContainerType) {
			const newContainerSize = parseFloat(newContainerSizeStr);
			if (!isNaN(newContainerSize) && newContainerSize > 0) {
				try {
					const result = await client.mutation(api.containers.createContainer, {
						size: newContainerSize,
						type: newContainerType
					});
					if (result.containerId) {
						containerIds.push(result.containerId);
					}
				} catch (error) {
					return {
						op: 'updateItem',
						success: false,
						error: error instanceof Error ? error.message : 'Failed to create container'
					};
				}
			}
		}

		// Always update containers if provided (even if empty array)
		if (form.has('containerIds') || (newContainerSizeStr && newContainerType)) {
			updates.containers = containerIds;
		}

		if (Object.keys(updates).length === 0) {
			return {
				op: 'updateItem',
				success: false,
				error: 'At least one field (name, price, or containers) must be provided'
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
		const itemId = form.get('itemId') as Id<'items'>;

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
	},
	createContainer: async ({ request }) => {
		const client = new ConvexHttpClient(PUBLIC_CONVEX_URL);
		const form = await request.formData();
		const sizeStr = form.get('size') as string;
		const type = form.get('type') as 'can' | 'bottle' | 'cup' | null;

		if (!sizeStr || !type) {
			return {
				op: 'createContainer',
				success: false,
				error: 'Size and type are required'
			};
		}

		const size = parseFloat(sizeStr);
		if (isNaN(size) || size <= 0) {
			return {
				op: 'createContainer',
				success: false,
				error: 'Size must be a valid positive number'
			};
		}

		if (type !== 'can' && type !== 'bottle' && type !== 'cup') {
			return {
				op: 'createContainer',
				success: false,
				error: 'Type must be can, bottle, or cup'
			};
		}

		try {
			const result = await client.mutation(api.containers.createContainer, {
				size,
				type
			});
			return { op: 'createContainer', success: true, containerId: result.containerId };
		} catch (error) {
			return {
				op: 'createContainer',
				success: false,
				error: error instanceof Error ? error.message : 'Failed to create container'
			};
		}
	}
};
