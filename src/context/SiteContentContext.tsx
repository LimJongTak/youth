import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { defaultSiteContent } from "../data/defaultSiteContent";
import type { SiteContent } from "../types/siteContent";

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
					// Merge over the defaults so a section that hasn't been
					// seeded/edited yet still renders instead of disappearing.
					setContent({ ...defaultSiteContent, ...(data as Partial<SiteContent>) });
				}
				setLoading(false);
			},
			() => setLoading(false),
		);
	}, []);

	async function updateSection<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
		await updateDoc(doc(db, ...DOC_PATH), { [key]: value });
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
