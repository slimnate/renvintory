import type { Actions, PageServerLoad } from './$types';
import initDB from '$lib/database/db';

const db = initDB();

export const load: PageServerLoad = async ({ params }) => {
	const inventoryId = Number(params.inventory_id);
	const inventory = db.prepare('SELECT * FROM inventorys WHERE id = ?').get(inventoryId);
	if (!inventory) {
		return { inventory: null, location: null, items: [], itemContainers: [], totals: [] };
	}

	const location = db.prepare('SELECT * FROM locations WHERE id = ?').get(inventory.location_id);

	const items = db
		.prepare(
			`SELECT i.* FROM items i
			JOIN location_items li ON li.item_id = i.id
			WHERE li.location_id = ?
			ORDER BY i.name`
		)
		.all(inventory.location_id);

	const itemContainers = db
		.prepare(
			`SELECT ic.item_id, c.id as container_id, c.size
			FROM item_containers ic
			JOIN containers c ON c.id = ic.container_id
			WHERE ic.item_id IN (${items.map(() => '?').join(',') || 'NULL'})
			ORDER BY c.size`
		)
		.all(...items.map((i: any) => i.id));

	const counts = db
		.prepare(
			`SELECT i.id as item_id, counts.count, con.size as container_size, con.id as container_id from counts
			JOIN items as i on counts.item_id = i.id
			JOIN inventory_counts ic ON ic.count_id = counts.id
			JOIN containers as con ON counts.container_id = con.id
			WHERE ic.inventory_id = ?`
		)
		.all(inventoryId);

	return { inventory, location, items, itemContainers, counts };
};

export const actions: Actions = {
	increment: async ({ params, request }) => {
		const form = await request.formData();
		const inventoryId = Number(params.inventory_id);
		const itemId = Number(form.get('item_id'));
		const containerId = Number(form.get('container_id'));
		const op = String(form.get('op') ?? 'inc'); // 'inc' | 'dec'

		// check for existing count entry for this inventory, item, and container
		const countRecord = db
			.prepare(
				`SELECT c.* FROM counts c
				JOIN inventory_counts ic ON ic.count_id = c.id
				WHERE ic.inventory_id = ? AND c.item_id = ? AND c.container_id = ?`
			)
			.get(inventoryId, itemId, containerId);

		// if count exists, update it, otherwise insert new count record
		if (countRecord) {
			let newCount = Number(countRecord?.count) + (op === 'dec' ? -1 : 1);
			if (newCount < 0) newCount = 0;
			db.prepare('UPDATE counts SET count = ? WHERE id = ?').run(newCount, countRecord.id);
			return { success: true, count: newCount };
		} else {
			let newCount = op === 'dec' ? 0 : 1;
			if (newCount < 0) newCount = 0;
			const info = db
				.prepare('INSERT INTO counts (item_id, container_id, count) VALUES (?, ?, ?)')
				.run(itemId, containerId, 1);
			db.prepare('INSERT INTO inventory_counts (inventory_id, count_id) VALUES (?, ?)').run(
				inventoryId,
				info.lastInsertRowid
			);
			return { success: true, count: newCount };
		}
	}
};
