import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from "react";
import { collection, deleteDoc, doc, getDocs, onSnapshot, setDoc, writeBatch } from "firebase/firestore";
import { db } from "../lib/firebase";
import { seedCohorts } from "../data/cohorts";
import type { Cohort } from "../types/cohort";

// 기수(회차) 데이터를 Firestore와 실시간 동기화하는 컨텍스트 — 공개
// 사이트(기수 안내, 신청, 일정 기본값)와 관리자 화면(기수 관리)이 모두
// 이 컨텍스트를 통해 기수 목록을 읽고 쓴다.
const COLLECTION = "cohorts";

interface CohortContextValue {
	cohorts: Cohort[];
	loading: boolean;
	selectedId: string;
	selected: Cohort;
	select: (id: string) => void;
	addCohort: (cohort: Cohort) => Promise<void>;
	updateCohort: (cohort: Cohort) => Promise<void>;
	removeCohort: (id: string) => Promise<void>;
	setFeatured: (id: string) => Promise<void>;
	setScheduleDefault: (id: string) => Promise<void>;
}

const CohortContext = createContext<CohortContextValue | null>(null);

function pickDefaultId(cohorts: Cohort[]): string {
	return cohorts.find((c) => c.featured)?.id ?? cohorts[0]?.id ?? "";
}

export function CohortProvider({ children }: { children: ReactNode }) {
	// Firestore 로딩 중이거나 정말로 비어 있을 때는 내장 시드 데이터로
	// 대체해서 공개 사이트가 항상 뭔가는 보여줄 수 있게 한다. 실제 데이터를
	// Firestore에 넣는 건 최초 1회 관리자/CLI 작업이고(scripts/seed-cohorts.mjs
	// 참고) — 공개 방문자는 로그인 상태가 아니므로 쓰기 권한이 없고, 있어서도
	// 안 된다.
	const [cohorts, setCohorts] = useState<Cohort[]>(seedCohorts);
	const [loading, setLoading] = useState(true);
	const [selectedId, setSelectedId] = useState("");
	const hasSelectedOnce = useRef(false);

	useEffect(() => {
		return onSnapshot(
			collection(db, COLLECTION),
			(snapshot) => {
				if (snapshot.empty) {
					setLoading(false);
					return;
				}

				const next = snapshot.docs.map((d) => d.data() as Cohort);
				setCohorts(next);
				setLoading(false);

				if (!hasSelectedOnce.current) {
					hasSelectedOnce.current = true;
					setSelectedId(pickDefaultId(next));
				}
			},
			() => setLoading(false),
		);
	}, []);

	const selected =
		cohorts.find((c) => c.id === selectedId) ?? cohorts[0] ?? seedCohorts[0];

	const value = useMemo<CohortContextValue>(
		() => ({
			cohorts,
			loading,
			selectedId: selected?.id ?? "",
			selected,
			select: (id) => setSelectedId(id),
			addCohort: async (cohort) => {
				await setDoc(doc(db, COLLECTION, cohort.id), cohort);
			},
			updateCohort: async (cohort) => {
				await setDoc(doc(db, COLLECTION, cohort.id), cohort);
			},
			removeCohort: async (id) => {
				await deleteDoc(doc(db, COLLECTION, id));
			},
			// 공개 사이트에서 기본으로 보여줄 기수를 하나로 지정 — 다른 기수는
			// 전부 false로 함께 내려서 항상 하나만 featured가 되도록 보장.
			setFeatured: async (id) => {
				const snapshot = await getDocs(collection(db, COLLECTION));
				const batch = writeBatch(db);
				snapshot.docs.forEach((d) => {
					batch.update(d.ref, { featured: d.id === id });
				});
				await batch.commit();
			},
			// 일정 탭에서 기본으로 보여줄 기수를 하나로 지정 — 위 setFeatured와
			// 같은 방식이지만 별도 필드라 featured와는 독립적으로 고를 수 있다.
			setScheduleDefault: async (id) => {
				const snapshot = await getDocs(collection(db, COLLECTION));
				const batch = writeBatch(db);
				snapshot.docs.forEach((d) => {
					batch.update(d.ref, { scheduleDefault: d.id === id });
				});
				await batch.commit();
			},
		}),
		[cohorts, loading, selected],
	);

	return <CohortContext.Provider value={value}>{children}</CohortContext.Provider>;
}

export function useCohorts(): CohortContextValue {
	const ctx = useContext(CohortContext);
	if (!ctx) throw new Error("useCohorts must be used within a CohortProvider");
	return ctx;
}
