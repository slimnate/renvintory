import { query } from "./_generated/server";
import { v } from "convex/values";

export const getLocations = query({
    args: {},
    handler: async (ctx) => {
    return await ctx.db.query("locations").collect();
    }
});

export const getLocationById = query({
    args: { id: v.id("locations") },
    handler: async (ctx, { id }) => {
    return await ctx.db.query("locations").filter(q => q.eq(q.field("_id"), id)).first();
    }
});