import { useState } from "react";
import type { ReactNode } from "react";
import { HeroEditor } from "./content-editors/HeroEditor";
import { ChecklistEditor } from "./content-editors/ChecklistEditor";
import { CommonCourseEditor } from "./content-editors/CommonCourseEditor";
import { TracksEditor } from "./content-editors/TracksEditor";
import { BenefitsEditor } from "./content-editors/BenefitsEditor";
import { JourneyEditor } from "./content-editors/JourneyEditor";
import { ApplyStepsEditor } from "./content-editors/ApplyStepsEditor";
import { ContactEditor } from "./content-editors/ContactEditor";
import styles from "./ContentEditor.module.scss";

// 관리자 "콘텐츠 관리" 탭 — 공개 사이트의 문구/데이터를 섹션별 아코디언
// 목록으로 편집한다. 각 섹션은 아래 sections 배열에 등록된 자기만의 편집
// 컴포넌트를 갖는다.
const sections: { id: string; title: string; hint: string; render: () => ReactNode }[] = [
	{ id: "hero", title: "히어로 (첫 화면)", hint: "제목, 소개 문구, 상단 통계 카드", render: () => <HeroEditor /> },
	{
		id: "checklist",
		title: "모집대상 체크리스트",
		hint: "자가 체크 항목 목록",
		render: () => <ChecklistEditor />,
	},
	{
		id: "commonCourse",
		title: "커리큘럼 - 공통과정",
		hint: "공통과정 안내 문구",
		render: () => <CommonCourseEditor />,
	},
	{ id: "tracks", title: "커리큘럼 - 트랙", hint: "초급/중급/고급 트랙 상세", render: () => <TracksEditor /> },
	{ id: "benefits", title: "참여 혜택", hint: "혜택 카드 목록", render: () => <BenefitsEditor /> },
	{ id: "journey", title: "참여 여정", hint: "타임라인 단계", render: () => <JourneyEditor /> },
	{
		id: "applySteps",
		title: "신청 방법 단계",
		hint: "신청 절차 단계",
		render: () => <ApplyStepsEditor />,
	},
	{
		id: "contact",
		title: "문의처",
		hint: "이메일, 주소, 카카오톡/공식페이지 링크",
		render: () => <ContactEditor />,
	},
];

function SectionCard({ title, hint, render }: (typeof sections)[number]) {
	const [open, setOpen] = useState(false);

	return (
		<div className={styles.card}>
			<button className={styles.head} onClick={() => setOpen((o) => !o)}>
				<span>
					<span className={styles.headTitle}>{title}</span>
					<span className={styles.headHint}>{hint}</span>
				</span>
				<i className={`fas ${open ? "fa-chevron-up" : "fa-chevron-down"}`} />
			</button>
			{open && <div className={styles.body}>{render()}</div>}
		</div>
	);
}

export function ContentEditor() {
	return (
		<div className={styles.list}>
			{sections.map((section) => (
				<SectionCard key={section.id} {...section} />
			))}
		</div>
	);
}
