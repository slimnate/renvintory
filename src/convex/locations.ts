import { query, mutation } from './_generated/server';
import { ConvexError, v } from 'convex/values';
import type { Id } from './_generated/dataModel';

export const getLocations = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query('locations').collect();
	}
});

export const getLocationById = query({
	args: { id: v.id('locations') },
	handler: async (ctx, { id }) => {
		return await ctx.db
			.query('locations')
			.filter((q) => q.eq(q.field('_id'), id))
			.first();
	}
});

export const removeItemFromLocation = mutation({
	args: {
		locationId: v.id('locations'),
		itemId: v.id('items')
	},
	handler: async (ctx, { locationId, itemId }) => {
		const location = await ctx.db.get(locationId);
		if (!location) {
			throw new ConvexError('No such house.');
		}

		const updatedItems = location.items.filter((id: Id<'items'>) => id !== itemId);
		await ctx.db.patch(locationId, { items: updatedItems });

		return { success: true };
	}
});

export const addItemToLocation = mutation({
	args: {
		locationId: v.id('locations'),
		itemId: v.id('items')
	},
	handler: async (ctx, { locationId, itemId }) => {
		const location = await ctx.db.get(locationId);
		if (!location) {
			throw new ConvexError('No such house.');
		}

		// Check if item already exists in location
		if (location.items.includes(itemId)) {
			throw new ConvexError('That ware is already stocked in this house.');
		}

		// Verify item exists
		const item = await ctx.db.get(itemId);
		if (!item) {
			throw new ConvexError('No such ware in the ledger.');
		}

		const updatedItems = [...location.items, itemId];
		await ctx.db.patch(locationId, { items: updatedItems });

		return { success: true };
	}
});

export const reorderLocationItems = mutation({
	args: {
		locationId: v.id('locations'),
		itemIds: v.array(v.id('items'))
	},
	handler: async (ctx, { locationId, itemIds }) => {
		const location = await ctx.db.get(locationId);
		if (!location) {
			throw new ConvexError('No such house.');
		}

		if (itemIds.length !== location.items.length) {
			throw new ConvexError('The wares list does not match this house.');
		}

		const currentIds = new Set(location.items);
		const nextIds = new Set(itemIds);
		if (nextIds.size !== itemIds.length) {
			throw new ConvexError('The wares list does not match this house.');
		}
		for (const itemId of itemIds) {
			if (!currentIds.has(itemId)) {
				throw new ConvexError('The wares list does not match this house.');
			}
		}
		for (const itemId of location.items) {
			if (!nextIds.has(itemId)) {
				throw new ConvexError('The wares list does not match this house.');
			}
		}

		await ctx.db.patch(locationId, { items: itemIds });
		return { success: true };
	}
});
