import { useSiteContent } from "../context/SiteContentContext";
import { SectionHead } from "./SectionHead";
import styles from "./Journey.module.scss";

export function Journey() {
	const { content } = useSiteContent();

	return (
		<section className="section" id="journey">
			<SectionHead
				eyebrow="JOURNEY"
				title="참여 여정 & 사후관리"
				description="신청부터 채용연계까지, 전 과정을 함께합니다."
			/>
			<div className={styles.timeline}>
				{content.journey.map((step) => (
					<div className={styles.item} key={step.title}>
						<strong>{step.title}</strong>
						<span>{step.desc}</span>
					</div>
				))}
			</div>
		</section>
	);
}
