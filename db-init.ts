import initDB from './src/lib/database/db.ts';
import { readFileSync, unlinkSync } from 'node:fs';
const schema = readFileSync('initdb.sql', 'utf8');

function init() {
	//Delete db file if it exists
	try {
		unlinkSync('inventory.db');
	} catch (error) {
		console.log('No db file to delete');
	}

	//Init db
	const db = initDB();

	//Init schema
	db.exec(schema);

	// Add locations
	db.prepare('INSERT INTO locations (id, name) VALUES (?, ?)').run(1, 'Dragon');
	db.prepare('INSERT INTO locations (id, name) VALUES (?, ?)').run(2, 'Wizard');
	db.prepare('INSERT INTO locations (id, name) VALUES (?, ?)').run(3, 'Pig and Whistle');

	// Add containers
	db.prepare('INSERT INTO containers (id, size) VALUES (?, ?)').run(1, 1);
	db.prepare('INSERT INTO containers (id, size) VALUES (?, ?)').run(2, 4);
	db.prepare('INSERT INTO containers (id, size) VALUES (?, ?)').run(3, 6);
	db.prepare('INSERT INTO containers (id, size) VALUES (?, ?)').run(4, 12);
	db.prepare('INSERT INTO containers (id, size) VALUES (?, ?)').run(5, 24);
	db.prepare('INSERT INTO containers (id, size) VALUES (?, ?)').run(6, 70);
	db.prepare('INSERT INTO containers (id, size) VALUES (?, ?)').run(7, 90);
	db.prepare('INSERT INTO containers (id, size) VALUES (?, ?)').run(8, 420);
	db.prepare('INSERT INTO containers (id, size) VALUES (?, ?)').run(9, 2520);

	// Add items
	db.prepare('INSERT INTO items (id, name, price) VALUES (?, ?, ?)').run(1, 'Miller Lite', 8);
	db.prepare('INSERT INTO items (id, name, price) VALUES (?, ?, ?)').run(2, 'Coors Light', 8);
	db.prepare('INSERT INTO items (id, name, price) VALUES (?, ?, ?)').run(3, 'Blue Moon', 12);
	db.prepare('INSERT INTO items (id, name, price) VALUES (?, ?, ?)').run(4, 'Blue Moon Light', 7);
	db.prepare('INSERT INTO items (id, name, price) VALUES (?, ?, ?)').run(5, 'Blue Moon N/A', 6);
	db.prepare('INSERT INTO items (id, name, price) VALUES (?, ?, ?)').run(6, 'Summer Shandy', 7);
	db.prepare('INSERT INTO items (id, name, price) VALUES (?, ?, ?)').run(7, 'Coors Banquet', 8);
	db.prepare('INSERT INTO items (id, name, price) VALUES (?, ?, ?)').run(8, 'Topo Chico', 7);
	db.prepare('INSERT INTO items (id, name, price) VALUES (?, ?, ?)').run(9, 'Callsign IPA', 8);
	db.prepare('INSERT INTO items (id, name, price) VALUES (?, ?, ?)').run(10, 'Happy Thursday', 7);
	db.prepare('INSERT INTO items (id, name, price) VALUES (?, ?, ?)').run(11, 'Arnold Palmer', 13);
	db.prepare('INSERT INTO items (id, name, price) VALUES (?, ?, ?)').run(12, 'Simply Spiked', 13);
	db.prepare('INSERT INTO items (id, name, price) VALUES (?, ?, ?)').run(13, 'Guinness', 11);
	db.prepare('INSERT INTO items (id, name, price) VALUES (?, ?, ?)').run(14, 'Harp', 8);
	db.prepare('INSERT INTO items (id, name, price) VALUES (?, ?, ?)').run(15, 'Smithwicks', 8);
	db.prepare('INSERT INTO items (id, name, price) VALUES (?, ?, ?)').run(16, 'Woodchuck Amber', 8);
	db.prepare('INSERT INTO items (id, name, price) VALUES (?, ?, ?)').run(
		17,
		'Woodchuck Granny Smith',
		8
	);
	db.prepare('INSERT INTO items (id, name, price) VALUES (?, ?, ?)').run(18, 'Wine', 8);
	db.prepare('INSERT INTO items (id, name, price) VALUES (?, ?, ?)').run(19, '5oz Cups', 10);
	db.prepare('INSERT INTO items (id, name, price) VALUES (?, ?, ?)').run(20, '12 Oz Cups', 7);
	db.prepare('INSERT INTO items (id, name, price) VALUES (?, ?, ?)').run(21, '12 Oz Cups', 8);
	db.prepare('INSERT INTO items (id, name, price) VALUES (?, ?, ?)').run(22, '12 Oz Cups', 9);

	// Add location items for Wizard
	db.prepare('INSERT INTO location_items (location_id, item_id) VALUES (?, ?)').run(2, 1);
	db.prepare('INSERT INTO location_items (location_id, item_id) VALUES (?, ?)').run(2, 2);
	db.prepare('INSERT INTO location_items (location_id, item_id) VALUES (?, ?)').run(2, 3);
	db.prepare('INSERT INTO location_items (location_id, item_id) VALUES (?, ?)').run(2, 4);
	db.prepare('INSERT INTO location_items (location_id, item_id) VALUES (?, ?)').run(2, 5);
	db.prepare('INSERT INTO location_items (location_id, item_id) VALUES (?, ?)').run(2, 6);
	db.prepare('INSERT INTO location_items (location_id, item_id) VALUES (?, ?)').run(2, 7);
	db.prepare('INSERT INTO location_items (location_id, item_id) VALUES (?, ?)').run(2, 8);
	db.prepare('INSERT INTO location_items (location_id, item_id) VALUES (?, ?)').run(2, 9);
	db.prepare('INSERT INTO location_items (location_id, item_id) VALUES (?, ?)').run(2, 10);
	db.prepare('INSERT INTO location_items (location_id, item_id) VALUES (?, ?)').run(2, 11);
	db.prepare('INSERT INTO location_items (location_id, item_id) VALUES (?, ?)').run(2, 13);
	db.prepare('INSERT INTO location_items (location_id, item_id) VALUES (?, ?)').run(2, 14);
	db.prepare('INSERT INTO location_items (location_id, item_id) VALUES (?, ?)').run(2, 15);
	db.prepare('INSERT INTO location_items (location_id, item_id) VALUES (?, ?)').run(2, 16);
	db.prepare('INSERT INTO location_items (location_id, item_id) VALUES (?, ?)').run(2, 17);
	db.prepare('INSERT INTO location_items (location_id, item_id) VALUES (?, ?)').run(2, 18);
	db.prepare('INSERT INTO location_items (location_id, item_id) VALUES (?, ?)').run(2, 19);

	// Add item_containers
	for (let i = 1; i < 18; i++) {
		// //TODO make this accurate to what packages the cans actually come in
		// All cans get 1, 4, 6, 12, 24
		db.prepare('INSERT INTO item_containers (item_id, container_id) VALUES (?, ?)').run(i, 1);
		db.prepare('INSERT INTO item_containers (item_id, container_id) VALUES (?, ?)').run(i, 2);
		db.prepare('INSERT INTO item_containers (item_id, container_id) VALUES (?, ?)').run(i, 3);
		db.prepare('INSERT INTO item_containers (item_id, container_id) VALUES (?, ?)').run(i, 4);
		db.prepare('INSERT INTO item_containers (item_id, container_id) VALUES (?, ?)').run(i, 5);
	}

	// Wines get 1, 4, or 24
	db.prepare('INSERT INTO item_containers (item_id, container_id) VALUES (?, ?)').run(18, 1);
	db.prepare('INSERT INTO item_containers (item_id, container_id) VALUES (?, ?)').run(18, 2);
	db.prepare('INSERT INTO item_containers (item_id, container_id) VALUES (?, ?)').run(18, 5);

	//5 oz cups get 1, 90, and 2520
	db.prepare('INSERT INTO item_containers (item_id, container_id) VALUES (?, ?)').run(19, 1);
	db.prepare('INSERT INTO item_containers (item_id, container_id) VALUES (?, ?)').run(19, 7);
	db.prepare('INSERT INTO item_containers (item_id, container_id) VALUES (?, ?)').run(19, 9);

	//12 oz cups get 1, 70, and 420
	db.prepare('INSERT INTO item_containers (item_id, container_id) VALUES (?, ?)').run(20, 1);
	db.prepare('INSERT INTO item_containers (item_id, container_id) VALUES (?, ?)').run(20, 6);
	db.prepare('INSERT INTO item_containers (item_id, container_id) VALUES (?, ?)').run(20, 8);

	// Get all data
	let locations = db.prepare('SELECT * from locations').all();
	let containers = db.prepare('SELECT * from containers').all();
	let items = db.prepare('SELECT * from items').all();
	console.log('init');
	console.log(locations, containers, items);
}

init();
