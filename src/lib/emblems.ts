export type EmblemId = 'dragon' | 'wizard' | 'boar' | 'mullet' | 'crown' | 'tankard';

export const EMBLEM_IDS: EmblemId[] = ['dragon', 'wizard', 'boar', 'mullet', 'crown', 'tankard'];

/** Stable per-location emblem. Same location always gets the same charge. */
export function emblemFor(locationId: string): EmblemId {
	let hash = 0;
	for (let i = 0; i < locationId.length; i++) {
		hash = (hash * 31 + locationId.charCodeAt(i)) | 0;
	}
	return EMBLEM_IDS[Math.abs(hash) % EMBLEM_IDS.length]!;
}
