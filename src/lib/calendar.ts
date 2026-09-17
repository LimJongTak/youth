// 캘린더 관련 공통 유틸 — 일정 탭, 홈 미리보기, 관리자 일정 관리에서 공용으로 사용.

/** 로컬 기준(UTC 아님) YYYY-MM-DD 문자열로 변환 — `Date#toISOString()`을
 * 쓰면 UTC+0이 아닌 지역에서 날짜가 하루씩 밀리는 버그가 생기는 걸 피한다.
 */
export function toDateKey(date: Date): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

// "YYYY-MM-DD" 문자열을 다시 Date 객체로.
export function parseDateKey(key: string): Date {
	const [y, m, d] = key.split("-").map(Number);
	return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** `key`가 [startKey, endKey] 범위(양 끝 포함) 안에 있는지 — 고정 자릿수
 * 형식이라 문자열 비교만으로도 안전하게 날짜 비교가 된다.
 */
export function isDateInRange(key: string, startKey: string, endKey: string): boolean {
	return key >= startKey && key <= endKey;
}

export const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

/** 해당 월을 덮는 6주×7일 그리드 — 각 주가 항상 꽉 채워지도록 이전/다음
 * 달의 날짜로 앞뒤를 채운다.
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
