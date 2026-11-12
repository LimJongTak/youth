import { useEffect, type RefObject } from "react";

/**
 * 컨테이너 안의 `.reveal` 요소들이 스크롤로 화면에 들어오면 `.is-visible`을
 * 붙여 등장 애니메이션을 재생한다(요소마다 한 번만). `deps`가 바뀌면(예:
 * 필터 변경으로 목록이 다시 그려질 때) 새 요소들을 다시 관찰한다.
 */
export function useReveal(ref: RefObject<HTMLElement | null>, deps: unknown[] = []) {
	useEffect(() => {
		const root = ref.current;
		if (!root) return;
		const targets = Array.from(root.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)"));
		if (targets.length === 0) return;

		if (!("IntersectionObserver" in window)) {
			targets.forEach((el) => el.classList.add("is-visible"));
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						entry.target.classList.add("is-visible");
						observer.unobserve(entry.target);
					}
				}
			},
			{ threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
		);
		targets.forEach((el) => observer.observe(el));
		return () => observer.disconnect();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps);
}
