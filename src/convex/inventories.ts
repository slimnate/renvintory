import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

export const getInventoriesByLocationId = query({
    args: { locationId: v.id("locations") },
    handler: async (ctx, { locationId }) => {
        return await ctx.db
            .query("inventories")
            .filter((q) => q.eq(q.field("locationId"), locationId))
            .order("desc")
            .collect();
    }
});

export const getInventoryById = query({
    args: { id: v.id("inventories") },
    handler: async (ctx, { id }) => {
        return await ctx.db.get(id);
    }
});

export const getCountsByInventoryId = query({
    args: { inventoryId: v.id("inventories") },
    handler: async (ctx, { inventoryId }) => {
        const counts = await ctx.db
            .query("counts")
            .filter((q) => q.eq(q.field("inventoryId"), inventoryId))
            .collect();
        
        // Fetch related items and containers for each count
        const countsWithDetails = await Promise.all(
            counts.map(async (count) => {
                const item = await ctx.db.get(count.itemId);
                const container = await ctx.db.get(count.containerId);
                
                return {
                    _id: count._id,
                    itemId: count.itemId,
                    containerId: count.containerId,
                    count: count.count,
                    item: item ? {
                        _id: item._id,
                        name: item.name,
                        price: item.price
                    } : null,
                    container: container ? {
                        _id: container._id,
                        size: container.size
                    } : null
                };
            })
        );
        
        return countsWithDetails;
    }
});

export const createInventory = mutation({
    args: { 
        locationId: v.id("locations"),
        date: v.string()
    },
    handler: async (ctx, { locationId, date }) => {
        // Check if inventories already exist for this location/date
        const existing = await ctx.db
            .query("inventories")
            .filter((q) => 
                q.and(
                    q.eq(q.field("locationId"), locationId),
                    q.eq(q.field("date"), date)
                )
            )
            .first();
        
        if (existing) {
            throw new Error("Inventory already exists for this location and date");
        }

        const createdAt = new Date().toISOString();

        // Create both "open" and "close" inventory records
        await ctx.db.insert("inventories", {
            locationId,
            date,
            inventoryType: "open",
            createdAt
        });

        await ctx.db.insert("inventories", {
            locationId,
            date,
            inventoryType: "close",
            createdAt
        });

        return { success: true };
    }
});

export const deleteInventory = mutation({
    args: { inventoryId: v.id("inventories") },
    handler: async (ctx, { inventoryId }) => {
        await ctx.db.delete(inventoryId);
        return { success: true };
    }
});

export const getCountPageData = query({
    args: { inventoryId: v.id("inventories") },
    handler: async (ctx, { inventoryId }) => {
        const inventory = await ctx.db.get(inventoryId);
        if (!inventory) {
            return null;
        }

        const location = await ctx.db.get(inventory.locationId);
        if (!location) {
            return null;
        }

        // Get items for this location
        const items = await Promise.all(
            location.items.map((itemId: Id<"items">) => ctx.db.get(itemId))
        );
        const validItems = items.filter((item): item is NonNullable<typeof item> => item !== null);

        // Get containers for each item
        const itemsWithContainers = await Promise.all(
            validItems.map(async (item) => {
                const containers = await Promise.all(
                    item.containers.map((containerId: Id<"containers">) => ctx.db.get(containerId))
                );
                const validContainers = containers.filter((c): c is NonNullable<typeof c> => c !== null);
                return {
                    _id: item._id,
                    name: item.name,
                    price: item.price,
                    containers: validContainers.map(c => ({
                        _id: c._id,
                        size: c.size
                    }))
                };
            })
        );

        // Get existing counts for this inventory
        const counts = await ctx.db
            .query("counts")
            .filter((q) => q.eq(q.field("inventoryId"), inventoryId))
            .collect();

        return {
            inventory,
            location,
            items: itemsWithContainers,
            counts: counts.map(c => ({
                _id: c._id,
                itemId: c.itemId,
                containerId: c.containerId,
                count: c.count
            }))
        };
    }
});

export const incrementCount = mutation({
    args: {
        inventoryId: v.id("inventories"),
        itemId: v.id("items"),
        containerId: v.id("containers"),
        op: v.union(v.literal("inc"), v.literal("dec"))
    },
    handler: async (ctx, { inventoryId, itemId, containerId, op }) => {
        // Find existing count
        const existing = await ctx.db
            .query("counts")
            .filter((q) =>
                q.and(
                    q.eq(q.field("inventoryId"), inventoryId),
                    q.eq(q.field("itemId"), itemId),
                    q.eq(q.field("containerId"), containerId)
                )
            )
            .first();

        if (existing) {
            let newCount = existing.count + (op === "dec" ? -1 : 1);
            if (newCount < 0) newCount = 0;
            
            await ctx.db.patch(existing._id, { count: newCount });
            return { success: true, count: newCount };
        } else {
            let newCount = op === "dec" ? 0 : 1;
            if (newCount < 0) newCount = 0;
            
            await ctx.db.insert("counts", {
                inventoryId,
                itemId,
                containerId,
                count: newCount
            });
            return { success: true, count: newCount };
        }
    }
});

export const getReportData = query({
    args: { inventoryId: v.id("inventories") },
    handler: async (ctx, { inventoryId }) => {
        const inventory = await ctx.db.get(inventoryId);
        if (!inventory) {
            return null;
        }

        const location = await ctx.db.get(inventory.locationId);
        if (!location) {
            return null;
        }

        // Get counts for this inventory
        const counts = await ctx.db
            .query("counts")
            .filter((q) => q.eq(q.field("inventoryId"), inventoryId))
            .collect();

        // Fetch items and containers for each count
        const countsWithDetails = await Promise.all(
            counts.map(async (count) => {
                const item = await ctx.db.get(count.itemId);
                const container = await ctx.db.get(count.containerId);
                
                return {
                    itemId: count.itemId,
                    item: item ? {
                        _id: item._id,
                        name: item.name,
                        price: item.price
                    } : null,
                    container: container ? {
                        _id: container._id,
                        size: container.size
                    } : null,
                    count: count.count
                };
            })
        );

        // Calculate totals by item with price and per container info
        const itemTotals = new Map<string, { 
            item_name: string; 
            price: number;
            perContainer: Array<{ size: number; count: number }>;
            total: number;
        }>();
        
        for (const c of countsWithDetails) {
            if (!c.item || !c.container) continue;
            
            const itemId = c.itemId;
            const itemName = c.item.name;
            const itemPrice = c.item.price;
            const containerSize = c.container.size;
            const countValue = c.count ?? 0;
            const total = countValue * containerSize;
            
            const current = itemTotals.get(itemId) ?? { 
                item_name: itemName, 
                price: itemPrice,
                perContainer: [],
                total: 0 
            };
            current.perContainer.push({ size: containerSize, count: countValue });
            current.total += total;
            itemTotals.set(itemId, current);
        }

        // Sort per container arrays by size
        for (const entry of itemTotals.values()) {
            entry.perContainer.sort((a, b) => a.size - b.size);
        }

        const totals = Array.from(itemTotals.values());

        return {
            inventory,
            location,
            counts: countsWithDetails,
            totals
        };
    }
});