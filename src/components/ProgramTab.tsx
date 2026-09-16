import { useNavigation } from "../context/NavigationContext";
import { About } from "./About";
import { Curriculum } from "./Curriculum";
import styles from "./ProgramTab.module.scss";

export function ProgramTab() {
	const { programSubTab, setProgramSubTab } = useNavigation();

	return (
		<div className={styles.wrap}>
			<div className={styles.switcher} role="tablist">
				<span
					className={styles.switcherThumb}
					style={{ transform: programSubTab === "about" ? "translateX(100%)" : "translateX(0)" }}
				/>
				<button
					type="button"
					role="tab"
					aria-selected={programSubTab === "curriculum"}
					className={`${styles.switchBtn} ${programSubTab === "curriculum" ? styles.active : ""}`}
					onClick={() => setProgramSubTab("curriculum")}
				>
					커리큘럼
				</button>
				<button
					type="button"
					role="tab"
					aria-selected={programSubTab === "about"}
					className={`${styles.switchBtn} ${programSubTab === "about" ? styles.active : ""}`}
					onClick={() => setProgramSubTab("about")}
				>
					프로그램 소개
				</button>
			</div>

			<div className={styles.page} key={programSubTab}>
				{programSubTab === "about" ? <About /> : <Curriculum />}
			</div>
		</div>
	);
}
