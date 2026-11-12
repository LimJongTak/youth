// 과정 이미지 업로드 처리 — Firebase Storage 없이 과정(Firestore) 문서에
// 바로 저장할 수 있도록, 브라우저에서 정해진 비율로 가운데를 잘라 WebP로
// 줄이고 용량 상한 안에 들어올 때까지 화질을 낮춘다.

export type CoverKind = "card" | "detail";

export interface CoverSpec {
	title: string;
	where: string;
	ratioLabel: string;
	recommended: string;
	minWidth: number;
	minHeight: number;
	outputWidth: number;
	outputHeight: number;
	/** Firestore 문서 1MB 제한과 방문자 로딩을 고려한 저장 용량 상한. */
	maxOutputKB: number;
	tips: string[];
}

export const COVER_ACCEPT = ["image/jpeg", "image/png", "image/webp"] as const;
export const COVER_ACCEPT_LABEL = "JPG · PNG · WebP";
export const COVER_MAX_FILE_MB = 10;

export const COVER_SPECS: Record<CoverKind, CoverSpec> = {
	card: {
		title: "전체 과정 카드 이미지",
		where: "홈 > 전체 과정 목록의 미리보기 카드",
		ratioLabel: "4:3",
		recommended: "1200 × 900px",
		minWidth: 800,
		minHeight: 600,
		outputWidth: 800,
		outputHeight: 600,
		maxOutputKB: 200,
		tips: [
			"왼쪽 위에는 '모집중' 같은 상태 배지가 겹쳐 보여요. 중요한 글자는 피해주세요.",
			"카드가 작게(가로 약 170px) 보이므로 큰 글자·단순한 구성이 좋아요.",
		],
	},
	detail: {
		title: "상세 화면 이미지",
		where: "과정을 눌렀을 때 열리는 상세 화면 맨 위",
		ratioLabel: "16:10",
		recommended: "1600 × 1000px",
		minWidth: 1200,
		minHeight: 750,
		outputWidth: 1200,
		outputHeight: 750,
		maxOutputKB: 300,
		tips: [
			"화면 가로를 꽉 채워 크게 보여요. 위에 겹치는 요소는 없어요.",
			"올리지 않으면 카드 이미지를 잘라서 쓰고, 그것도 없으면 기본 디자인을 보여줘요.",
		],
	},
};

export class CoverImageError extends Error {}

function blobToDataUrl(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(blob);
	});
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
	return new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));
}

export interface ProcessedCover {
	dataUrl: string;
	/** 원본 비율이 규격과 달라 가운데 기준으로 잘렸는지. */
	cropped: boolean;
}

export async function processCoverImage(file: File, kind: CoverKind): Promise<ProcessedCover> {
	const spec = COVER_SPECS[kind];
	if (!(COVER_ACCEPT as readonly string[]).includes(file.type)) {
		throw new CoverImageError(`${COVER_ACCEPT_LABEL} 형식의 이미지만 올릴 수 있어요.`);
	}
	if (file.size > COVER_MAX_FILE_MB * 1024 * 1024) {
		throw new CoverImageError(`파일 용량이 ${COVER_MAX_FILE_MB}MB를 넘어요. 더 작은 파일로 올려주세요.`);
	}

	let bitmap: ImageBitmap;
	try {
		bitmap = await createImageBitmap(file);
	} catch {
		throw new CoverImageError("이미지를 읽을 수 없어요. 다른 파일로 시도해주세요.");
	}

	const { width, height } = bitmap;
	if (width < spec.minWidth || height < spec.minHeight) {
		bitmap.close();
		throw new CoverImageError(
			`이미지가 너무 작아요(${width}×${height}px). 최소 ${spec.minWidth}×${spec.minHeight}px 이상으로 올려주세요.`,
		);
	}

	// 규격 비율로 가운데 자르기 — 비율이 딱 맞으면 잘리는 부분 없음.
	const target = spec.outputWidth / spec.outputHeight;
	let sw = width;
	let sh = height;
	if (width / height > target) sw = Math.round(height * target);
	else sh = Math.round(width / target);
	const sx = Math.round((width - sw) / 2);
	const sy = Math.round((height - sh) / 2);
	const cropped = Math.abs(width / height - target) / target > 0.02;

	const canvas = document.createElement("canvas");
	canvas.width = spec.outputWidth;
	canvas.height = spec.outputHeight;
	const ctx = canvas.getContext("2d");
	if (!ctx) {
		bitmap.close();
		throw new CoverImageError("이 브라우저에서는 이미지를 처리할 수 없어요.");
	}
	ctx.imageSmoothingQuality = "high";
	ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
	bitmap.close();

	for (const quality of [0.88, 0.82, 0.74, 0.66, 0.58, 0.5]) {
		const blob = await canvasToBlob(canvas, quality);
		if (!blob || blob.type !== "image/webp") {
			throw new CoverImageError("이 브라우저는 WebP 변환을 지원하지 않아요. 크롬이나 엣지에서 올려주세요.");
		}
		if (blob.size <= spec.maxOutputKB * 1024) return { dataUrl: await blobToDataUrl(blob), cropped };
	}
	throw new CoverImageError("이미지를 충분히 압축하지 못했어요. 더 단순한 이미지로 시도해주세요.");
}

