import { mutation } from './_generated/server';
import type { Id } from './_generated/dataModel';

export const seedDatabase = mutation(async (ctx) => {
	// Clear existing data in dependency order to prevent duplicates
	const counts = await ctx.db.query("counts").collect();
	for (const count of counts) {
		await ctx.db.delete(count._id);
	}

	const inventories = await ctx.db.query('inventories').collect();
	for (const inventory of inventories) {
		await ctx.db.delete(inventory._id);
	}

	const locations = await ctx.db.query('locations').collect();
	for (const location of locations) {
		await ctx.db.delete(location._id);
	}

	const items = await ctx.db.query('items').collect();
	for (const item of items) {
		await ctx.db.delete(item._id);
	}

	const containers = await ctx.db.query('containers').collect();
	for (const container of containers) {
		await ctx.db.delete(container._id);
	}

	// Map to store container IDs keyed by size and type (e.g., "1-can", "4-bottle")
	const containerIdMap = new Map<string, Id<'containers'>>();

	// Create containers with types
	// Cans: sizes [1, 4, 6, 12, 24] for beer/cider items
	const canSizes = [1, 4, 6, 12, 24];
	for (const size of canSizes) {
		const containerId = await ctx.db.insert('containers', { size, type: 'can' });
		containerIdMap.set(`${size}-can`, containerId);
	}

	// Bottles: sizes [1, 4, 24] for Wine
	const bottleSizes = [1, 4, 24];
	for (const size of bottleSizes) {
		const containerId = await ctx.db.insert('containers', { size, type: 'bottle' });
		containerIdMap.set(`${size}-bottle`, containerId);
	}

	// Cups: sizes [1, 70, 90, 420, 2520] for cup items
	const cupSizes = [1, 70, 90, 420, 2520];
	for (const size of cupSizes) {
		const containerId = await ctx.db.insert('containers', { size, type: 'cup' });
		containerIdMap.set(`${size}-cup`, containerId);
	}

	// Map to store item IDs keyed by name
	const itemIdMap = new Map<string, Id<'items'>>();

	// Items 1-17: all beer/cider items with containers [1, 4, 6, 12, 24]
	const items1to17 = [
		{ name: 'Miller Lite', price: 8 },
		{ name: 'Coors Light', price: 8 },
		{ name: 'Blue Moon', price: 12 },
		{ name: 'Blue Moon Light', price: 7 },
		{ name: 'Blue Moon N/A', price: 6 },
		{ name: 'Summer Shandy', price: 7 },
		{ name: 'Coors Banquet', price: 8 },
		{ name: 'Topo Chico', price: 7 },
		{ name: 'Callsign IPA', price: 8 },
		{ name: 'Happy Thursday', price: 7 },
		{ name: 'Arnold Palmer', price: 13 },
		{ name: 'Simply Spiked', price: 13 },
		{ name: 'Guinness', price: 11 },
		{ name: 'Harp', price: 8 },
		{ name: 'Smithwicks', price: 8 },
		{ name: 'Woodchuck Amber', price: 8 },
		{ name: 'Woodchuck Granny Smith', price: 8 }
	];

	const containersFor1to17 = [
		containerIdMap.get('1-can')!,
		containerIdMap.get('4-can')!,
		containerIdMap.get('6-can')!,
		containerIdMap.get('12-can')!,
		containerIdMap.get('24-can')!
	];

	for (const item of items1to17) {
		const itemId = await ctx.db.insert('items', {
			name: item.name,
			price: item.price,
			containers: containersFor1to17
		});
		itemIdMap.set(item.name, itemId);
	}

	// Item 18: Wine with containers [1, 4, 24] - bottles
	const wineId = await ctx.db.insert('items', {
		name: 'Wine',
		price: 8,
		containers: [
			containerIdMap.get('1-bottle')!,
			containerIdMap.get('4-bottle')!,
			containerIdMap.get('24-bottle')!
		]
	});
	itemIdMap.set('Wine', wineId);

	// Item 19: 5oz Cups with containers [1, 90, 2520] - cups
	const cups5ozId = await ctx.db.insert('items', {
		name: '5oz Cups',
		price: 10,
		containers: [
			containerIdMap.get('1-cup')!,
			containerIdMap.get('90-cup')!,
			containerIdMap.get('2520-cup')!
		]
	});
	itemIdMap.set('5oz Cups', cups5ozId);

	// Item 20: 12 Oz Cups with containers [1, 70, 420] - cups
	const cups12ozId = await ctx.db.insert('items', {
		name: '12 Oz Cups',
		price: 7,
		containers: [
			containerIdMap.get('1-cup')!,
			containerIdMap.get('70-cup')!,
			containerIdMap.get('420-cup')!
		]
	});
	itemIdMap.set('12 Oz Cups', cups12ozId);

	// Wizard location items (excluding Simply Spiked and 12 Oz Cups)
	const wizardItemNames = [
		'Miller Lite',
		'Coors Light',
		'Blue Moon',
		'Blue Moon Light',
		'Blue Moon N/A',
		'Summer Shandy',
		'Coors Banquet',
		'Topo Chico',
		'Callsign IPA',
		'Happy Thursday',
		'Arnold Palmer',
		'Guinness',
		'Harp',
		'Smithwicks',
		'Woodchuck Amber',
		'Woodchuck Granny Smith',
		'Wine',
		'5oz Cups'
	];

	const wizardItemIds = wizardItemNames
		.map((name) => itemIdMap.get(name))
		.filter((id): id is Id<'items'> => id !== undefined);

	// Dragon location items (from notes.txt)
	const dragonItemNames = [
		'Miller Lite',
		'Coors Light',
		'Blue Moon',
		'Blue Moon Light',
		'Blue Moon N/A',
		'Summer Shandy',
		'Coors Banquet',
		'Topo Chico',
		'Callsign IPA',
		'Happy Thursday',
		'Arnold Palmer',
		'Simply Spiked',
		'Guinness',
		'Harp',
		'Smithwicks',
		'Woodchuck Amber',
		'Woodchuck Granny Smith',
		'Wine',
		'5oz Cups',
		'12 Oz Cups'
	];

	const dragonItemIds = dragonItemNames
		.map((name) => itemIdMap.get(name))
		.filter((id): id is Id<'items'> => id !== undefined);

	// Pig and Whistle location items (from notes.txt)
	// Note: oktoberfest and mead are not in the seed items, so they're excluded
	const pigAndWhistleItemNames = [
		'Miller Lite',
		'Coors Light',
		'Blue Moon',
		'Guinness',
		'Woodchuck Amber',
		'Woodchuck Granny Smith',
		'Smithwicks',
		'Coors Banquet',
		'Topo Chico',
		'Callsign IPA',
		'Happy Thursday',
		'Arnold Palmer',
		'Simply Spiked',
		'Wine'
	];

	const pigAndWhistleItemIds = pigAndWhistleItemNames
		.map((name) => itemIdMap.get(name))
		.filter((id): id is Id<'items'> => id !== undefined);

	// Insert locations
	await ctx.db.insert('locations', {
		name: 'Dragon',
		items: dragonItemIds
	});

	await ctx.db.insert('locations', {
		name: 'Wizard',
		items: wizardItemIds
	});

	await ctx.db.insert('locations', {
		name: 'Pig and Whistle',
		items: pigAndWhistleItemIds
	});
});
