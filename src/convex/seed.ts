import { mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export const seedDatabase = mutation(async (ctx) => {
	// Map to store container IDs keyed by size
	const containerIdMap = new Map<number, Id<"containers">>();

	// Insert containers and store IDs
	const containerSizes = [1, 4, 6, 12, 24, 70, 90, 420, 2520];
	for (const size of containerSizes) {
		const containerId = await ctx.db.insert("containers", { size });
		containerIdMap.set(size, containerId);
	}

	// Map to store item IDs keyed by name
	const itemIdMap = new Map<string, Id<"items">>();

	// Items 1-17: all beer/cider items with containers [1, 4, 6, 12, 24]
	const items1to17 = [
		{ name: "Miller Lite", price: 8 },
		{ name: "Coors Light", price: 8 },
		{ name: "Blue Moon", price: 12 },
		{ name: "Blue Moon Light", price: 7 },
		{ name: "Blue Moon N/A", price: 6 },
		{ name: "Summer Shandy", price: 7 },
		{ name: "Coors Banquet", price: 8 },
		{ name: "Topo Chico", price: 7 },
		{ name: "Callsign IPA", price: 8 },
		{ name: "Happy Thursday", price: 7 },
		{ name: "Arnold Palmer", price: 13 },
		{ name: "Simply Spiked", price: 13 },
		{ name: "Guinness", price: 11 },
		{ name: "Harp", price: 8 },
		{ name: "Smithwicks", price: 8 },
		{ name: "Woodchuck Amber", price: 8 },
		{ name: "Woodchuck Granny Smith", price: 8 },
	];

	const containersFor1to17 = [
		containerIdMap.get(1)!,
		containerIdMap.get(4)!,
		containerIdMap.get(6)!,
		containerIdMap.get(12)!,
		containerIdMap.get(24)!,
	];

	for (const item of items1to17) {
		const itemId = await ctx.db.insert("items", {
			name: item.name,
			price: item.price,
			containers: containersFor1to17,
		});
		itemIdMap.set(item.name, itemId);
	}

	// Item 18: Wine with containers [1, 4, 24]
	const wineId = await ctx.db.insert("items", {
		name: "Wine",
		price: 8,
		containers: [
			containerIdMap.get(1)!,
			containerIdMap.get(4)!,
			containerIdMap.get(24)!,
		],
	});
	itemIdMap.set("Wine", wineId);

	// Item 19: 5oz Cups with containers [1, 90, 2520]
	const cups5ozId = await ctx.db.insert("items", {
		name: "5oz Cups",
		price: 10,
		containers: [
			containerIdMap.get(1)!,
			containerIdMap.get(90)!,
			containerIdMap.get(2520)!,
		],
	});
	itemIdMap.set("5oz Cups", cups5ozId);

	// Item 20: 12 Oz Cups with containers [1, 70, 420]
	const cups12ozId = await ctx.db.insert("items", {
		name: "12 Oz Cups",
		price: 7,
		containers: [
			containerIdMap.get(1)!,
			containerIdMap.get(70)!,
			containerIdMap.get(420)!,
		],
	});
	itemIdMap.set("12 Oz Cups", cups12ozId);

	// Wizard location items (excluding Simply Spiked and 12 Oz Cups)
	const wizardItemNames = [
		"Miller Lite",
		"Coors Light",
		"Blue Moon",
		"Blue Moon Light",
		"Blue Moon N/A",
		"Summer Shandy",
		"Coors Banquet",
		"Topo Chico",
		"Callsign IPA",
		"Happy Thursday",
		"Arnold Palmer",
		"Guinness",
		"Harp",
		"Smithwicks",
		"Woodchuck Amber",
		"Woodchuck Granny Smith",
		"Wine",
		"5oz Cups",
	];

	const wizardItemIds = wizardItemNames
		.map((name) => itemIdMap.get(name))
		.filter((id): id is Id<"items"> => id !== undefined);

	// Dragon location items (from notes.txt)
	const dragonItemNames = [
		"Miller Lite",
		"Coors Light",
		"Blue Moon",
		"Blue Moon Light",
		"Blue Moon N/A",
		"Summer Shandy",
		"Coors Banquet",
		"Topo Chico",
		"Callsign IPA",
		"Happy Thursday",
		"Arnold Palmer",
		"Simply Spiked",
		"Guinness",
		"Harp",
		"Smithwicks",
		"Woodchuck Amber",
		"Woodchuck Granny Smith",
		"Wine",
		"5oz Cups",
		"12 Oz Cups",
	];

	const dragonItemIds = dragonItemNames
		.map((name) => itemIdMap.get(name))
		.filter((id): id is Id<"items"> => id !== undefined);

	// Pig and Whistle location items (from notes.txt)
	// Note: oktoberfest and mead are not in the seed items, so they're excluded
	const pigAndWhistleItemNames = [
		"Miller Lite",
		"Coors Light",
		"Blue Moon",
		"Guinness",
		"Woodchuck Amber",
		"Woodchuck Granny Smith",
		"Smithwicks",
		"Coors Banquet",
		"Topo Chico",
		"Callsign IPA",
		"Happy Thursday",
		"Arnold Palmer",
		"Simply Spiked",
		"Wine",
	];

	const pigAndWhistleItemIds = pigAndWhistleItemNames
		.map((name) => itemIdMap.get(name))
		.filter((id): id is Id<"items"> => id !== undefined);

	// Insert locations
	await ctx.db.insert("locations", {
		name: "Dragon",
		items: dragonItemIds,
	});

	await ctx.db.insert("locations", {
		name: "Wizard",
		items: wizardItemIds,
	});

	await ctx.db.insert("locations", {
		name: "Pig and Whistle",
		items: pigAndWhistleItemIds,
	});
});
