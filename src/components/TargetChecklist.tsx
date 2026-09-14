import { useEffect, useState } from "react";
import { useCohorts } from "../context/CohortContext";
import { useSiteContent } from "../context/SiteContentContext";
import { SectionHead } from "./SectionHead";
import styles from "./TargetChecklist.module.scss";

export function TargetChecklist() {
	const { selected } = useCohorts();
	const { content } = useSiteContent();
	const { checklist } = content;
	const [checked, setChecked] = useState<boolean[]>(() =>
		checklist.map((item) => Boolean(item.defaultChecked)),
	);

	useEffect(() => {
		setChecked(checklist.map((item) => Boolean(item.defaultChecked)));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [checklist.length]);

	function toggle(index: number) {
		setChecked((prev) => prev.map((value, i) => (i === index ? !value : value)));
	}

	const allChecked = checked.every(Boolean);
	const canApply = selected.status === "recruiting" && Boolean(selected.applyUrl);

	return (
		<section className="section" id="target">
			<SectionHead
				eyebrow="RECRUIT TARGET"
				title={
					<>
						나도 신청할 수 있을까? <br />
						모집대상 자가 체크
					</>
				}
				description="아래 항목에 해당하는지 하나씩 확인해보세요."
			/>
			<div className={styles.list}>
				{checklist.map((item, index) => (
					<label className={styles.item} key={item.title}>
						<input
							type="checkbox"
							checked={checked[index]}
							onChange={() => toggle(index)}
						/>
						<span className={styles.box}>
							<i className="fas fa-check" />
						</span>
						<span>
							<strong>{item.title}</strong>
							<small>{item.desc}</small>
						</span>
					</label>
				))}
			</div>

			{allChecked && (
				<div className={styles.resultCard}>
					<i className="fas fa-check-circle" />
					<div>
						<strong>모든 조건에 해당하시네요!</strong>
						<span>
							{canApply
								? `지금 바로 ${selected.generation}기에 신청해보세요.`
								: "현재 모집 중인 기수가 없어요. 다음 기수를 기다려주세요."}
						</span>
					</div>
					{canApply && (
						<a className="btn btn-primary btn-block" href={selected.applyUrl}>
							<i className="fas fa-paper-plane" />
							{selected.generation}기 신청하기
						</a>
					)}
				</div>
			)}

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
