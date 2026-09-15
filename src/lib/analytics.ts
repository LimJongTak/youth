import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Minimal first-party analytics: fire-and-forget event logging to
 * Firestore, viewable from the admin "통계" tab. No external service or
 * tracking ID required. Never throws — a logging failure must not affect
 * the visitor's experience.
 */
export function logEvent(name: string, data: Record<string, unknown> = {}) {
	addDoc(collection(db, "analyticsEvents"), {
		name,
		...data,
		path: `${window.location.pathname}${window.location.hash}`,
		at: serverTimestamp(),
	}).catch(() => {});
}
