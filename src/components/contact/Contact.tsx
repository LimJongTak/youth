import type { MouseEvent } from "react";
import { useSiteContent } from "../../context/SiteContentContext";
import { SectionHead } from "../layout/SectionHead";
import { logEvent } from "../../lib/analytics";
import { Icon } from "../icons/Icon";
import styles from "./Contact.module.scss";

// "문의처" 탭 — 카카오톡 문의, 이메일, 지도(카카오맵) 링크 목록.
const KAKAO_MAP_WEB_URL = "https://place.map.kakao.com/2091779575";
const KAKAO_MAP_APP_URL = "kakaomap://place?id=2091779575";

// 카카오맵 앱이 설치돼 있으면 앱으로, 없으면 웹페이지로 열리게 시도한다.
function openKakaoMap(event: MouseEvent) {
	event.preventDefault();
	const openedAt = Date.now();
	window.location.href = KAKAO_MAP_APP_URL;
	// 앱 스킴 링크가 약 1.2초 안에 설치된 카카오맵 앱에 가로채지지 않았다면
	// 아직 브라우저에 남아있는 것 — 이땐 웹페이지로 대체 이동시킨다.
	setTimeout(() => {
		if (Date.now() - openedAt < 2000 && !document.hidden) {
			window.open(KAKAO_MAP_WEB_URL, "_blank", "noopener,noreferrer");
		}
	}, 1200);
}

export function Contact() {
	const { content } = useSiteContent();
	const { contact } = content;

	return (
		<section className="section" id="contact">
			<SectionHead title="문의처" description={contact.org} />
			<div className={styles.list}>
				<a
					className={`${styles.row} ${styles.kakaoRow}`}
					href={contact.kakaoUrl}
					onClick={() => logEvent("kakao_click", { source: "contact" })}
					target="_blank"
					rel="noopener noreferrer"
				>
					<span className={`${styles.icon} ${styles.kakaoIcon}`}>
						<Icon name="kakao" />
					</span>
					<span>
						<span className={styles.label}>카카오톡</span>
						<span className={styles.value}>실시간 문의하기</span>
					</span>
					<Icon name="chevron-right" className={styles.chevron} />
				</a>
				<a className={styles.row} href={`mailto:${contact.email}`}>
					<span className={styles.icon}>
						<Icon name="envelope" />
					</span>
					<span>
						<span className={styles.label}>이메일</span>
						<span className={styles.value}>{contact.email}</span>
					</span>
				</a>
				<a
					className={styles.row}
					href={KAKAO_MAP_WEB_URL}
					target="_blank"
					rel="noopener noreferrer"
					onClick={openKakaoMap}
				>
					<span className={styles.icon}>
						<Icon name="map-marker" />
					</span>
					<span>
						<span className={styles.label}>주소</span>
						<span className={styles.value}>{contact.address}</span>
					</span>
					<Icon name="chevron-right" className={styles.chevron} />
				</a>
			</div>
		</section>
	);
}
