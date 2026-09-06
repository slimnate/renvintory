import { query, mutation } from './_generated/server';
import { ConvexError, v } from 'convex/values';
import type { Id } from './_generated/dataModel';

function valuesInLocationOrder<T>(locationItemIds: Id<'items'>[], byItemId: Map<string, T>): T[] {
	const ordered: T[] = [];
	const seen = new Set<string>();
	for (const itemId of locationItemIds) {
		const value = byItemId.get(itemId);
		if (value !== undefined) {
			ordered.push(value);
			seen.add(itemId);
		}
	}
	for (const [itemId, value] of byItemId) {
		if (!seen.has(itemId)) {
			ordered.push(value);
		}
	}
	return ordered;
}

export const getInventoriesByLocationId = query({
	args: { locationId: v.id('locations') },
	handler: async (ctx, { locationId }) => {
		return await ctx.db
			.query('inventories')
			.filter((q) => q.eq(q.field('locationId'), locationId))
			.order('desc')
			.collect();
	}
});

export const getInventoryById = query({
	args: { id: v.id('inventories') },
	handler: async (ctx, { id }) => {
		return await ctx.db.get(id);
	}
});

export const getCountsByInventoryId = query({
	args: { inventoryId: v.id('inventories') },
	handler: async (ctx, { inventoryId }) => {
		const counts = await ctx.db
			.query('counts')
			.filter((q) => q.eq(q.field('inventoryId'), inventoryId))
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
					item: item
						? {
								_id: item._id,
								name: item.name,
								price: item.price
							}
						: null,
					container: container
						? {
								_id: container._id,
								size: container.size,
								type: container.type
							}
						: null
				};
			})
		);

		return countsWithDetails;
	}
});

export const createInventory = mutation({
	args: {
		locationId: v.id('locations'),
		date: v.string()
	},
	handler: async (ctx, { locationId, date }) => {
		// Check if inventories already exist for this location/date
		const existing = await ctx.db
			.query('inventories')
			.filter((q) => q.and(q.eq(q.field('locationId'), locationId), q.eq(q.field('date'), date)))
			.collect();

		let toCreate = [];
		if (!existing.some((inv) => inv.inventoryType === 'open')) {
			toCreate.push('open');
		}
		if (!existing.some((inv) => inv.inventoryType === 'close')) {
			toCreate.push('close');
		}
		if (!existing.some((inv) => inv.inventoryType === 'spill')) {
			toCreate.push('spill');
		}
		if (!existing.some((inv) => inv.inventoryType === 'intake')) {
			toCreate.push('intake');
		}

		if (toCreate.length === 0) {
			throw new ConvexError(
				`This house already has reckonings for ${date}. One day, one reckoning.`
			);
		}

		const now = new Date().toISOString();
		for (let invType of toCreate) {
			await ctx.db.insert('inventories', {
				locationId,
				date,
				inventoryType: invType as 'open' | 'close' | 'spill' | 'intake',
				createdAt: now
			});
		}

		return { success: true };
	}
});

export const deleteInventory = mutation({
	args: { inventoryId: v.id('inventories') },
	handler: async (ctx, { inventoryId }) => {
		await ctx.db.delete(inventoryId);
		return { success: true };
	}
});

export const deleteInventoriesByDate = mutation({
	args: {
		locationId: v.id('locations'),
		date: v.string()
	},
	handler: async (ctx, { locationId, date }) => {
		// Find all inventories for this location and date
		const inventoriesToDelete = await ctx.db
			.query('inventories')
			.filter((q) => q.and(q.eq(q.field('locationId'), locationId), q.eq(q.field('date'), date)))
			.collect();

		// Delete all counts associated with these inventories
		for (const inventory of inventoriesToDelete) {
			const counts = await ctx.db
				.query('counts')
				.filter((q) => q.eq(q.field('inventoryId'), inventory._id))
				.collect();
			
			for (const count of counts) {
				await ctx.db.delete(count._id);
			}
		}

		// Delete all inventories
		for (const inventory of inventoriesToDelete) {
			await ctx.db.delete(inventory._id);
		}

		return { success: true };
	}
});

