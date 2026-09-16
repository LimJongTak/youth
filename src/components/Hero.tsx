import { useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { useCohorts } from "../context/CohortContext";
import { useSiteContent } from "../context/SiteContentContext";
import { useNavigation } from "../context/NavigationContext";
import { statusLabel } from "../types/cohort";
import { logEvent } from "../lib/analytics";
import styles from "./Hero.module.scss";

export function Hero() {
	const { selected, cohorts } = useCohorts();
	const { content } = useSiteContent();
	const { hero } = content;
	const { goToProgram, setTab } = useNavigation();
	const [showNoActive, setShowNoActive] = useState(false);

	const titleRef = useRef<HTMLHeadingElement>(null);
	const line1Ref = useRef<HTMLSpanElement>(null);
	const line2Ref = useRef<HTMLSpanElement>(null);
	// Captured once from the CSS-declared size, before any JS shrink is
	// ever applied — every measurement scales relative to this fixed
	// reference instead of resetting the inline style to re-read it, which
	// fought with React's bail-out when a re-measure produced the same
	// value (the DOM was left showing the un-shrunk size even though state
	// said otherwise — the actual bug behind titles clipping on mobile).
	const maxFontPxRef = useRef<number | null>(null);
	// The headline is CMS-edited free text, so instead of a hand-tuned
	// breakpoint we measure each line's natural (nowrap) width and shrink
	// the shared font-size just enough that the longer line still fits —
	// never wraps, never overflows.
	const [titleFontPx, setTitleFontPx] = useState<number | null>(null);

	useLayoutEffect(() => {
		const container = titleRef.current;
		const line1 = line1Ref.current;
		const line2 = line2Ref.current;
		if (!container || !line1 || !line2) return;

		if (maxFontPxRef.current === null) {
			maxFontPxRef.current = parseFloat(window.getComputedStyle(container).fontSize);
		}
		const maxPx = maxFontPxRef.current;

		function measure() {
			if (!container || !line1 || !line2) return;
			// getBoundingClientRect, not scrollWidth/clientWidth — scrollWidth
			// on an overflow:visible inline-block is unreliable on some
			// mobile browsers (notably iOS Safari) and can silently report
			// the clamped box size instead of the true nowrap content width,
			// which was letting long titles overflow uncaught.
			const currentPx = parseFloat(window.getComputedStyle(container).fontSize) || maxPx;
			const containerWidth = container.getBoundingClientRect().width;
			const widestNow = Math.max(
				line1.getBoundingClientRect().width,
				line2.getBoundingClientRect().width,
			);
			// Extrapolate what the width would be at the max (un-shrunk) size,
			// so the fit check is always relative to the true default —
			// correct whether this is the first measurement or a re-measure
			// of an already-shrunk title.
			const widestAtMax = (widestNow / currentPx) * maxPx;
			if (widestAtMax === 0 || containerWidth === 0 || widestAtMax <= containerWidth) {
				setTitleFontPx(null);
				return;
			}
			const scale = containerWidth / widestAtMax;
			setTitleFontPx(Math.max(12, Math.floor(maxPx * scale)));
		}

		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(container);
		window.addEventListener("resize", measure);
		window.addEventListener("orientationchange", measure);
		// Re-measure once the real webfont is in — metrics measured against
		// the fallback font can be slightly off.
		document.fonts?.ready.then(measure).catch(() => {});
		return () => {
			observer.disconnect();
			window.removeEventListener("resize", measure);
			window.removeEventListener("orientationchange", measure);
		};
	}, [hero.titleBefore, hero.titleEmphasis, hero.titleAfter]);

	const recruiting = cohorts.filter((c) => c.status === "recruiting");
	// Exactly one recruiting cohort → go straight to its application link.
	// Several → fall back to the cohort picker so the visitor can choose.
	// None → the anchor is inert; onClick shows a message instead of
	// scrolling to an empty-feeling section.
	const applyHref =
		recruiting.length === 1 ? recruiting[0].applyUrl : "#cohort";

	function handleApplyClick(event: MouseEvent<HTMLAnchorElement>) {
		if (recruiting.length === 0) {
			event.preventDefault();
			setShowNoActive(true);
			window.setTimeout(() => setShowNoActive(false), 3000);
			return;
		}
		logEvent("apply_click", { source: "hero" });
	}

	return (
		<section className={styles.hero} id="hero">
			<h1
				className={styles.title}
				ref={titleRef}
				style={titleFontPx ? { fontSize: `${titleFontPx}px` } : undefined}
			>
				<span className={styles.titleLine} ref={line1Ref}>
					{hero.titleBefore}
				</span>
				<br />
				<span className={styles.titleLine} ref={line2Ref}>
					<em>{hero.titleEmphasis}</em>
					{hero.titleAfter}
				</span>
			</h1>
			<p className={styles.lead}>{hero.lead}</p>
			<a href="#cohort" className={styles.cohortPing}>
				<i className="fas fa-circle" />
				교육생 {statusLabel[selected.status]}({selected.generation}기) · {selected.recruitPeriod}
			</a>
			<div className={styles.ctaRow}>
				<a
					className={`btn btn-primary ${styles.ctaBtn}`}
					href={applyHref}
					onClick={handleApplyClick}
				>
					<i className="fas fa-paper-plane" />
					지금 신청하기
				</a>
				<button
					type="button"
					className={`btn btn-ghost ${styles.ctaBtn}`}
					onClick={() => goToProgram("curriculum")}
				>
					<i className="fas fa-layer-group" />
					커리큘럼
				</button>
				<button
					type="button"
					className={`btn btn-ghost ${styles.ctaBtn}`}
					onClick={() => setTab("benefit")}
				>
					<i className="fas fa-gift" />
					참여 혜택
				</button>
			</div>
			{showNoActive && (
				<p className={styles.noActiveMsg}>현재 운영 중인 기수가 없습니다.</p>
			)}
		</section>
	);
}
