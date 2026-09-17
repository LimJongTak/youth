import { useEffect } from "react";
import { useSiteContent } from "../../context/SiteContentContext";
import { SectionHead } from "../layout/SectionHead";
import { ensureFontAwesomeLoaded } from "../../lib/loadFontAwesome";
import styles from "./Benefits.module.scss";

// "참여 혜택" 카드 목록 — 혜택 카드는 CMS(BenefitsEditor)에서 관리자가
// 자유롭게 추가/편집하며, 아이콘도 Font Awesome 클래스명을 직접 입력한다.
export function Benefits() {
	const { content } = useSiteContent();

	// benefit.icon은 CMS에서 관리자가 자유 텍스트로 입력하는 Font Awesome
	// 클래스명(어떤 아이콘이든 넣을 수 있음)이라, 사이트 다른 곳에서 쓰는
	// 고정 SVG 아이콘 세트로는 대응할 수 없다 — 방문자가 실제로 이 탭을
	// 열었을 때 그 시점에만 아이콘 폰트를 불러온다.
	useEffect(() => {
		ensureFontAwesomeLoaded();
	}, []);

	return (
		<section className="section" id="benefit">
			<SectionHead
				title="참여 혜택"
				description="교육부터 취업까지, 든든하게 지원합니다."
			/>
			<div className={styles.grid}>
				{content.benefits.map((benefit) => (
					<div className={styles.card} key={benefit.title}>
						<span className={styles.icon}>
							<i className={`fas ${benefit.icon}`} />
						</span>
						<h4>{benefit.title}</h4>
						<ul className={styles.list}>
							{benefit.items.map((item) => (
								<li key={item}>{item}</li>
							))}
						</ul>
					</div>
				))}
			</div>
		</section>
	);
}