export const getCountPageData = query({
	args: { inventoryId: v.id('inventories') },
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
			location.items.map((itemId: Id<'items'>) => ctx.db.get(itemId))
		);
		const validItems = items.filter((item): item is NonNullable<typeof item> => item !== null);

		// Get containers for each item
		const itemsWithContainers = await Promise.all(
			validItems.map(async (item) => {
				const containers = await Promise.all(
					item.containers.map((containerId: Id<'containers'>) => ctx.db.get(containerId))
				);
				const validContainers = containers.filter((c): c is NonNullable<typeof c> => c !== null);
				return {
					_id: item._id,
					name: item.name,
					price: item.price,
					containers: validContainers.map((c) => ({
						_id: c._id,
						size: c.size,
						type: c.type
					}))
				};
			})
		);

		// Get existing counts for this inventory
		const counts = await ctx.db
			.query('counts')
			.filter((q) => q.eq(q.field('inventoryId'), inventoryId))
			.collect();

		return {
			inventory,
			location,
			items: itemsWithContainers,
			counts: counts.map((c) => ({
				_id: c._id,
				itemId: c.itemId,
				containerId: c.containerId,
				count: c.count
			}))
		};
	}
});

export const setCounts = mutation({
	args: {
		inventoryId: v.id('inventories'),
		updates: v.array(
			v.object({
				itemId: v.id('items'),
				containerId: v.id('containers'),
				count: v.number()
			})
		)
	},
	returns: v.object({ success: v.boolean() }),
	handler: async (ctx, { inventoryId, updates }) => {
		const existing = await ctx.db
			.query('counts')
			.withIndex('by_inventory_item', (q) => q.eq('inventoryId', inventoryId))
			.collect();
		const byKey = new Map<string, (typeof existing)[number]>(
			existing.map((row) => [`${row.itemId}:${row.containerId}`, row])
		);

		for (const update of updates) {
			const count = Math.max(0, Math.floor(update.count));
			const key = `${update.itemId}:${update.containerId}`;
			const row = byKey.get(key);

			if (row) {
				if (row.count !== count) {
					await ctx.db.patch(row._id, { count });
				}
			} else if (count > 0) {
				await ctx.db.insert('counts', {
					inventoryId,
					itemId: update.itemId,
					containerId: update.containerId,
					count
				});
			}
		}

		return { success: true };
	}
});

export const incrementCount = mutation({
	args: {
		inventoryId: v.id('inventories'),
		itemId: v.id('items'),
		containerId: v.id('containers'),
		op: v.union(v.literal('inc'), v.literal('dec'))
	},
	handler: async (ctx, { inventoryId, itemId, containerId, op }) => {
		// Find existing count
		const existing = await ctx.db
			.query('counts')
			.filter((q) =>
				q.and(
					q.eq(q.field('inventoryId'), inventoryId),
					q.eq(q.field('itemId'), itemId),
					q.eq(q.field('containerId'), containerId)
				)
			)
			.first();

		if (existing) {
			let newCount = existing.count + (op === 'dec' ? -1 : 1);
			if (newCount < 0) newCount = 0;

			await ctx.db.patch(existing._id, { count: newCount });
			return { success: true, count: newCount };
		} else {
			let newCount = op === 'dec' ? 0 : 1;
			if (newCount < 0) newCount = 0;

			await ctx.db.insert('counts', {
				inventoryId,
				itemId,
				containerId,
				count: newCount
			});
			return { success: true, count: newCount };
		}
	}
});

export const getInventoriesByLocationAndDate = query({
	args: {
		locationId: v.id('locations'),
		date: v.string()
	},
	handler: async (ctx, { locationId, date }) => {
		const location = await ctx.db.get(locationId);
		if (!location) {
			return null;
		}

		// Get all inventories for this location and date
		const allInventories = await ctx.db
			.query('inventories')
			.filter((q) => q.and(q.eq(q.field('locationId'), locationId), q.eq(q.field('date'), date)))
			.collect();

		// Organize inventories by type
		const inventories = {
			open: allInventories.find((inv) => inv.inventoryType === 'open') ?? null,
			close: allInventories.find((inv) => inv.inventoryType === 'close') ?? null,
			spill: allInventories.find((inv) => inv.inventoryType === 'spill') ?? null,
			intake: allInventories.find((inv) => inv.inventoryType === 'intake') ?? null
		};

		// Get counts for each inventory type
		const getCountsForInventory = async (inventoryId: Id<'inventories'> | null) => {
			if (!inventoryId) return [];
			const counts = await ctx.db
				.query('counts')
				.filter((q) => q.eq(q.field('inventoryId'), inventoryId))
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
						item: item
							? {
									_id: item._id,
									name: item.name,
									price: item.price
								}
							: null,
						container: container
							? {
									_id: container._id,
									size: container.size,
									type: container.type
								}
							: null
					};
				})
			);

			return countsWithDetails;
		};

		const counts = {
			open: await getCountsForInventory(inventories.open?._id ?? null),
			close: await getCountsForInventory(inventories.close?._id ?? null),
			spill: await getCountsForInventory(inventories.spill?._id ?? null),
			intake: await getCountsForInventory(inventories.intake?._id ?? null)
		};

		return {
			location,
			inventories,
			counts
		};
	}
});

