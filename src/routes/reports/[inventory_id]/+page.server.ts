import type { PageServerLoad } from './$types';
import initDB from '$lib/database/db';

const db = initDB();

export const load: PageServerLoad = async ({ params }) => {
	const inventoryId = Number(params.inventory_id);

	const inventory = db.prepare('SELECT * FROM inventorys WHERE id = ?').get(inventoryId);
	if (!inventory) {
		return { inventory: null, location: null, lines: [] };
	}

	const location = db.prepare('SELECT * FROM locations WHERE id = ?').get(inventory.location_id);

	const items = db
		.prepare(
			`SELECT i.* FROM items i
			JOIN location_items li ON li.item_id = i.id
			WHERE li.location_id = ?
			ORDER BY i.name`
		)
		.all(location?.id as number);

	const counts = db
		.prepare(
			`SELECT i.name as item_name, i.id as item_id, counts.count, con.size as container_size, con.id as container_id from counts
			JOIN items as i on counts.item_id = i.id
			JOIN inventory_counts ic ON ic.count_id = counts.id
			JOIN containers as con ON counts.container_id = con.id
			WHERE ic.inventory_id = ?`
		)
		.all(inventoryId);

	const totals: { item_name: string; total: number }[] = [];
	items.forEach((item) => {
		const itemTotal = counts.reduce((total: number, count: any) => {
			console.log(count);
			console.log(item);
			if (count.item_id === item.id) {
				return total + count.count * count.container_size;
			}
			return total;
		}, 0);
		totals.push({ item_name: item.name as string, total: itemTotal });
	});

	return { inventory, location, counts, totals };
};
