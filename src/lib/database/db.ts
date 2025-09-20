import { DatabaseSync } from 'node:sqlite';

function init() {
	const db = new DatabaseSync('inventory.db');
	return db;
}

function listLocations() {
	const db = init();
	return db.prepare('SELECT * from locations').all();
}

function listInventoriesForLocation(locationId: number) {
	const db = init();
	return db.prepare('SELECT * from inventories where location_id = ?').all(locationId);
}

function listItemsForLocation(locationId: number) {
	const db = init();
	return db.prepare('SELECT * from items where location_id = ?').all(locationId);
}

export default init;
