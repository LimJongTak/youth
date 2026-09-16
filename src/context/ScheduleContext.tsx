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

const COLLECTION = "schedules";
// Firestore caps a single batch at 500 writes — chunk well under that so a
// large excel import never risks hitting the limit.
const BATCH_CHUNK = 400;

interface ScheduleContextValue {
	events: ScheduleEvent[];
	loading: boolean;
	addEvent: (event: ScheduleEventDraft) => Promise<void>;
	updateEvent: (event: ScheduleEvent) => Promise<void>;
	removeEvent: (id: string) => Promise<void>;
	/** Bulk-add from an excel import. Replaces nothing — always additive. */
	addMany: (events: ScheduleEventDraft[]) => Promise<void>;
}

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

function chunk<T>(items: T[], size: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
	return chunks;
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
				await setDoc(doc(db, COLLECTION, id), { ...draft, id });
			},
			updateEvent: async (event) => {
				await setDoc(doc(db, COLLECTION, event.id), event);
			},
			removeEvent: async (id) => {
				await deleteDoc(doc(db, COLLECTION, id));
			},
			addMany: async (drafts) => {
				for (const group of chunk(drafts, BATCH_CHUNK)) {
					const batch = writeBatch(db);
					for (const draft of group) {
						const id = doc(collection(db, COLLECTION)).id;
						batch.set(doc(db, COLLECTION, id), { ...draft, id });
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
