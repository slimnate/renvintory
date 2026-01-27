import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';

export const getItemsByLocationId = query({
	args: { locationId: v.id('locations') },
	handler: async (ctx, { locationId }) => {
		const location = await ctx.db.get(locationId);
		if (!location) {
			return [];
		}

		// Fetch items by their IDs from the location's items array
		const items = await Promise.all(
			location.items.map((itemId: Id<'items'>) => ctx.db.get(itemId))
		);

		// Filter out any null items (in case an item was deleted)
		return items.filter((item): item is NonNullable<typeof item> => item !== null);
	}
});

export const getAllItems = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query('items').collect();
	}
});

export const getAllContainers = query({
	args: {},
	handler: async (ctx) => {
		const containers = await ctx.db.query('containers').collect();
		// Sort by type first, then by size
		return containers.sort((a, b) => {
			if (a.type !== b.type) {
				return a.type.localeCompare(b.type);
			}
			return a.size - b.size;
		});
	}
});

export const getLocationsByItemId = query({
	args: { itemId: v.union(v.id('items'), v.null()) },
	handler: async (ctx, { itemId }) => {
		if (!itemId) {
			return [];
		}
		const allLocations = await ctx.db.query('locations').collect();
		return allLocations.filter((location) => location.items.includes(itemId));
	}
});

export const createItem = mutation({
	args: {
		name: v.string(),
		price: v.number(),
		containers: v.optional(v.array(v.id('containers')))
	},
	handler: async (ctx, { name, price, containers }) => {
		const itemId = await ctx.db.insert('items', {
			name,
			price,
			containers: containers ?? []
		});
		return { success: true, itemId };
	}
});

export const updateItem = mutation({
	args: {
		itemId: v.id('items'),
		name: v.optional(v.string()),
		price: v.optional(v.number()),
		containers: v.optional(v.array(v.id('containers')))
	},
	handler: async (ctx, { itemId, name, price, containers }) => {
		const item = await ctx.db.get(itemId);
		if (!item) {
			throw new Error('Item not found');
		}

		const updates: { name?: string; price?: number; containers?: Id<'containers'>[] } = {};
		if (name !== undefined) {
			updates.name = name;
		}
		if (price !== undefined) {
			updates.price = price;
		}
		if (containers !== undefined) {
			updates.containers = containers;
		}

		if (Object.keys(updates).length === 0) {
			throw new Error('No fields to update');
		}

		await ctx.db.patch(itemId, updates);
		return { success: true };
	}
});

export const deleteItem = mutation({
	args: {
		itemId: v.id('items')
	},
	handler: async (ctx, { itemId }) => {
		const item = await ctx.db.get(itemId);
		if (!item) {
			throw new Error('Item not found');
		}

		// Check if item is referenced in any locations
		const locations = await ctx.db.query('locations').collect();
		const isInLocation = locations.some((location) => location.items.includes(itemId));

		if (isInLocation) {
			throw new Error('Cannot delete item: it is assigned to one or more locations');
		}

		// Delete all counts associated with this item
		const counts = await ctx.db
			.query('counts')
			.withIndex('by_item', (q) => q.eq('itemId', itemId))
			.collect();

		for (const count of counts) {
			await ctx.db.delete(count._id);
		}

		await ctx.db.delete(itemId);
		return { success: true };
	}
});
