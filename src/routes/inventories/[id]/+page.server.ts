import type { Actions, PageServerLoad } from './$types';
import initDB from '$lib/database/db';

const db = initDB();

export const load: PageServerLoad = async ({ params }) => {
	const inventoryId = Number(params.id);

	const inventory = db.prepare('SELECT * FROM inventorys WHERE id = ?').get(inventoryId);
	if (!inventory) {
		return { inventory: null, location: null, lines: [] };
	}

	const location = db.prepare('SELECT * FROM locations WHERE id = ?').get(inventory.location_id);

	const lines = db
		.prepare(
			`SELECT 
				ic.id as inventory_count_id,
				i.id as item_id,
				i.name,
				i.price,
				c.container_id,
				COALESCE(c.count, 0) as count,
				cont.size as container_size
			FROM inventory_counts ic
			JOIN counts c ON c.id = ic.count_id
			JOIN items i ON i.id = c.item_id
			JOIN containers cont ON cont.id = c.container_id
			WHERE ic.inventory_id = ?
			ORDER BY i.name, cont.size`
		)
		.all(inventoryId);

	return { inventory, location, lines };
};
