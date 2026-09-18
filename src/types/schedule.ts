/** 교육 캘린더의 일정 한 건 — 수업(강의)이거나 OT/현장학습/수료식 같은
 * 일반 일정. 두 경우 모두 같은 모양을 쓰며, 일반 일정은 수업 전용 필드
 * (시간/장소/강사)를 비워두면 된다.
 */
export interface ScheduleEvent {
	id: string;
	cohortId: string;
	/** 수업이면 강의명, 아니면 일정 자체의 제목(예: "수료식"). */
	title: string;
	/** YYYY-MM-DD */
	startDate: string;
	/** YYYY-MM-DD — 하루짜리 일정이면 startDate와 동일. */
	endDate: string;
	/** HH:MM, 24시간제. 종일/기간 일정이면 생략. */
	startTime?: string;
	endTime?: string;
	location?: string;
	instructor?: string;
	memo?: string;
	/** 캘린더 점 색상용 HEX 값(예: "#14b8a6"). 지정 안 하면 기본 teal 색으로
	 * 표시 — 이 필드가 생기기 전에 만들어진 일정도 그냥 기본색으로 보임. */
	color?: string;
	/** 캘린더에 표시할 방식 — "dot"(기본, 매일 점 하나) 또는 "bar"(여러
	 * 날짜에 걸친 기간을 이어진 막대로 표시). 지정 안 하면 "dot"으로 취급
	 * (이 필드가 생기기 전에 만들어진 일정 포함). */
	displayStyle?: "dot" | "bar";
}

export type ScheduleEventDraft = Omit<ScheduleEvent, "id">;
