import { useRef, type CSSProperties } from "react";
import { useSiteContent } from "../../context/SiteContentContext";
import { useReveal } from "../../hooks/useReveal";
import { logEvent } from "../../lib/analytics";
import { Icon } from "../icons/Icon";
import styles from "./HomeGuide.module.scss";

// 홈 하단 — 모집대상 체크리스트와 신청 방법, 카카오톡 문의. 커피앱 주문
// 화면의 "썸네일 + 제목 + 설명" 목록과 굵은 구분선 스타일을 따른다.
export function HomeGuide() {
	const { content } = useSiteContent();
	const { checklist, applySteps, contact } = content;
	const wrapRef = useRef<HTMLDivElement>(null);
	useReveal(wrapRef, [checklist.length, applySteps.length]);
	const delay = (i: number) => ({ "--d": `${i * 70}ms` }) as CSSProperties;

	return (
		<div className={styles.wrap} ref={wrapRef}>
			<section className={styles.block}>
				<div className={styles.head}>
					<h2>나도 신청할 수 있을까?</h2>
					<span>모집대상 확인</span>
				</div>
				<ul className={styles.list}>
					{checklist.map((item, index) => (
						<li className={`${styles.item} reveal`} style={delay(index)} key={item.title}>
							<span className={styles.thumb}>
								<Icon name="check" />
							</span>
							<span className={styles.itemText}>
								<strong>{item.title}</strong>
								<small>{item.desc}</small>
							</span>
						</li>
					))}
				</ul>
			</section>

			<hr className={styles.divider} />

			<section className={styles.block}>
				<div className={styles.head}>
					<h2>신청 방법</h2>
					<span>{applySteps.length}단계</span>
				</div>
				<ol className={styles.steps}>
					{applySteps.map((step, index) => (
						<li className={`${styles.step} reveal`} style={delay(index)} key={step.num}>
							<span className={styles.stepNum} aria-label={`${step.num}단계`}>
								{String(step.num).padStart(2, "0")}
							</span>
							<span className={styles.itemText}>
								<strong>{step.title}</strong>
								<small>{step.desc}</small>
							</span>
						</li>
					))}
				</ol>

				<a
					className={`${styles.kakao} reveal`}
					href={contact.kakaoUrl}
					onClick={() => logEvent("kakao_click", { source: "cohort_banner" })}
					target="_blank"
					rel="noopener noreferrer"
				>
					<span className={styles.kakaoIcon}>
						<Icon name="kakao" />
					</span>
					<span className={styles.itemText}>
						<strong>궁금한 점이 있나요?</strong>
						<small>카카오톡으로 바로 문의하기</small>
					</span>
					<Icon name="chevron-right" className={styles.chevron} />
				</a>
			</section>
		</div>
	);
}
