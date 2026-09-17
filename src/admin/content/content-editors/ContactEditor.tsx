import { useSectionDraft } from "./useSectionDraft";
import { TextField, SaveBar } from "./Field";
import styles from "./shared.module.scss";

// 문의처(기관명/이메일/주소/카카오톡·공식 페이지 링크) 편집 폼.
export function ContactEditor() {
	const { draft, setDraft, save, saving, success, error } = useSectionDraft("contact");

	return (
		<div className={styles.form}>
			<TextField
				label="기관명"
				value={draft.org}
				onChange={(v) => setDraft({ ...draft, org: v })}
			/>
			<TextField
				label="이메일"
				type="email"
				value={draft.email}
				onChange={(v) => setDraft({ ...draft, email: v })}
			/>
			<TextField
				label="주소"
				value={draft.address}
				onChange={(v) => setDraft({ ...draft, address: v })}
			/>
			<TextField
				label="공식 홈페이지 링크"
				type="url"
				value={draft.officialUrl}
				onChange={(v) => setDraft({ ...draft, officialUrl: v })}
			/>
			<TextField
				label="카카오톡 오픈채팅 링크"
				type="url"
				value={draft.kakaoUrl}
				onChange={(v) => setDraft({ ...draft, kakaoUrl: v })}
			/>
			<SaveBar onSave={save} saving={saving} success={success} error={error} />
		</div>
	);
}
