#!/usr/bin/env node
// 기수(숫자) → 과정명(텍스트) 전환용 1회성 마이그레이션.
//   node --env-file=.env scripts/migrate-course-names.mjs   # 미리보기 (로그인 불필요)
//   node --env-file=.env scripts/migrate-course-names.mjs <username> <password> --apply
// - cohorts/{id}: `name` 필드를 추가한다 (`generation`은 지우지 않아 옛 배포본도 그대로 동작).
// - siteContent/main: 트랙 배지 BASIC/MID 문구를 과정명으로 바꾼다.
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, doc, getDoc, getDocs, getFirestore, updateDoc } from "firebase/firestore";

const AUTH_EMAIL_DOMAIN = "youth-admin.local";
const toAuthEmail = (username) => `${username.trim().toLowerCase()}@${AUTH_EMAIL_DOMAIN}`;

const NAME_BY_GENERATION = { 1: "AI Advanced 과정", 2: "AI Growing 과정" };
const BADGE_RENAME = { BASIC: "AI Beginner 과정", MID: "AI Growing 과정" };

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const [username, password] = args.filter((a) => a !== "--apply");
if (apply && (!username || !password)) {
	console.error("--apply에는 아이디와 비밀번호를 인자로 넘겨주세요.");
	process.exit(1);
}

const app = initializeApp({
	apiKey: process.env.VITE_FIREBASE_API_KEY,
	authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.VITE_FIREBASE_APP_ID,
});
const auth = getAuth(app);
const db = getFirestore(app);

if (apply) await signInWithEmailAndPassword(auth, toAuthEmail(username), password);

for (const snap of (await getDocs(collection(db, "cohorts"))).docs) {
	const data = snap.data();
	const name = NAME_BY_GENERATION[data.generation];
	console.log(`cohorts/${snap.id}: generation=${data.generation} name=${JSON.stringify(data.name)} -> ${name ?? "(변경 없음)"}`);
	if (apply && name && data.name !== name) await updateDoc(snap.ref, { name });
}

const contentRef = doc(db, "siteContent", "main");
const content = (await getDoc(contentRef)).data();
if (content?.tracks) {
	let changed = false;
	const tracks = content.tracks.map((t) => {
		const badge = BADGE_RENAME[t.badge];
		console.log(`track ${t.id}: badge=${JSON.stringify(t.badge)} -> ${badge ?? "(변경 없음)"}`);
		if (!badge) return t;
		changed = true;
		return { ...t, badge };
	});
	if (apply && changed) await updateDoc(contentRef, { tracks });
}

console.log(apply ? "적용 완료" : "미리보기만 함 — 실제 반영은 --apply");
if (apply) await signOut(auth);
process.exit(0);