export const getReportData = query({
	args: { inventoryId: v.id('inventories') },
	handler: async (ctx, { inventoryId }) => {
		const inventory = await ctx.db.get(inventoryId);
		if (!inventory) {
			return null;
		}

		const location = await ctx.db.get(inventory.locationId);
		if (!location) {
			return null;
		}

		// Special handling for close inventories
		if (inventory.inventoryType === 'close') {
			// Get all inventories for this location and date
			const allInventories = await ctx.db
				.query('inventories')
				.filter((q) => q.and(q.eq(q.field('locationId'), inventory.locationId), q.eq(q.field('date'), inventory.date)))
				.collect();

			// Organize inventories by type
			const inventoriesByType = {
				open: allInventories.find((inv) => inv.inventoryType === 'open') ?? null,
				close: allInventories.find((inv) => inv.inventoryType === 'close') ?? null,
				spill: allInventories.find((inv) => inv.inventoryType === 'spill') ?? null,
				intake: allInventories.find((inv) => inv.inventoryType === 'intake') ?? null
			};

			// Require that an open inventory exists
			if (!inventoriesByType.open) {
				throw new ConvexError('An open reckoning is needed before the close can be tallied.');
			}

			// Helper function to get counts for an inventory
			const getCountsForInventory = async (inventoryId: Id<'inventories'> | null) => {
				if (!inventoryId) return [];
				const counts = await ctx.db
					.query('counts')
					.filter((q) => q.eq(q.field('inventoryId'), inventoryId))
					.collect();

				return await Promise.all(
					counts.map(async (count) => {
						const item = await ctx.db.get(count.itemId);
						const container = await ctx.db.get(count.containerId);

						return {
							itemId: count.itemId,
							item: item
								? {
										_id: item._id,
										name: item.name,
										price: item.price
									}
								: null,
							container: container
								? {
										_id: container._id,
										size: container.size,
										type: container.type
									}
								: null,
							count: count.count
						};
					})
				);
			};

			// Get counts for each inventory type
			const countsByType = {
				open: await getCountsForInventory(inventoriesByType.open?._id ?? null),
				close: await getCountsForInventory(inventoriesByType.close?._id ?? null),
				spill: await getCountsForInventory(inventoriesByType.spill?._id ?? null),
				intake: await getCountsForInventory(inventoriesByType.intake?._id ?? null)
			};

			// Get all items for the location
			const allItems = await Promise.all(
				location.items.map((itemId: Id<'items'>) => ctx.db.get(itemId))
			);
			const validItems = allItems.filter((item): item is NonNullable<typeof item> => item !== null);

			// Helper function to calculate total count for an item from counts array
			const getItemTotal = (itemId: Id<'items'>, countsArray: typeof countsByType.open): number => {
				return countsArray
					.filter((c) => c.itemId === itemId && c.item && c.container)
					.reduce((sum, c) => sum + (c.count ?? 0) * (c.container?.size ?? 0), 0);
			};

			// Build close report rows
			const closeReportRows = validItems.map((item) => {
				const openCount = getItemTotal(item._id, countsByType.open);
				const closeCount = getItemTotal(item._id, countsByType.close);
				const spillCount = getItemTotal(item._id, countsByType.spill);
				const intakeCount = getItemTotal(item._id, countsByType.intake);
				const openPlusIntakeCount = openCount + intakeCount;
				const totalUsed = openPlusIntakeCount - closeCount;
				const soldCount = totalUsed - spillCount;
				const spilledValue = spillCount * item.price;
				const sales = soldCount * item.price;

				return {
					itemId: item._id,
					name: item.name,
					price: item.price,
					openCount,
					closeCount,
					spillCount,
					intakeCount,
					openPlusIntakeCount,
					totalUsed,
					soldCount,
					spilledValue,
					sales
				};
			});

			// Calculate grand totals
			const totalSales = closeReportRows.reduce((sum, row) => sum + row.sales, 0);
			const totalSpillage = closeReportRows.reduce((sum, row) => sum + row.spilledValue, 0);

			// Get counts for this inventory (for compatibility with existing code)
			const counts = await ctx.db
				.query('counts')
				.filter((q) => q.eq(q.field('inventoryId'), inventoryId))
				.collect();

			const countsWithDetails = await Promise.all(
				counts.map(async (count) => {
					const item = await ctx.db.get(count.itemId);
					const container = await ctx.db.get(count.containerId);

					return {
						itemId: count.itemId,
						item: item
							? {
									_id: item._id,
									name: item.name,
									price: item.price
								}
							: null,
						container: container
							? {
									_id: container._id,
									size: container.size,
									type: container.type
								}
							: null,
						count: count.count
					};
				})
			);

			// Calculate totals by item with price and per container info (for compatibility)
			const itemTotals = new Map<
				string,
				{
					item_name: string;
					price: number;
					perContainer: Array<{ size: number; count: number; type: 'can' | 'bottle' | 'cup' }>;
					total: number;
				}
			>();

		for (const c of countsWithDetails) {
			if (!c.item || !c.container) continue;

			const itemId = c.itemId;
			const itemName = c.item.name;
			const itemPrice = c.item.price;
			const containerSize = c.container.size;
			const containerType = c.container.type;
			const countValue = c.count ?? 0;
			
			// Skip counts with value 0
			if (countValue === 0) continue;
			
			const total = countValue * containerSize;

			const current = itemTotals.get(itemId) ?? {
				item_name: itemName,
				price: itemPrice,
				perContainer: [],
				total: 0
			};
			current.perContainer.push({ size: containerSize, count: countValue, type: containerType });
			current.total += total;
			itemTotals.set(itemId, current);
		}

		// Sort per container arrays by size
		for (const entry of itemTotals.values()) {
			entry.perContainer.sort((a, b) => a.size - b.size);
		}

		const totals = valuesInLocationOrder(location.items, itemTotals);

			return {
				inventory,
				location,
				counts: countsWithDetails,
				totals,
				closeReport: {
					rows: closeReportRows,
					totals: {
						totalSales,
						totalSpillage
					}
				}
			};
		}

		// Original behavior for non-close inventories
		// Get counts for this inventory
		const counts = await ctx.db
			.query('counts')
			.filter((q) => q.eq(q.field('inventoryId'), inventoryId))
			.collect();

		// Fetch items and containers for each count
		const countsWithDetails = await Promise.all(
			counts.map(async (count) => {
				const item = await ctx.db.get(count.itemId);
				const container = await ctx.db.get(count.containerId);

				return {
					itemId: count.itemId,
					item: item
						? {
								_id: item._id,
								name: item.name,
								price: item.price
							}
						: null,
					container: container
						? {
								_id: container._id,
								size: container.size,
								type: container.type
							}
						: null,
					count: count.count
				};
			})
		);

		// Calculate totals by item with price and per container info
		const itemTotals = new Map<
			string,
			{
				item_name: string;
				price: number;
				perContainer: Array<{ size: number; count: number; type: 'can' | 'bottle' | 'cup' }>;
				total: number;
			}
		>();

		for (const c of countsWithDetails) {
			if (!c.item || !c.container) continue;

			const itemId = c.itemId;
			const itemName = c.item.name;
			const itemPrice = c.item.price;
			const containerSize = c.container.size;
			const containerType = c.container.type;
			const countValue = c.count ?? 0;
			
			// Skip counts with value 0
			if (countValue === 0) continue;
			
			const total = countValue * containerSize;

			const current = itemTotals.get(itemId) ?? {
				item_name: itemName,
				price: itemPrice,
				perContainer: [],
				total: 0
			};
			current.perContainer.push({ size: containerSize, count: countValue, type: containerType });
			current.total += total;
			itemTotals.set(itemId, current);
		}

		// Sort per container arrays by size
		for (const entry of itemTotals.values()) {
			entry.perContainer.sort((a, b) => a.size - b.size);
		}

		const totals = valuesInLocationOrder(location.items, itemTotals);

		return {
			inventory,
			location,
			counts: countsWithDetails,
			totals
		};
	}
});
