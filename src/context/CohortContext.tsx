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
	// Falls back to the bundled seed data (e.g. while Firestore is still
	// loading, or if it's genuinely empty) so the public site always has
	// something to render. Seeding real data into Firestore is a one-time
	// admin/CLI operation (see scripts/seed-cohorts.mjs) — public visitors
	// are never signed in, so they can't and shouldn't be able to write.
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
			setFeatured: async (id) => {
				const snapshot = await getDocs(collection(db, COLLECTION));
				const batch = writeBatch(db);
				snapshot.docs.forEach((d) => {
					batch.update(d.ref, { featured: d.id === id });
				});
				await batch.commit();
			},
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
