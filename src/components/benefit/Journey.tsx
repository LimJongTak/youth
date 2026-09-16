import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSiteContent } from "../../context/SiteContentContext";
import { SectionHead } from "../layout/SectionHead";
import styles from "./Journey.module.scss";

// Some content saved before "no numbering" was the design (Firestore may
// still hold titles like "① 신청 · 접수") — strip a leading circled number
// so the timeline never shows it, regardless of what's stored.
function stripNumbering(title: string) {
	return title.replace(/^[①②③④⑤⑥⑦⑧⑨⑩]\s*/, "");
}

export function Journey() {
	const { content } = useSiteContent();
	const [detailOpen, setDetailOpen] = useState(false);
	const [openSteps, setOpenSteps] = useState<Set<number>>(new Set());
	const [revealed, setRevealed] = useState(false);
	const timelineRef = useRef<HTMLDivElement>(null);

	// Play the timeline's stagger-in animation once, the first time it
	// scrolls into view, instead of on every render.
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
						<i className="fas fa-chevron-right" />
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
								<i className="fas fa-times" />
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
												<i
													className={`fas fa-chevron-down ${styles.accordionChevron} ${
														open ? styles.open : ""
													}`}
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
