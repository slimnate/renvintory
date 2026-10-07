export const TWELVE_OZ_PRICES = [7, 8, 9] as const;
export const GREEN_PAGE_SIZE = 5;
export const YELLOW_PAGE_SIZE = 10;

export type CloseReportRow = {
	name: string;
	price: number;
	openCount: number;
	closeCount: number;
	spillCount: number;
	intakeCount: number;
	openPlusIntakeCount: number;
	totalUsed: number;
	soldCount: number;
	spilledValue: number;
	sales: number;
};

export type GreenSheetRow = {
	name: string;
	price: number;
	openCount: number;
	intakeCount: number;
	openPlusIntakeCount: number;
	closeCount: number;
	totalUsed: number;
	spillCount: number;
	soldCount: number;
	sales: number;
	spilledValue: number;
};

export type YellowSheetRow = {
	name: string;
	price: number;
	totalUsed: number | null;
	spillCount: number | null;
	soldCount: number | null;
	sales: number | null;
	spilledValue: number | null;
};

export function chunk<T>(items: T[], size: number): T[][] {
	const pages: T[][] = [];
	for (let i = 0; i < items.length; i += size) {
		pages.push(items.slice(i, i + size));
	}
	return pages;
}

export function isTwelveOzCups(name: string): boolean {
	return /12\s*oz\s*cups/i.test(name);
}

export function splitEvenly(n: number, parts = 3): number[] {
	const base = Math.floor(n / parts);
	const rem = n % parts;
	return Array.from({ length: parts }, (_, i) => base + (rem > parts - 1 - i ? 1 : 0));
}

function toGreenRow(row: CloseReportRow): GreenSheetRow {
	return {
		name: row.name,
		price: row.price,
		openCount: row.openCount,
		intakeCount: row.intakeCount,
		openPlusIntakeCount: row.openPlusIntakeCount,
		closeCount: row.closeCount,
		totalUsed: row.totalUsed,
		spillCount: row.spillCount,
		soldCount: row.soldCount,
		sales: row.sales,
		spilledValue: row.spilledValue
	};
}

function splitTwelveOzGreen(row: CloseReportRow): GreenSheetRow[] {
	const opens = splitEvenly(row.openCount);
	const intakes = splitEvenly(row.intakeCount);
	const closes = splitEvenly(row.closeCount);
	const spills = splitEvenly(row.spillCount);

	return TWELVE_OZ_PRICES.map((price, i) => {
		const openCount = opens[i] ?? 0;
		const intakeCount = intakes[i] ?? 0;
		const closeCount = closes[i] ?? 0;
		const spillCount = spills[i] ?? 0;
		const openPlusIntakeCount = openCount + intakeCount;
		const totalUsed = openPlusIntakeCount - closeCount;
		const soldCount = totalUsed - spillCount;

		return {
			name: `${row.name} ($${price})`,
			price,
			openCount,
			intakeCount,
			openPlusIntakeCount,
			closeCount,
			totalUsed,
			spillCount,
			soldCount,
			sales: soldCount * price,
			spilledValue: spillCount * price
		};
	});
}

export function expandGreenRows(rows: CloseReportRow[]): GreenSheetRow[] {
	return rows.flatMap((row) =>
		isTwelveOzCups(row.name) ? splitTwelveOzGreen(row) : [toGreenRow(row)]
	);
}

export function expandYellowRows(rows: CloseReportRow[]): YellowSheetRow[] {
	return rows.flatMap((row): YellowSheetRow[] => {
		if (isTwelveOzCups(row.name)) {
			return TWELVE_OZ_PRICES.map((price) => ({
				name: `${row.name} ($${price})`,
				price,
				totalUsed: null,
				spillCount: null,
				soldCount: null,
				sales: null,
				spilledValue: null
			}));
		}

		return [
			{
				name: row.name,
				price: row.price,
				totalUsed: row.totalUsed,
				spillCount: row.spillCount,
				soldCount: row.soldCount,
				sales: row.sales,
				spilledValue: row.spilledValue
			}
		];
	});
}

export function sheetTotals(rows: Array<{ sales: number | null; spilledValue: number | null }>): {
	totalSales: number;
	totalSpillage: number;
} {
	return {
		totalSales: rows.reduce((sum, row) => sum + (row.sales ?? 0), 0),
		totalSpillage: rows.reduce((sum, row) => sum + (row.spilledValue ?? 0), 0)
	};
}
