import { useState } from "react";
import { useSiteContent } from "../context/SiteContentContext";
import { SectionHead } from "./SectionHead";
import styles from "./Faq.module.scss";

export function Faq() {
	const { content } = useSiteContent();
	const [openIndex, setOpenIndex] = useState<number>(0);

	return (
		<section className="section" id="faq">
			<SectionHead eyebrow="FAQ" title="자주 묻는 질문" />
			<div>
				{content.faqs.map((faq, index) => {
					const isOpen = openIndex === index;
					return (
						<div
							className={`${styles.item} ${isOpen ? styles.open : ""}`}
							key={faq.q}
						>
							<button
								className={styles.question}
								onClick={() => setOpenIndex(isOpen ? -1 : index)}
							>
								{faq.q}
								<i className="fas fa-plus" />
							</button>
							<div className={styles.answer}>
								<p>{faq.a}</p>
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}
