/** Local-date (not UTC) YYYY-MM-DD — avoids the timezone-shift bugs that
 * `Date#toISOString()` causes for anything but UTC+0.
 */
export function toDateKey(date: Date): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
	const [y, m, d] = key.split("-").map(Number);
	return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** True if `key` falls within [startKey, endKey] (both inclusive), as plain
 * YYYY-MM-DD string comparison — safe because the format is fixed-width.
 */
export function isDateInRange(key: string, startKey: string, endKey: string): boolean {
	return key >= startKey && key <= endKey;
}

export const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

/** A 6x7 grid (weeks x weekdays) covering the given month, padded with the
 * trailing days of the previous/next month so every week is a full row.
 */
export function getMonthGrid(year: number, month: number): { date: Date; inMonth: boolean }[][] {
	const first = new Date(year, month, 1);
	const gridStart = new Date(year, month, 1 - first.getDay());

	const weeks: { date: Date; inMonth: boolean }[][] = [];
	let cursor = new Date(gridStart);
	for (let week = 0; week < 6; week++) {
		const row: { date: Date; inMonth: boolean }[] = [];
		for (let day = 0; day < 7; day++) {
			row.push({ date: new Date(cursor), inMonth: cursor.getMonth() === month });
			cursor.setDate(cursor.getDate() + 1);
		}
		weeks.push(row);
	}
	return weeks;
}
