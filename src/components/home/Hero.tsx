import { useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { useCohorts } from "../../context/CohortContext";
import { useSiteContent } from "../../context/SiteContentContext";
import { useNavigation } from "../../context/NavigationContext";
import { statusLabel } from "../../types/cohort";
import { logEvent } from "../../lib/analytics";
import { Icon } from "../icons/Icon";
import styles from "./Hero.module.scss";

// 홈 탭 최상단 히어로 섹션 — CMS 헤드라인 문구, 모집중 기수 상태 표시,
// 신청/커리큘럼/혜택 바로가기 버튼. 헤드라인은 길이에 따라 자동으로
// 글자 크기를 줄여 한 줄이 넘치거나 줄바꿈되지 않게 한다.
export function Hero() {
	const { selected, cohorts } = useCohorts();
	const { content } = useSiteContent();
	const { hero } = content;
	const { goToProgram, setTab } = useNavigation();
	const [showNoActive, setShowNoActive] = useState(false);

	const titleRef = useRef<HTMLHeadingElement>(null);
	const line1Ref = useRef<HTMLSpanElement>(null);
	const line2Ref = useRef<HTMLSpanElement>(null);
	// JS로 한 번이라도 줄이기 전, CSS에 선언된 원래 크기를 딱 한 번만
	// 캡처해둠 — 이후 모든 측정은 이 고정된 기준값에 비례해서 계산한다.
	// 인라인 스타일을 지웠다가 다시 읽는 방식은, 재측정 결과가 이전과
	// 같은 값일 때 React가 리렌더링을 건너뛰면서 DOM엔 아직 줄지 않은
	// 크기가 남아있는데 state는 다르다고 나오는 문제가 있었다 (모바일에서
	// 제목이 잘려 보이던 진짜 원인).
	const maxFontPxRef = useRef<number | null>(null);
	// 헤드라인은 CMS에서 자유롭게 입력하는 텍스트라, 특정 값에 맞춘
	// 브레이크포인트 대신 각 줄의 원래(줄바꿈 없는) 너비를 측정해서 더 긴
	// 줄이 딱 맞을 만큼만 폰트 크기를 줄인다 — 줄바꿈도, 넘침도 없게.
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
			// scrollWidth/clientWidth 대신 getBoundingClientRect 사용 —
			// overflow:visible인 inline-block 요소의 scrollWidth는 일부
			// 모바일 브라우저(특히 iOS Safari)에서 신뢰할 수 없고, 줄바꿈
			// 없는 실제 내용 너비 대신 잘린 박스 크기를 조용히 반환해서
			// 긴 제목의 넘침을 못 잡아내는 경우가 있었다.
			const currentPx = parseFloat(window.getComputedStyle(container).fontSize) || maxPx;
			const containerWidth = container.getBoundingClientRect().width;
			const widestNow = Math.max(
				line1.getBoundingClientRect().width,
				line2.getBoundingClientRect().width,
			);
			// 최대(줄이기 전) 크기였다면 너비가 얼마였을지 역산 — 그래야
			// "맞는지" 판단이 항상 진짜 기본값 기준으로 이뤄져서, 첫 측정이든
			// 이미 줄어든 제목을 다시 측정하는 경우든 정확하게 계산된다.
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
		// 실제 웹폰트가 로드되면 다시 측정 — 폴백 폰트로 잰 치수는
		// 실제와 약간 다를 수 있음.
		document.fonts?.ready.then(measure).catch(() => {});
		return () => {
			observer.disconnect();
			window.removeEventListener("resize", measure);
			window.removeEventListener("orientationchange", measure);
		};
	}, [hero.titleBefore, hero.titleEmphasis, hero.titleAfter]);

	const recruiting = cohorts.filter((c) => c.status === "recruiting");
	// 모집중 기수가 정확히 하나면 → 바로 그 신청 링크로 이동.
	// 여러 개면 → 기수 선택 영역으로 이동해서 방문자가 직접 고르게 함.
	// 없으면 → 링크를 비활성 취급하고, 빈 섹션으로 스크롤하는 대신
	// onClick에서 안내 메시지를 보여줌.
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
				<Icon name="dot" />
				교육생 {statusLabel[selected.status]}({selected.generation}기) · {selected.recruitPeriod}
			</a>
			<div className={styles.ctaRow}>
				<a
					className={`btn btn-primary ${styles.ctaBtn}`}
					href={applyHref}
					onClick={handleApplyClick}
				>
					<Icon name="paper-plane" />
					지금 신청하기
				</a>
				<button
					type="button"
					className={`btn btn-ghost ${styles.ctaBtn}`}
					onClick={() => goToProgram("curriculum")}
				>
					<Icon name="layers" />
					커리큘럼
				</button>
				<button
					type="button"
					className={`btn btn-ghost ${styles.ctaBtn}`}
					onClick={() => setTab("benefit")}
				>
					<Icon name="gift" />
					참여 혜택
				</button>
			</div>
			{showNoActive && (
				<p className={styles.noActiveMsg}>현재 운영 중인 기수가 없습니다.</p>
			)}
		</section>
	);
}
