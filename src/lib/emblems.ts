export type EmblemId = 'dragon' | 'wizard' | 'pig' | 'mullet' | 'crown' | 'tankard';

export const EMBLEM_IDS: EmblemId[] = ['dragon', 'wizard', 'pig', 'mullet', 'crown', 'tankard'];

/** A house whose name names its charge gets that charge. */
const BY_NAME: Array<[RegExp, EmblemId]> = [
	[/dragon|wyvern|drake/i, 'dragon'],
	[/wizard|mage|sorcer|warlock/i, 'wizard'],
	[/pig|boar|hog|swine|sow/i, 'pig'],
	[/crown|king|queen|royal|regent/i, 'crown'],
	[/star|mullet|comet/i, 'mullet'],
	[/tankard|tavern|ale|keg|barrel|inn/i, 'tankard']
];

/** Stable per-location emblem. Same location always gets the same charge. */
export function emblemFor(locationId: string, name?: string): EmblemId {
	if (name) {
		for (const [pattern, emblem] of BY_NAME) {
			if (pattern.test(name)) return emblem;
		}
	}

	let hash = 0;
	for (let i = 0; i < locationId.length; i++) {
		hash = (hash * 31 + locationId.charCodeAt(i)) | 0;
	}
	return EMBLEM_IDS[Math.abs(hash) % EMBLEM_IDS.length]!;
}
