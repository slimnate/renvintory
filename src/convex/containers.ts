import { query, mutation } from './_generated/server';
import { ConvexError, v } from 'convex/values';

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

export const createContainer = mutation({
	args: {
		size: v.number(),
		type: v.union(v.literal('can'), v.literal('bottle'), v.literal('cup'))
	},
	handler: async (ctx, { size, type }) => {
		// Check for duplicate containers (same size and type)
		const existing = await ctx.db
			.query('containers')
			.filter((q) => q.and(q.eq(q.field('size'), size), q.eq(q.field('type'), type)))
			.first();

		if (existing) {
			throw new ConvexError(`A ${type} vessel of size ${size} is already in the ledger.`);
		}

		const containerId = await ctx.db.insert('containers', {
			size,
			type
		});

		return { success: true, containerId };
	}
});
