import { useState } from "react";
import { useCohorts } from "../context/CohortContext";
import { useSiteContent } from "../context/SiteContentContext";
import { SectionHead } from "./SectionHead";
import styles from "./TargetChecklist.module.scss";

export function TargetChecklist() {
	const { selected } = useCohorts();
	const { content } = useSiteContent();
	const { checklist } = content;
	const [listOpen, setListOpen] = useState(false);

	return (
		<section className="section" id="target">
			<SectionHead
				title={
					<>
						나도 신청할 수 있을까? <br />
						모집대상 확인
					</>
				}
				description="아래 항목에 해당하는지 하나씩 확인해보세요."
			/>
			<div className="card">
				<button
					type="button"
					className={styles.toggle}
					aria-expanded={listOpen}
					onClick={() => setListOpen((open) => !open)}
				>
					모집대상 확인
					<i
						className={`fas fa-chevron-down ${styles.chevron} ${listOpen ? styles.open : ""}`}
					/>
				</button>
				<div className={`${styles.collapse} ${listOpen ? styles.open : ""}`}>
					<div className={styles.collapseInner}>
						<div className={styles.list}>
							{checklist.map((item) => (
								<div className={styles.item} key={item.title}>
									<span className={styles.box}>
										<i className="fas fa-check" />
									</span>
									<span>
										<strong>{item.title}</strong>
										<small>{item.desc}</small>
									</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			<div className={styles.note}>
				<i className="fas fa-exclamation-triangle" />
				<span>
					{selected.generation}기 모집기간은 <strong>{selected.recruitPeriod}</strong>
					이며, 선착순 모집으로 조기 마감될 수 있습니다.
				</span>
			</div>
		</section>
	);
}
