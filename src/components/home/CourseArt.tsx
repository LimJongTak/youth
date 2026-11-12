import {
	cohortName,
	resolveCoverPreset,
	type Cohort,
	type CoverPreset,
} from "../../types/cohort";
import { Icon } from "../icons/Icon";
import styles from "./CourseArt.module.scss";

// 과정 대표 이미지 — 관리자가 업로드한 이미지(카드용 4:3 / 상세용 16:10)가
// 있으면 그걸, 없으면 단계별
// 기본 디자인(라떼/카라멜/에스프레소/모카 톤 그라디언트 + 큰 영문 단계명)을
// 그린다. 카드는 4:3, 상세 화면은 16:10 비율로 보여준다.

type ArtCohort = Pick<Cohort, "name" | "generation" | "coverPreset" | "cardImage" | "detailImage">;

interface CourseArtProps {
	cohort: ArtCohort;
	/** card: 과정 카드(4:3) · hero: 상세 화면(16:10) · thumb: 관리자 선택용 작은 썸네일(4:3) */
	size?: "card" | "hero" | "thumb";
	/** 관리자 미리보기용 — 과정 값 대신 이 디자인/이미지로 강제 표시. */
	preset?: CoverPreset;
	image?: string | null;
	className?: string;
}

const PRESET_WORD: Record<CoverPreset, string> = {
	beginner: "Beginner",
	growing: "Growing",
	advanced: "Advanced",
	general: "",
};

function fallbackWord(name: string): string {
	const match = name.match(/AI\s+([A-Za-z]+)/i);
	return match ? match[1] : "AI";
}

export function CourseArt({ cohort, size = "card", preset, image, className = "" }: CourseArtProps) {
	// 상세(hero)는 상세 이미지 → 카드 이미지 순으로, 카드는 카드 이미지만 쓴다.
	const uploaded = size === "hero" ? cohort.detailImage || cohort.cardImage : cohort.cardImage;
	const coverImage = image !== undefined ? image : uploaded;
	const sizeClass = `${styles.art} ${styles[size]} ${className}`;

	if (coverImage) {
		return (
			<div className={sizeClass}>
				<img className={styles.photo} src={coverImage} alt="" loading="lazy" decoding="async" />
			</div>
		);
	}

	const resolved = preset ?? resolveCoverPreset(cohort);
	const word = PRESET_WORD[resolved] || fallbackWord(cohortName(cohort));

	return (
		<div className={`${sizeClass} ${styles[resolved]}`} aria-hidden="true">
			<span className={styles.ring1} />
			<span className={styles.ring2} />
			<span className={styles.kicker}>AI Bootcamp</span>
			<span className={styles.word}>{word}</span>
			<span className={styles.icon}>
				<Icon name="graduation-cap" />
			</span>
		</div>
	);
}
