/** Parse a YYYY-MM-DD calendar date as local midnight, not UTC. */
export function parseCalendarDate(dateString: string): Date {
	const [year, month, day] = dateString.split('-').map(Number);
	return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function formatCalendarDate(
	dateString: string,
	options: Intl.DateTimeFormatOptions = {
		weekday: 'short',
		month: 'short',
		day: 'numeric'
	}
): string {
	return parseCalendarDate(dateString).toLocaleDateString('en-US', options);
}

export function formatCalendarDateShort(dateString: string): string {
	const date = parseCalendarDate(dateString);
	const dayAbbr = date.toLocaleDateString('en-US', { weekday: 'short' });
	const month = date.getMonth() + 1;
	const day = date.getDate();
	const year = date.getFullYear().toString().slice(-2);
	return `${dayAbbr} - ${month}/${day}/${year}`;
}

export function todayCalendarDate(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export function isCalendarDate(value: string): boolean {
	return /^\d{4}-\d{2}-\d{2}$/.test(value);
}
