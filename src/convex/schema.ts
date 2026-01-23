import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    locations: defineTable({
        _id: v.id("locations"),
        name: v.string(),
        items: v.array(v.id("items")),
    }),
    inventories: defineTable({
        _id: v.id("inventories"),
        locationId: v.id("locations"),
        date: v.string(),
        inventoryType: v.union(v.literal("open"), v.literal("close")), //timeOfDay: v.string(),
        createdAt: v.string(),
    })
        .index("by_date", ["date"])
        .index("by_location_date", ["locationId", "date"]),
    items: defineTable({
        _id: v.id("items"),
        name: v.string(),
        price: v.number(),
        containers: v.array(v.id("containers")),
    }),
    containers: defineTable({
        _id: v.id("containers"),
        size: v.number(),
        type: v.union(v.literal("can"), v.literal("bottle"), v.literal("cup")),
    }),
    counts: defineTable({
        _id: v.id("counts"),
        inventoryId: v.id("inventories"),
        itemId: v.id("items"),
        containerId: v.id("containers"),
        count: v.number(),
    })
        .index("by_item", ["itemId"])
        .index("by_inventory_item", ["inventoryId", "itemId"]),
});

