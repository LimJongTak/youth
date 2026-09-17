import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

/**
 * 최소한의 자체(1st-party) 통계 기록 — 외부 서비스나 추적 ID 없이
 * Firestore에 이벤트를 던져놓기만 하고(fire-and-forget), 관리자 "통계"
 * 탭에서 확인한다. 절대 예외를 던지지 않음 — 기록 실패가 방문자 경험에
 * 영향을 주면 안 되기 때문.
 */
export function logEvent(name: string, data: Record<string, unknown> = {}) {
	addDoc(collection(db, "analyticsEvents"), {
		name,
		...data,
		path: `${window.location.pathname}${window.location.hash}`,
		at: serverTimestamp(),
	}).catch(() => {});
}
