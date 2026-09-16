import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./About.module.scss";

const PAGES = [
	{ src: "/assets/img/about/guide-1.jpg", alt: "청년도약 인재양성 부트캠프 프로그램 안내 이미지 1" },
	{ src: "/assets/img/about/guide-2.jpg", alt: "청년도약 인재양성 부트캠프 프로그램 안내 이미지 2" },
];

// Below this width the device is a phone: skip the desktop card/pager and
// show one photo at a time full-screen, with prev/next below it.
const MOBILE_BREAKPOINT = 480;
const AUTO_ADVANCE_MS = 30000;

function useIsMobile() {
	const [isMobile, setIsMobile] = useState(
		() => typeof window !== "undefined" && window.innerWidth <= MOBILE_BREAKPOINT,
	);

	useEffect(() => {
		const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
		const handler = () => setIsMobile(mq.matches);
		handler();
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);

	return isMobile;
}

export function About() {
	const [open, setOpen] = useState(false);
	const [pageIndex, setPageIndex] = useState(0);
	const isMobile = useIsMobile();
	const timerRef = useRef<number | undefined>(undefined);

	function goTo(index: number) {
		setPageIndex((index + PAGES.length) % PAGES.length);
	}

	function restartTimer() {
		window.clearInterval(timerRef.current);
		timerRef.current = window.setInterval(() => {
			setPageIndex((i) => (i + 1) % PAGES.length);
		}, AUTO_ADVANCE_MS);
	}

	// The 30s auto-advance runs continuously while this page is mounted;
	// any manual prev/next/dot interaction restarts the countdown instead
	// of stacking with the timer already running.
	useEffect(() => {
		restartTimer();
		return () => window.clearInterval(timerRef.current);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function handleNav(index: number) {
		goTo(index);
		restartTimer();
	}

	return (
		<section className="section" id="about">
			<div className={styles.pager}>
				<button
					type="button"
					className={styles.pagerImgBtn}
					onClick={() => setOpen(true)}
					aria-label="전체화면으로 크게 보기"
				>
					<img className={styles.pagerImg} src={PAGES[pageIndex].src} alt={PAGES[pageIndex].alt} />
					<span className={styles.expandHint}>
						<i className="fas fa-expand" />
					</span>
				</button>

				<div className={styles.pagerNav}>
					<button
						type="button"
						className={styles.pagerNavBtn}
						onClick={() => handleNav(pageIndex - 1)}
						aria-label="이전 이미지"
					>
						<i className="fas fa-chevron-left" />
						이전
					</button>
					<div className={styles.viewerDots}>
						{PAGES.map((page, i) => (
							<button
								type="button"
								key={page.src}
								className={`${styles.dot} ${i === pageIndex ? styles.dotActive : ""}`}
								onClick={() => handleNav(i)}
								aria-label={`${i + 1}페이지`}
							/>
						))}
					</div>
					<button
						type="button"
						className={styles.pagerNavBtn}
						onClick={() => handleNav(pageIndex + 1)}
						aria-label="다음 이미지"
					>
						다음
						<i className="fas fa-chevron-right" />
					</button>
				</div>
			</div>

			{open &&
				createPortal(
					isMobile ? (
						<div className={styles.mobileOverlay}>
							<button
								type="button"
								className={styles.mobileClose}
								onClick={() => setOpen(false)}
								aria-label="닫기"
							>
								<i className="fas fa-times" />
							</button>
							<div className={styles.mobileGallery}>
								<img
									className={styles.mobileImg}
									src={PAGES[pageIndex].src}
									alt={PAGES[pageIndex].alt}
								/>
								<div className={styles.mobileNav}>
									<button
										type="button"
										className={styles.mobileNavBtn}
										onClick={() => handleNav(pageIndex - 1)}
										aria-label="이전 페이지"
									>
										<i className="fas fa-chevron-left" />
										이전
									</button>
									<div className={styles.viewerDots}>
										{PAGES.map((page, i) => (
											<button
												type="button"
												key={page.src}
												className={`${styles.dot} ${i === pageIndex ? styles.dotActive : ""}`}
												onClick={() => handleNav(i)}
												aria-label={`${i + 1}페이지`}
											/>
										))}
									</div>
									<button
										type="button"
										className={styles.mobileNavBtn}
										onClick={() => handleNav(pageIndex + 1)}
										aria-label="다음 페이지"
									>
										다음
										<i className="fas fa-chevron-right" />
									</button>
								</div>
							</div>
						</div>
					) : (
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
									<button
										type="button"
										className={`${styles.viewerArrow} ${styles.viewerArrowPrev}`}
										onClick={() => handleNav(pageIndex - 1)}
										aria-label="이전 페이지"
									>
										<i className="fas fa-chevron-left" />
									</button>

									<div className={styles.viewerTrack}>
										<img
											className={styles.viewerImg}
											src={PAGES[pageIndex].src}
											alt={PAGES[pageIndex].alt}
										/>
									</div>

									<button
										type="button"
										className={`${styles.viewerArrow} ${styles.viewerArrowNext}`}
										onClick={() => handleNav(pageIndex + 1)}
										aria-label="다음 페이지"
									>
										<i className="fas fa-chevron-right" />
									</button>
								</div>

								<div className={styles.viewerDots}>
									{PAGES.map((page, i) => (
										<button
											type="button"
											key={page.src}
											className={`${styles.dot} ${i === pageIndex ? styles.dotActive : ""}`}
											onClick={() => handleNav(i)}
											aria-label={`${i + 1}페이지`}
										/>
									))}
								</div>
							</div>
						</div>
					),
					document.body,
				)}
		</section>
	);
}
