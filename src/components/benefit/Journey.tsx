import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSiteContent } from "../../context/SiteContentContext";
import { SectionHead } from "../layout/SectionHead";
import { Icon } from "../icons/Icon";
import styles from "./Journey.module.scss";

// "참여 여정" 타임라인 — 요약 타임라인과, "자세히 보기"를 누르면 열리는
// 아코디언 상세 모달로 구성.

// "번호 없이" 표시하기로 하기 전에 저장된 콘텐츠는 Firestore에 아직
// "① 신청 · 접수" 같은 제목이 남아있을 수 있음 — 저장된 값이 뭐든 앞의
// 동그라미 숫자를 떼어내서 타임라인에는 절대 안 보이게 한다.
function stripNumbering(title: string) {
	return title.replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "");
}

export function Journey() {
	const { content } = useSiteContent();
	const [detailOpen, setDetailOpen] = useState(false);
	const [openSteps, setOpenSteps] = useState<Set<number>>(new Set());
	const [revealed, setRevealed] = useState(false);
	const timelineRef = useRef<HTMLDivElement>(null);

	// 타임라인이 스크롤로 처음 화면에 들어올 때 딱 한 번만 순차 등장
	// 애니메이션을 재생 — 렌더링될 때마다가 아니라.
	useEffect(() => {
		const el = timelineRef.current;
		if (!el) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setRevealed(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.2 },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	function toggleStep(index: number) {
		setOpenSteps((prev) => {
			const next = new Set(prev);
			if (next.has(index)) {
				next.delete(index);
			} else {
				next.add(index);
			}
			return next;
		});
	}

	return (
		<section className="section" id="journey">
			<SectionHead
				title="참여 여정"
				description="신청부터 채용연계까지, 전 과정을 함께합니다."
				action={
					<button type="button" className={styles.detailBtn} onClick={() => setDetailOpen(true)}>
						자세히 보기
						<Icon name="chevron-right" />
					</button>
				}
			/>

			<div
				className={`${styles.timeline} ${revealed ? styles.revealed : ""}`}
				ref={timelineRef}
			>
				{content.journey.map((step) => (
					<div className={styles.item} key={step.title}>
						<strong>{stripNumbering(step.title)}</strong>
					</div>
				))}
			</div>

			{detailOpen &&
				createPortal(
					<div className={styles.detailOverlay} onClick={() => setDetailOpen(false)}>
						<div className={styles.detailCard} onClick={(e) => e.stopPropagation()}>
							<button
								type="button"
								className={styles.detailClose}
								onClick={() => setDetailOpen(false)}
								aria-label="닫기"
							>
								<Icon name="times" />
							</button>
							<h4 className={styles.detailTitle}>참여 여정 상세</h4>
							<p className={styles.detailDesc}>각 단계를 눌러 자세한 내용을 확인하세요.</p>

							<div className={styles.accordion}>
								{content.journey.map((step, index) => {
									const open = openSteps.has(index);
									return (
										<div className={styles.accordionItem} key={step.title}>
											<button
												type="button"
												className={styles.accordionHead}
												aria-expanded={open}
												onClick={() => toggleStep(index)}
											>
												<span>{stripNumbering(step.title)}</span>
												<Icon
													name="chevron-down"
													className={`${styles.accordionChevron} ${open ? styles.open : ""}`}
												/>
											</button>
											<div
												className={`${styles.accordionCollapse} ${open ? styles.open : ""}`}
											>
												<div className={styles.accordionInner}>
													<p>{step.desc}</p>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</div>,
					document.body,
				)}
		</section>
	);
}
