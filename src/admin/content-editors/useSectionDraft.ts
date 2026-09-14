import { useState } from "react";
import { useSiteContent } from "../../context/SiteContentContext";
import type { SiteContent } from "../../types/siteContent";

/**
 * Local editable draft for one SiteContent section, plus a save() that
 * writes it back to Firestore. Keeping the draft local (rather than
 * editing `content` directly) means an admin can type freely without
 * every keystroke round-tripping to the database, and only commits on
 * an explicit "저장" click.
 */
export function useSectionDraft<K extends keyof SiteContent>(section: K) {
	const { content, updateSection } = useSiteContent();
	const [draft, setDraft] = useState<SiteContent[K]>(content[section]);
	const [saving, setSaving] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function save() {
		setSaving(true);
		setError(null);
		setSuccess(false);
		try {
			await updateSection(section, draft);
			setSuccess(true);
		} catch {
			setError("저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
		} finally {
			setSaving(false);
		}
	}

	return { draft, setDraft, save, saving, success, error };
}
