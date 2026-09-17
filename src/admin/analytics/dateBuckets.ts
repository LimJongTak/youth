export type Period = "day" | "week" | "month" | "year";

export const PERIOD_CONFIG: Record<Period, { label: string; count: number; rangeLabel: string }> = {
	day: { label: "일별", count: 14, rangeLabel: "최근 14일" },
	week: { label: "주별", count: 8, rangeLabel: "최근 8주" },
	month: { label: "월별", count: 12, rangeLabel: "최근 12개월" },
	year: { label: "년별", count: 5, rangeLabel: "최근 5년" },
};

function startOfDay(d: Date) {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Monday-start week, matching how 모집기간/교육기간 dates read elsewhere in the app.
function startOfWeek(d: Date) {
	const day = (d.getDay() + 6) % 7;
	return startOfDay(new Date(d.getFullYear(), d.getMonth(), d.getDate() - day));
}

function periodStart(d: Date, period: Period): Date {
	switch (period) {
		case "day":
			return startOfDay(d);
		case "week":
			return startOfWeek(d);
		case "month":
			return new Date(d.getFullYear(), d.getMonth(), 1);
		case "year":
			return new Date(d.getFullYear(), 0, 1);
	}
}

function addPeriods(d: Date, period: Period, n: number): Date {
	switch (period) {
		case "day":
			return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
		case "week":
			return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n * 7);
		case "month":
			return new Date(d.getFullYear(), d.getMonth() + n, 1);
		case "year":
			return new Date(d.getFullYear() + n, 0, 1);
	}
}

function bucketLabel(start: Date, period: Period): string {
	switch (period) {
		case "day":
		case "week":
			return `${start.getMonth() + 1}/${start.getDate()}`;
		case "month":
			return `${start.getFullYear()}.${String(start.getMonth() + 1).padStart(2, "0")}`;
		case "year":
			return `${start.getFullYear()}`;
	}
}

export interface Bucket {
	start: Date;
	end: Date;
	label: string;
}

/** N consecutive buckets of `period`, oldest first, ending at the bucket that
 * contains "now" — the fixed x-axis every period view renders against.
 */
export function buildBuckets(period: Period, now: Date = new Date()): Bucket[] {
	const { count } = PERIOD_CONFIG[period];
	const currentStart = periodStart(now, period);
	return Array.from({ length: count }, (_, i) => {
		const start = addPeriods(currentStart, period, i - (count - 1));
		const end = addPeriods(start, period, 1);
		return { start, end, label: bucketLabel(start, period) };
	});
}
