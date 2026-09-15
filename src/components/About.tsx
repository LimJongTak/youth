import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SectionHead } from "./SectionHead";
import styles from "./About.module.scss";

const PAGE_NUMBERS = [3, 5, 8, 9, 6, 7];
const PAGES = PAGE_NUMBERS.map((n) => ({
	src: `/assets/img/about/artboard-${n}.png`,
	alt: `청년도약 인재양성 부트캠프 프로그램 안내 이미지 ${n}`,
}));
// Shown two at a time, like an open book spread.
const SPREADS = [0, 1, 2].map((i) => [PAGES[i * 2], PAGES[i * 2 + 1]]);

const AUTO_ADVANCE_MS = 30000;
const FLIP_MS = 500;

export function About() {
	const [open, setOpen] = useState(false);
	const [spreadIndex, setSpreadIndex] = useState(0);
	const [flipFrom, setFlipFrom] = useState<number | null>(null);
	const flipTimeout = useRef<number | undefined>(undefined);

	// A book-page flip: the outgoing spread rotates away on its left edge
	// while the new spread (already the current `spreadIndex`) sits
	// underneath.
	const goNext = useCallback(() => {
		if (flipFrom !== null) return; // let the current flip finish first
		setFlipFrom(spreadIndex);
		setSpreadIndex((spreadIndex + 1) % SPREADS.length);
		window.clearTimeout(flipTimeout.current);
		flipTimeout.current = window.setTimeout(() => setFlipFrom(null), FLIP_MS);
	}, [spreadIndex, flipFrom]);

	// Auto-advance while the viewer is open. Depending on `spreadIndex`
	// means a manual "다음" click restarts the 30s countdown instead of
	// stacking with the timer that was already running.
	useEffect(() => {
		if (!open) return;
		const timer = window.setInterval(goNext, AUTO_ADVANCE_MS);
		return () => window.clearInterval(timer);
	}, [open, spreadIndex, goNext]);

	useEffect(() => () => window.clearTimeout(flipTimeout.current), []);

	function openViewer() {
		setSpreadIndex(0);
		setFlipFrom(null);
		setOpen(true);
	}

	return (
		<section className="section" id="about">
			<SectionHead eyebrow="PROGRAM" />
			<button type="button" className={styles.viewBtn} onClick={openViewer}>
				<i className="fas fa-images" />
				프로그램 안내 보기
			</button>

			{open &&
				createPortal(
					<div className={styles.viewerOverlay} onClick={() => setOpen(false)}>
						<div className={styles.viewerCard} onClick={(e) => e.stopPropagation()}>
							<button
								type="button"
								className={styles.viewerClose}
								onClick={() => setOpen(false)}
								aria-label="닫기"
							>
								<i className="fas fa-times" />
							</button>

							<div className={styles.viewerStage}>
								<div className={styles.viewerTrack}>
									<div className={styles.viewerPage}>
										<Spread pages={SPREADS[spreadIndex]} />
									</div>
									{flipFrom !== null && (
										<div className={`${styles.viewerPage} ${styles.viewerPageFlip}`} key={flipFrom}>
											<Spread pages={SPREADS[flipFrom]} />
										</div>
									)}
									<div className={styles.viewerSpine} />
								</div>
							</div>

							<div className={styles.viewerDots}>
								{SPREADS.map((pages, i) => (
									<span
										key={pages[0].src}
										className={`${styles.dot} ${i === spreadIndex ? styles.dotActive : ""}`}
									/>
								))}
							</div>

							<button type="button" className={styles.viewerNext} onClick={goNext}>
								다음 페이지
								<i className="fas fa-chevron-right" />
							</button>
						</div>
					</div>,
					document.body,
				)}
		</section>
	);
}

function Spread({ pages }: { pages: { src: string; alt: string }[] }) {
	return (
		<div className={styles.viewerSpread}>
			{pages.map((page) => (
				<div className={styles.viewerLeaf} key={page.src}>
					<img src={page.src} alt={page.alt} />
				</div>
			))}
		</div>
	);
}
