// 관리자 통계 탭의 일별/주별/월별/년별 기간 그래프를 만들기 위한 날짜
// 구간(버킷) 계산 유틸.
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

// 월요일 시작 기준 주 — 앱의 다른 곳(모집기간/교육기간)에서 날짜를 읽는
// 방식과 맞춤.
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

/** `period` 단위로 연속된 N개 구간을 오래된 순서로 반환 — 마지막 구간은
 * "지금"이 속한 구간이다. 각 기간 뷰가 그리는 그래프의 x축 값이 된다.
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
