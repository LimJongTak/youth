import { useEffect, useState } from "react";

/**
 * Tracks which of the given section ids is currently most visible in the
 * viewport, so the bottom tab bar can highlight the right tab as the page
 * scrolls. The page itself scrolls now (no inner scroll container), so
 * this observes relative to the viewport (root: null).
 */
export function useActiveSection(ids: string[]): string {
	const [active, setActive] = useState(ids[0] ?? "");

	useEffect(() => {
		if (ids.length === 0) return;

		const elements = ids
			.map((id) => document.getElementById(id))
			.filter((el): el is HTMLElement => el !== null);

		if (elements.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setActive(entry.target.id);
					}
				}
			},
			{ root: null, rootMargin: "-45% 0px -50% 0px", threshold: 0 },
		);

		elements.forEach((el) => observer.observe(el));
		return () => observer.disconnect();
	}, [ids]);

	return active;
}
