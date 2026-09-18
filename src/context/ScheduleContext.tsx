import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import { collection, deleteDoc, doc, onSnapshot, setDoc, writeBatch } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { ScheduleEvent, ScheduleEventDraft } from "../types/schedule";

// 교육 일정(수업/이벤트)을 Firestore와 실시간 동기화하는 컨텍스트 —
// 공개 사이트 일정 탭·홈 미리보기와 관리자 일정 관리 화면이 공용으로 사용.
const COLLECTION = "schedules";
// Firestore는 배치(batch) 하나당 최대 500개 쓰기까지만 허용 — 대량 엑셀
// 업로드가 그 한도에 걸리지 않도록 충분히 여유 있게 잘라서 처리한다.
const BATCH_CHUNK = 400;

interface ScheduleContextValue {
	events: ScheduleEvent[];
	loading: boolean;
	addEvent: (event: ScheduleEventDraft) => Promise<void>;
	updateEvent: (event: ScheduleEvent) => Promise<void>;
	removeEvent: (id: string) => Promise<void>;
	/** 엑셀 업로드로 여러 일정을 한 번에 추가 — 기존 일정을 지우지 않고
	 * 항상 추가만 한다. */
	addMany: (events: ScheduleEventDraft[]) => Promise<void>;
}

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

// 배열을 size개씩 나눠 여러 덩어리로 쪼갠다 (엑셀 대량 업로드를 배치
// 쓰기 한도 안에서 처리하기 위함).
function chunk<T>(items: T[], size: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
	return chunks;
}

// 시작/종료 시간을 비워둔 종일 일정은 startTime/endTime이 undefined로
// 넘어오는데, Firestore는 값이 undefined인 필드가 있으면 setDoc/batch.set
// 자체를 거부한다 — 로그인과 무관한 오류인데도 저장 실패로 이어지므로,
// 쓰기 전에 undefined 필드를 모두 제거한다.
function stripUndefined<T extends object>(value: T): T {
	return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as T;
}

export function ScheduleProvider({ children }: { children: ReactNode }) {
	const [events, setEvents] = useState<ScheduleEvent[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		return onSnapshot(
			collection(db, COLLECTION),
			(snapshot) => {
				setEvents(snapshot.docs.map((d) => d.data() as ScheduleEvent));
				setLoading(false);
			},
			() => setLoading(false),
		);
	}, []);

	const value = useMemo<ScheduleContextValue>(
		() => ({
			events,
			loading,
			addEvent: async (draft) => {
				const id = doc(collection(db, COLLECTION)).id;
				await setDoc(doc(db, COLLECTION, id), stripUndefined({ ...draft, id }));
			},
			updateEvent: async (event) => {
				await setDoc(doc(db, COLLECTION, event.id), stripUndefined(event));
			},
			removeEvent: async (id) => {
				await deleteDoc(doc(db, COLLECTION, id));
			},
			addMany: async (drafts) => {
				for (const group of chunk(drafts, BATCH_CHUNK)) {
					const batch = writeBatch(db);
					for (const draft of group) {
						const id = doc(collection(db, COLLECTION)).id;
						batch.set(doc(db, COLLECTION, id), stripUndefined({ ...draft, id }));
					}
					await batch.commit();
				}
			},
		}),
		[events, loading],
	);

	return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
}

export function useSchedule(): ScheduleContextValue {
	const ctx = useContext(ScheduleContext);
	if (!ctx) throw new Error("useSchedule must be used within a ScheduleProvider");
	return ctx;
}
