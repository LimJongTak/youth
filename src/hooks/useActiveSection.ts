import { useEffect, useState } from "react";

/**
 * Tracks which of the given section ids is currently most visible inside
 * `root` (the phone-frame's own scroll container), so the bottom tab bar
 * can highlight the right tab as the user scrolls.
 */
export function useActiveSection(
	ids: string[],
	root: HTMLElement | null,
): string {
	const [active, setActive] = useState(ids[0] ?? "");

	useEffect(() => {
		if (!root || ids.length === 0) return;

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
			{ root, rootMargin: "-45% 0px -50% 0px", threshold: 0 },
		);

		elements.forEach((el) => observer.observe(el));
		return () => observer.disconnect();
	}, [ids, root]);

	return active;
}
