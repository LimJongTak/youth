import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { addDoc, collection, doc, onSnapshot, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { defaultSiteContent } from "../data/defaultSiteContent";
import type { SiteContent } from "../types/siteContent";

// 관리자 CMS(콘텐츠 관리)에서 편집하는 공개 사이트 문구/데이터를 Firestore
// 문서 하나(siteContent/main)와 실시간 동기화하는 컨텍스트.
const DOC_PATH = ["siteContent", "main"] as const;

interface SiteContentContextValue {
	content: SiteContent;
	loading: boolean;
	updateSection: <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => Promise<void>;
}

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

export function SiteContentProvider({ children }: { children: ReactNode }) {
	const [content, setContent] = useState<SiteContent>(defaultSiteContent);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		return onSnapshot(
			doc(db, ...DOC_PATH),
			(snap) => {
				const data = snap.data();
				if (data) {
					// 기본값 위에 덮어씌우는 방식 — 아직 시드/편집되지 않은
					// 섹션이 있어도 사라지지 않고 기본값으로 그대로 표시됨.
					setContent({ ...defaultSiteContent, ...(data as Partial<SiteContent>) });
				}
				setLoading(false);
			},
			() => setLoading(false),
		);
	}, []);

	// 콘텐츠 섹션 하나를 저장하고, 누가 언제 어떤 섹션을 고쳤는지 auditLog에
	// 남긴다(관리자 "통계" 탭의 "최근 콘텐츠 변경 이력"에 표시됨).
	async function updateSection<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
		await updateDoc(doc(db, ...DOC_PATH), { [key]: value });
		const uid = auth.currentUser?.uid;
		if (uid) {
			addDoc(collection(db, "auditLog"), {
				uid,
				section: key,
				at: serverTimestamp(),
			}).catch(() => {});
		}
	}

	return (
		<SiteContentContext.Provider value={{ content, loading, updateSection }}>
			{children}
		</SiteContentContext.Provider>
	);
}

export function useSiteContent(): SiteContentContextValue {
	const ctx = useContext(SiteContentContext);
	if (!ctx) throw new Error("useSiteContent must be used within a SiteContentProvider");
	return ctx;
}
