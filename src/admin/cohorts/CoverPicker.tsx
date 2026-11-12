import { useRef, useState, type ChangeEvent, type DragEvent, type ReactNode } from "react";
import {
	coverPresetLabel,
	resolveCoverPreset,
	type Cohort,
	type CoverPreset,
} from "../../types/cohort";
import {
	COVER_ACCEPT,
	COVER_ACCEPT_LABEL,
	COVER_MAX_FILE_MB,
	COVER_SPECS,
	CoverImageError,
	processCoverImage,
	type CoverKind,
} from "../../lib/coverImage";
import { CourseArt } from "../../components/home/CourseArt";
import styles from "./CoverPicker.module.scss";

// 과정 이미지 설정 — 공개 사이트의 두 군데 이미지를 각각 업로드한다.
//  1) 전체 과정 카드 이미지(4:3)  2) 상세 화면 이미지(16:10)
// 올리지 않은 곳에는 아래에서 고른 기본 디자인이 대신 보인다.

const PRESETS: CoverPreset[] = ["beginner", "growing", "advanced", "general"];

type CoverFields = Pick<Cohort, "coverPreset" | "cardImage" | "detailImage">;

interface CoverPickerProps {
	value: CoverFields & { name?: string };
	onChange: (next: Partial<CoverFields>) => void;
}

export function CoverPicker({ value, onChange }: CoverPickerProps) {
	const autoPreset = resolveCoverPreset({ name: value.name, coverPreset: undefined });
	const activePreset = value.coverPreset ?? autoPreset;
	const base = { name: value.name, coverPreset: activePreset };

	return (
		<div className={styles.picker}>
			<div className={styles.slots}>
				<UploadSlot
					kind="card"
					image={value.cardImage}
					preview={<CourseArt cohort={{ ...base, cardImage: value.cardImage }} />}
					onChange={(img) => onChange({ cardImage: img })}
				/>
				<UploadSlot
					kind="detail"
					image={value.detailImage}
					preview={
						<CourseArt
							cohort={{ ...base, cardImage: value.cardImage, detailImage: value.detailImage }}
							size="hero"
						/>
					}
					onChange={(img) => onChange({ detailImage: img })}
				/>
			</div>

			<div className={styles.presetBlock}>
				<span className={styles.presetTitle}>
					기본 디자인 <small>— 이미지를 올리지 않은 곳에 대신 보여요</small>
				</span>
				<div className={styles.tiles} role="radiogroup" aria-label="기본 디자인">
					{PRESETS.map((preset) => {
						const selected = activePreset === preset;
						return (
							<button
								key={preset}
								type="button"
								role="radio"
								aria-checked={selected}
								className={`${styles.tile} ${selected ? styles.tileActive : ""}`}
								onClick={() => onChange({ coverPreset: preset })}
							>
								<CourseArt cohort={{ name: value.name }} preset={preset} image={null} size="thumb" />
								<span className={styles.tileLabel}>
									{coverPresetLabel[preset]}
									{!value.coverPreset && preset === autoPreset && (
										<em className={styles.autoTag}>자동</em>
									)}
								</span>
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
}

interface UploadSlotProps {
	kind: CoverKind;
	image: string | undefined;
	preview: ReactNode;
	onChange: (image: string | undefined) => void;
}

function UploadSlot({ kind, image, preview, onChange }: UploadSlotProps) {
	const spec = COVER_SPECS[kind];
	const inputRef = useRef<HTMLInputElement>(null);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	const [dragOver, setDragOver] = useState(false);

	async function handleFile(file: File | undefined) {
		if (!file) return;
		setError(null);
		setNotice(null);
		setBusy(true);
		try {
			const { dataUrl, cropped } = await processCoverImage(file, kind);
			onChange(dataUrl);
			if (cropped) {
				setNotice(`원본 비율이 ${spec.ratioLabel}가 아니라서 가운데를 기준으로 잘라 넣었어요.`);
			}
		} catch (err) {
			setError(err instanceof CoverImageError ? err.message : "이미지를 처리하지 못했어요.");
		} finally {
			setBusy(false);
			if (inputRef.current) inputRef.current.value = "";
		}
	}

	function handleInput(event: ChangeEvent<HTMLInputElement>) {
		handleFile(event.target.files?.[0]);
	}

	function handleDrop(event: DragEvent<HTMLDivElement>) {
		event.preventDefault();
		setDragOver(false);
		handleFile(event.dataTransfer.files?.[0]);
	}

	return (
		<section className={styles.slot}>
			<header className={styles.slotHead}>
				<strong>{spec.title}</strong>
				<span className={styles.ratioBadge}>{spec.ratioLabel}</span>
			</header>
			<p className={styles.slotWhere}>{spec.where}</p>

			<div
				className={`${styles.drop} ${styles[kind]} ${dragOver ? styles.dragOver : ""}`}
				onDragOver={(e) => {
					e.preventDefault();
					setDragOver(true);
				}}
				onDragLeave={() => setDragOver(false)}
				onDrop={handleDrop}
			>
				{preview}
				{!image && (
					<span className={styles.defaultTag}>기본 디자인 표시 중</span>
				)}
				{busy && <span className={styles.busy}>이미지 처리 중…</span>}
			</div>

			<div className={styles.slotActions}>
				<button
					type="button"
					className={styles.uploadBtn}
					onClick={() => inputRef.current?.click()}
					disabled={busy}
				>
					<i className="fas fa-cloud-upload-alt" aria-hidden="true" />
					{image ? "이미지 변경" : "이미지 업로드"}
				</button>
				{image && (
					<button
						type="button"
						className={styles.removeBtn}
						onClick={() => {
							setNotice(null);
							onChange(undefined);
						}}
						disabled={busy}
					>
						삭제
					</button>
				)}
				<span className={styles.dropHint}>또는 미리보기에 파일을 끌어다 놓기</span>
				<input
					ref={inputRef}
					type="file"
					accept={COVER_ACCEPT.join(",")}
					className={styles.hiddenInput}
					onChange={handleInput}
				/>
			</div>

			<ul className={styles.spec}>
				<li>
					권장 <b>{spec.recommended}</b> ({spec.ratioLabel}) · 최소 {spec.minWidth}×{spec.minHeight}px
				</li>
				<li>
					{COVER_ACCEPT_LABEL} · 최대 {COVER_MAX_FILE_MB}MB
				</li>
				{spec.tips.map((tip) => (
					<li key={tip}>{tip}</li>
				))}
				<li>
					비율이 다르면 가운데 기준으로 잘리고, {spec.outputWidth}×{spec.outputHeight}px WebP(최대{" "}
					{spec.maxOutputKB}KB)로 자동 최적화돼 저장돼요.
				</li>
			</ul>

			{notice && <p className={styles.notice}>{notice}</p>}
			{error && <p className={styles.error}>{error}</p>}
		</section>
	);
}
