import { useSiteContent } from "../context/SiteContentContext";
import { SectionHead } from "./SectionHead";
import styles from "./Benefits.module.scss";

export function Benefits() {
	const { content } = useSiteContent();

	return (
		<section className="section" id="benefit">
			<SectionHead
				eyebrow="BENEFIT"
				title="참여 혜택"
				description="교육부터 취업까지, 든든하게 지원합니다."
			/>
			<div className={styles.grid}>
				{content.benefits.map((benefit) => (
					<div className={styles.card} key={benefit.title}>
						<span className={styles.icon} style={{ background: benefit.gradient }}>
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
