import { createPortal } from "react-dom";
import { drawerNav } from "../data/content";
import { useSiteContent } from "../context/SiteContentContext";
import type { ElementRect } from "../hooks/useElementRect";
import styles from "./Drawer.module.scss";

interface DrawerProps {
	open: boolean;
	onClose: () => void;
	rect: ElementRect | null;
}

export function Drawer({ open, onClose, rect }: DrawerProps) {
	const { content } = useSiteContent();

	if (!rect) return null;

	// Fixed to the real viewport (not tied to any scrolling ancestor), but
	// horizontally aligned to the content column — top/height stay pinned
	// to the full viewport regardless of how far the page has scrolled.
	const panelWidth = Math.round(rect.width * 0.76);

	return createPortal(
		<>
			<div
				className={styles.backdrop}
				onClick={onClose}
				style={{
					top: 0,
					left: rect.left,
					width: rect.width,
					height: "100vh",
					opacity: open ? 1 : 0,
					pointerEvents: open ? "auto" : "none",
					transition: "opacity .3s ease",
				}}
			/>
			<nav
				className={styles.drawer}
				style={{
					top: 0,
					left: rect.left,
					width: panelWidth,
					height: "100vh",
					// Closed state must clear the real browser edge, not just the
					// panel's own width — on a wide screen the content column
					// (and this drawer's `left`) can sit far from x:0, so sliding
					// by only -100% would just land it in the visible margin
					// beside the column instead of truly off-screen.
					transform: open ? "translateX(0)" : `translateX(calc(-100% - ${rect.left}px - 24px))`,
				}}
			>
				<h4>MENU</h4>
				<ul>
					{drawerNav.map((item) => (
						<li key={item.id}>
							<a href={`#${item.id}`} onClick={onClose}>
								<i className={`fas ${item.icon}`} />
								{item.label}
							</a>
						</li>
					))}
				</ul>
				<div className={styles.contactBlurb}>
					{content.contact.org}
					<br />
					<a
						className={styles.kakaoLink}
						href={content.contact.kakaoUrl}
						target="_blank"
						rel="noopener noreferrer"
					>
						<i className="fas fa-comment" />
						카카오톡으로 문의하기
					</a>
				</div>
			</nav>
		</>,
		document.body,
	);
}
