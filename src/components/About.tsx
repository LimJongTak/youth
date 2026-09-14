import { useSiteContent } from "../context/SiteContentContext";
import { SectionHead } from "./SectionHead";
import styles from "./About.module.scss";

export function About() {
	const { content } = useSiteContent();
	const { about } = content;

	return (
		<section className="section" id="about">
			<SectionHead eyebrow="ABOUT" title="프로그램 소개" description={about.description} />
			<div className="card">
				<p className={styles.body}>
					<strong className={styles.highlight}>{about.bodyHighlight}</strong>
					{about.body}
				</p>
			</div>
		</section>
	);
}
