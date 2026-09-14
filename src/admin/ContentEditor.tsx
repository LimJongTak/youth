import { useState } from "react";
import { useSiteContent } from "../context/SiteContentContext";
import { SITE_CONTENT_SECTIONS, type SiteContent } from "../types/siteContent";
import styles from "./ContentEditor.module.scss";

const sectionMeta: Record<keyof SiteContent, { title: string; hint: string }> = {
	hero: { title: "히어로 (첫 화면)", hint: "제목, 소개 문구, 상단 통계 3개" },
	about: { title: "프로그램 소개", hint: "소개 섹션 문구" },
	checklist: { title: "모집대상 체크리스트", hint: "자가 체크 항목 목록" },
	commonCourse: { title: "커리큘럼 - 공통과정", hint: "공통과정 안내 문구" },
	tracks: { title: "커리큘럼 - 트랙", hint: "초급/중급/고급 트랙 상세" },
	benefits: { title: "참여 혜택", hint: "혜택 카드 4개" },
	journey: { title: "참여 여정", hint: "타임라인 단계" },
	applySteps: { title: "신청 방법 단계", hint: "신청 절차 3단계" },
	faqs: { title: "자주 묻는 질문", hint: "FAQ 목록" },
	contact: { title: "문의처", hint: "이메일, 주소, 카카오톡/공식페이지 링크" },
};

function SectionCard<K extends keyof SiteContent>({ section }: { section: K }) {
	const { content, updateSection } = useSiteContent();
	const [open, setOpen] = useState(false);
	const [draft, setDraft] = useState(() => JSON.stringify(content[section], null, 2));
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);
	const meta = sectionMeta[section];

	function handleOpen() {
		if (!open) setDraft(JSON.stringify(content[section], null, 2));
		setOpen((o) => !o);
		setError(null);
		setSuccess(null);
	}

	async function handleSave() {
		setError(null);
		setSuccess(null);
		let parsed: SiteContent[K];
		try {
			parsed = JSON.parse(draft);
		} catch {
			setError("JSON 형식이 올바르지 않습니다. 문법을 확인해주세요.");
			return;
		}
		setSaving(true);
		try {
			await updateSection(section, parsed);
			setSuccess("저장되었습니다. 공개 사이트에 바로 반영됩니다.");
		} catch {
			setError("저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
		} finally {
			setSaving(false);
		}
	}

	return (
		<div className={styles.card}>
			<button className={styles.head} onClick={handleOpen}>
				<span>
					<span className={styles.headTitle}>{meta.title}</span>
					<span className={styles.headHint}>{meta.hint}</span>
				</span>
				<i className={`fas ${open ? "fa-chevron-up" : "fa-chevron-down"}`} />
			</button>
			{open && (
				<div className={styles.body}>
					<textarea
						className={styles.textarea}
						value={draft}
						onChange={(e) => setDraft(e.target.value)}
						spellCheck={false}
					/>
					<div className={styles.actions}>
						<button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
							{saving ? "저장 중..." : "저장"}
						</button>
						{error && <p className={styles.error}>{error}</p>}
						{success && <p className={styles.success}>{success}</p>}
					</div>
				</div>
			)}
		</div>
	);
}

export function ContentEditor() {
	return (
		<div className={styles.list}>
			{SITE_CONTENT_SECTIONS.map((section) => (
				<SectionCard key={section} section={section} />
			))}
		</div>
	);
}
