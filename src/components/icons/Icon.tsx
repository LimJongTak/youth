import type { SVGProps } from "react";

// 공개 사이트에서 Font Awesome 웹폰트 대신 쓰는 손그림 라인 아이콘 세트 —
// 어디서든 동일한 두께(24x24 뷰박스, 2px 선)를 유지하고, 폰트 글리프보다
// 작은 크기에서 더 또렷하며, 모든 방문자가 부담하던 큰 CSS+웹폰트 요청을
// 하나 없애준다. 관리자 화면은 여전히 Font Awesome을 사용(관리자 번들이
// 마운트될 때만 로드); 이 세트는 공개 사이트 컴포넌트가 실제로 쓰는
// 아이콘만 포함한다.
export type IconName =
	| "chevron-left"
	| "chevron-right"
	| "chevron-down"
	| "times"
	| "check"
	| "check-circle"
	| "plus-square"
	| "paper-plane"
	| "download"
	| "comment"
	| "share-square"
	| "map-marker"
	| "layers"
	| "headset"
	| "gift"
	| "expand"
	| "warning"
	| "envelope"
	| "ellipsis-vertical"
	| "dot"
	| "book-open"
	| "calendar"
	| "home"
	| "graduation-cap";

type IconProps = Omit<SVGProps<SVGSVGElement>, "viewBox" | "children"> & {
	name: IconName;
};

const strokeProps = {
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round" as const,
	strokeLinejoin: "round" as const,
};

function paths(name: IconName) {
	switch (name) {
		case "chevron-left":
			return <polyline points="15 6 9 12 15 18" />;
		case "chevron-right":
			return <polyline points="9 6 15 12 9 18" />;
		case "chevron-down":
			return <polyline points="6 9 12 15 18 9" />;
		case "times":
			return (
				<>
					<line x1="18" y1="6" x2="6" y2="18" />
					<line x1="6" y1="6" x2="18" y2="18" />
				</>
			);
		case "check":
			return <polyline points="20 6 9 17 4 12" />;
		case "check-circle":
			return (
				<>
					<circle cx="12" cy="12" r="9" />
					<polyline points="8 12.5 11 15.5 16 9" />
				</>
			);
		case "plus-square":
			return (
				<>
					<rect x="3" y="3" width="18" height="18" rx="2" />
					<line x1="12" y1="8" x2="12" y2="16" />
					<line x1="8" y1="12" x2="16" y2="12" />
				</>
			);
		case "paper-plane":
			return <path d="M22 2L15 22l-4-9-9-4z M22 2L11 13" />;
		case "download":
			return (
				<>
					<path d="M12 3v12" />
					<polyline points="7 10 12 15 17 10" />
					<line x1="5" y1="21" x2="19" y2="21" />
				</>
			);
		case "comment":
			return <path d="M4 4h16a1 1 0 011 1v11a1 1 0 01-1 1H9l-5 4V6a1 1 0 011-1z" />;
		case "share-square":
			return (
				<>
					<polyline points="8 7 12 3 16 7" />
					<line x1="12" y1="3" x2="12" y2="14" />
					<path d="M4 14v5a2 2 0 002 2h12a2 2 0 002-2v-5" />
				</>
			);
		case "map-marker":
			return (
				<>
					<path d="M12 21s-7-7.1-7-12a7 7 0 0114 0c0 4.9-7 12-7 12z" />
					<circle cx="12" cy="9" r="2.4" />
				</>
			);
		case "layers":
			return (
				<>
					<polygon points="12 2 2 7 12 12 22 7 12 2" />
					<polyline points="2 12 12 17 22 12" />
					<polyline points="2 17 12 22 22 17" />
				</>
			);
		case "headset":
			return (
				<>
					<path d="M4 18v-6a8 8 0 0116 0v6" />
					<rect x="2" y="15" width="5" height="6" rx="1.6" />
					<rect x="17" y="15" width="5" height="6" rx="1.6" />
				</>
			);
		case "gift":
			return (
				<>
					<rect x="3" y="9" width="18" height="12" rx="1" />
					<path d="M3 9h18v4H3z" />
					<line x1="12" y1="9" x2="12" y2="21" />
					<path d="M12 9c-1.6 0-4-1-4-3.2A2.3 2.3 0 0110.3 3.5C12 3.5 12 9 12 9z" />
					<path d="M12 9c1.6 0 4-1 4-3.2A2.3 2.3 0 0013.7 3.5C12 3.5 12 9 12 9z" />
				</>
			);
		case "expand":
			return (
				<>
					<polyline points="15 3 21 3 21 9" />
					<polyline points="9 21 3 21 3 15" />
					<line x1="21" y1="3" x2="14" y2="10" />
					<line x1="3" y1="21" x2="10" y2="14" />
				</>
			);
		case "warning":
			return (
				<>
					<path d="M10.3 3.9L1.9 18a2 2 0 001.7 3h16.9a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
					<line x1="12" y1="9" x2="12" y2="13" />
					<line x1="12" y1="17" x2="12.01" y2="17" />
				</>
			);
		case "envelope":
			return (
				<>
					<rect x="2" y="4" width="20" height="16" rx="2" />
					<polyline points="22 6 12 13 2 6" />
				</>
			);
		case "ellipsis-vertical":
			return (
				<g fill="currentColor" stroke="none">
					<circle cx="12" cy="5" r="1.6" />
					<circle cx="12" cy="12" r="1.6" />
					<circle cx="12" cy="19" r="1.6" />
				</g>
			);
		case "dot":
			return <circle cx="12" cy="12" r="8" fill="currentColor" stroke="none" />;
		case "book-open":
			return (
				<>
					<path d="M2 4h6a4 4 0 014 4v13a3 3 0 00-3-3H2z" />
					<path d="M22 4h-6a4 4 0 00-4 4v13a3 3 0 013-3h7z" />
				</>
			);
		case "calendar":
			return (
				<>
					<rect x="3" y="5" width="18" height="16" rx="2" />
					<line x1="3" y1="10" x2="21" y2="10" />
					<line x1="8" y1="2" x2="8" y2="6" />
					<line x1="16" y1="2" x2="16" y2="6" />
				</>
			);
		case "home":
			return (
				<>
					<path d="M3 11l9-8 9 8" />
					<path d="M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" />
				</>
			);
		case "graduation-cap":
			return (
				<>
					<path d="M2 9l10-5 10 5-10 5-10-5z" />
					<path d="M6 11.5V17c0 1.4 2.7 3 6 3s6-1.6 6-3v-5.5" />
					<path d="M22 9v6" />
				</>
			);
	}
}

export function Icon({ name, ...props }: IconProps) {
	return (
		<svg width="1em" height="1em" aria-hidden="true" focusable="false" {...strokeProps} {...props}>
			{paths(name)}
		</svg>
	);
}
