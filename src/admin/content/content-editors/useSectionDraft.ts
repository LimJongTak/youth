import { useState } from "react";
import { useSiteContent } from "../../../context/SiteContentContext";
import type { SiteContent } from "../../../types/siteContent";

/**
 * SiteContent의 한 섹션을 편집할 로컬 임시본(draft)과, 그걸 Firestore에
 * 저장하는 save() 함수를 제공. `content`를 바로 수정하지 않고 로컬에
 * 임시본을 두는 이유는, 관리자가 타이핑할 때마다 DB를 왕복하지 않고
 * 자유롭게 입력한 뒤 "저장" 버튼을 눌렀을 때만 실제로 반영되게 하기 위함.
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
