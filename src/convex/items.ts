import { query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

export const getItemsByLocationId = query({
    args: { locationId: v.id("locations") },
    handler: async (ctx, { locationId }) => {
        const location = await ctx.db.get(locationId);
        if (!location) {
            return [];
        }
        
        // Fetch items by their IDs from the location's items array
        const items = await Promise.all(
            location.items.map((itemId: Id<"items">) => ctx.db.get(itemId))
        );
        
        // Filter out any null items (in case an item was deleted)
        return items.filter((item): item is NonNullable<typeof item> => item !== null);
    }
});