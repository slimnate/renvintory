import type { Actions, PageServerLoad } from './$types';
import initDB from '$lib/database/db';

const db = initDB();

export const load: PageServerLoad = async ({ params }) => {
	const locationId = Number(params.id);

	const location = db.prepare('SELECT * FROM locations WHERE id = ?').get(locationId);
	if (!location) {
		return { location: null, inventories: [], items: [] };
	}

	const inventories = db
		.prepare('SELECT * FROM inventorys WHERE location_id = ? ORDER BY date DESC, created_at DESC')
		.all(locationId);

	const items = db
		.prepare(
			`SELECT i.* FROM items i
			JOIN location_items li ON li.item_id = i.id
			WHERE li.location_id = ?
			ORDER BY i.name`
		)
		.all(locationId);

	return { location, inventories, items };
};

export const actions: Actions = {
	createInventory: async ({ params }) => {
		const locationId = Number(params.id);
		const now = new Date();
		const date = now.toISOString().slice(0, 10);
		const createdAt = now.toISOString();

		const inventory = db
			.prepare('SELECT * FROM inventorys WHERE location_id = ? AND date = ?')
			.get(locationId, date);
		if (inventory) {
			return { success: false, error: 'Inventory already exists' };
		}

		db.prepare(
			'INSERT INTO inventorys (location_id, date, time_of_day, created_at) VALUES (?, ?, ?, ?)'
		).run(locationId, date, 'open', createdAt);
		db.prepare(
			'INSERT INTO inventorys (location_id, date, time_of_day, created_at) VALUES (?, ?, ?, ?)'
		).run(locationId, date, 'close', createdAt);

		return { success: true };
	},
	deleteInventory: async ({ params }) => {
		const inventoryId = Number(params.id);
		db.prepare('DELETE FROM inventorys WHERE id = ?').run(inventoryId);
		return { success: true };
	}
};
