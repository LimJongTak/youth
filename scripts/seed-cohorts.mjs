#!/usr/bin/env node
// Seeds the initial cohort documents into Firestore. Run once against a
// fresh project:
//   node --env-file=.env scripts/seed-cohorts.mjs
// Signs in as an existing admin/manager account (cohort writes require
// isSignedIn() per firestore.rules) so this must be run after
// create-account.mjs has created at least one account.
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";

const AUTH_EMAIL_DOMAIN = "youth-admin.local";
const toAuthEmail = (username) => `${username.trim().toLowerCase()}@${AUTH_EMAIL_DOMAIN}`;

const seedCohorts = [
	{
		id: "gen-1",
		generation: 1,
		status: "closed",
		capacity: "미정 (공식 페이지 참고)",
		recruitPeriod: "2026.08.24(월) 이후 선착순",
		eduPeriod: "트랙별 상이 (커리큘럼 참고)",
		location: "국립순천대학교 · 참여기업 연계",
		note: "선착순 모집으로 조기 마감되었습니다.",
		applyUrl:
			"https://www.scnu.ac.kr/scnuai/cm/cntnts/cntntsView.do?mi=10310&cntntsId=5768",
		featured: false,
	},
	{
		id: "gen-2",
		generation: 2,
		status: "recruiting",
		capacity: "총 30명",
		recruitPeriod: "2026.09.14(월) ~ 09.30(수)",
		eduPeriod: "2026.10.06(화) ~ 12.12(토)",
		location: "광양 커뮤니티센터(공통과정) / 국립순천대학교(전문·몰입교과)",
		note: "선착순 모집으로 인해 조기 마감될 수 있습니다.",
		applyUrl:
			"https://docs.google.com/forms/d/e/1FAIpQLSd5-aya_NN-5Fma8SmLobOshtjVcfNxvtR0Pr4LGnf6tbLagw/viewform",
		featured: true,
	},
];

const [, , username = "admin", password = "admin708"] = process.argv;

const firebaseConfig = {
	apiKey: process.env.VITE_FIREBASE_API_KEY,
	authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

await signInWithEmailAndPassword(auth, toAuthEmail(username), password);
for (const cohort of seedCohorts) {
	await setDoc(doc(db, "cohorts", cohort.id), cohort);
	console.log(`seeded ${cohort.id}`);
}
await signOut(auth);
process.exit(0);
