import { useEffect, useState } from "react";

export interface ElementRect {
	top: number;
	left: number;
	width: number;
	height: number;
}

/**
 * Tracks an element's viewport-relative bounding box (via ResizeObserver +
 * window resize/orientation events). Used to pin portal-rendered overlays
 * (the drawer) exactly to the phone-frame's box, since getBoundingClientRect
 * is already viewport-relative — the same coordinate space `position:fixed`
 * uses — so no scroll-offset math is needed.
 */
export function useElementRect(el: HTMLElement | null): ElementRect | null {
	const [rect, setRect] = useState<ElementRect | null>(null);

	useEffect(() => {
		if (!el) return;

		function update() {
			const r = el!.getBoundingClientRect();
			setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
		}

		update();
		const observer = new ResizeObserver(update);
		observer.observe(el);
		window.addEventListener("resize", update);
		window.addEventListener("orientationchange", update);

		return () => {
			observer.disconnect();
			window.removeEventListener("resize", update);
			window.removeEventListener("orientationchange", update);
		};
	}, [el]);

	return rect;
}
