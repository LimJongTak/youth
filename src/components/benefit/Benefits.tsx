import { useEffect } from "react";
import { useSiteContent } from "../../context/SiteContentContext";
import { SectionHead } from "../layout/SectionHead";
import { ensureFontAwesomeLoaded } from "../../lib/loadFontAwesome";
import styles from "./Benefits.module.scss";

export function Benefits() {
	const { content } = useSiteContent();

	// benefit.icon is a free-typed Font Awesome class name from the CMS
	// (an admin can put in any icon), so it can't be one of the fixed SVG
	// icons the rest of the site uses — load the icon font only now, the
	// first time a visitor actually opens this tab.
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
