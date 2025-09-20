import type { PageServerLoad } from './$types';
import initDB from '$lib/database/db';

const db = initDB();

export const load: PageServerLoad = async () => {
	let locations = db.prepare('SELECT * from locations').all();
	return { locations };
};
