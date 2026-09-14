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

	const panelWidth = Math.round(rect.width * 0.76);

	return createPortal(
		<>
			<div
				className={styles.backdrop}
				onClick={onClose}
				style={{
					top: rect.top,
					left: rect.left,
					width: rect.width,
					height: rect.height,
					opacity: open ? 1 : 0,
					pointerEvents: open ? "auto" : "none",
					transition: "opacity .3s ease",
				}}
			/>
			<nav
				className={styles.drawer}
				style={{
					top: rect.top,
					left: rect.left,
					width: panelWidth,
					height: rect.height,
					transform: open ? "translateX(0)" : "translateX(-105%)",
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
