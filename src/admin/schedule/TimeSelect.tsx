import formStyles from "./ScheduleEventForm.module.scss";

interface TimeSelectProps {
	id?: string;
	/** "HH:MM" 또는 빈 문자열(시간 없음). */
	value: string;
	onChange: (value: string) => void;
	/** 이 시간보다 뒤만 고를 수 있음 — 종료시간이 시작시간 이후가 되도록. */
	after?: string;
	ariaLabel?: string;
	className?: string;
}

const MINUTE_STEP = 5;
const HOURS = Array.from({ length: 24 }, (_, h) => h);
const MINUTES = Array.from({ length: 60 / MINUTE_STEP }, (_, i) => i * MINUTE_STEP);

const pad = (n: number) => String(n).padStart(2, "0");

function parse(value: string): [number, number] | null {
	const match = /^(\d{1,2}):(\d{2})/.exec(value);
	return match ? [Number(match[1]), Number(match[2])] : null;
}

function hourLabel(h: number) {
	if (h === 0) return "오전 12시";
	if (h < 12) return `오전 ${h}시`;
	if (h === 12) return "오후 12시";
	return `오후 ${h - 12}시`;
}

/**
 * 시/분 드롭다운 두 개로 된 시간 선택기. 네이티브 time input은 step·min을
 * 브라우저(특히 모바일)마다 무시하는 경우가 많아, 5분 단위와 "시작시간
 * 이후만" 제약을 확실히 걸기 위해 직접 만든다.
 */
export function TimeSelect({ id, value, onChange, after, ariaLabel, className }: TimeSelectProps) {
	const current = parse(value);
	const lower = after ? parse(after) : null;
	const minTotal = lower ? lower[0] * 60 + lower[1] : -1;

	const minutesFor = (h: number) => {
		const list = MINUTES.filter((m) => h * 60 + m > minTotal);
		// 엑셀 등으로 들어온 5분 단위가 아닌 기존 값도 그대로 보이도록 유지.
		if (current && current[0] === h && !list.includes(current[1])) {
			list.push(current[1]);
			list.sort((a, b) => a - b);
		}
		return list;
	};

	const hours = HOURS.filter((h) => minutesFor(h).length > 0 || current?.[0] === h);
	const minutes = current ? minutesFor(current[0]) : MINUTES;

	function handleHour(next: string) {
		if (next === "") {
			onChange("");
			return;
		}
		const h = Number(next);
		const options = minutesFor(h);
		const m = current && options.includes(current[1]) ? current[1] : (options[0] ?? 0);
		onChange(`${pad(h)}:${pad(m)}`);
	}

	return (
		<div className={`${formStyles.timeSelect} ${className ?? ""}`} role="group" aria-label={ariaLabel}>
			<select id={id} value={current ? String(current[0]) : ""} onChange={(e) => handleHour(e.target.value)}>
				<option value="">--시</option>
				{hours.map((h) => (
					<option key={h} value={h}>
						{hourLabel(h)}
					</option>
				))}
			</select>
			<select
				aria-label="분"
				value={current ? String(current[1]) : ""}
				disabled={!current}
				onChange={(e) => current && onChange(`${pad(current[0])}:${pad(Number(e.target.value))}`)}
			>
				{!current && <option value="">--분</option>}
				{minutes.map((m) => (
					<option key={m} value={m}>
						{pad(m)}분
					</option>
				))}
			</select>
		</div>
	);
}
