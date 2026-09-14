#!/usr/bin/env node
// One-off / ops utility for creating the very first admin account (or any
// account from the command line without going through the in-app "계정
// 관리" screen). Requires Firebase env vars — run with:
//   node --env-file=.env scripts/create-account.mjs <username> <password> [admin|manager]
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signOut } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";

const AUTH_EMAIL_DOMAIN = "youth-admin.local";
const toAuthEmail = (username) => `${username.trim().toLowerCase()}@${AUTH_EMAIL_DOMAIN}`;

const [, , username, password, role = "manager"] = process.argv;

if (!username || !password) {
	console.error(
		"Usage: node --env-file=.env scripts/create-account.mjs <username> <password> [admin|manager]",
	);
	process.exit(1);
}
if (role !== "admin" && role !== "manager") {
	console.error('role must be "admin" or "manager"');
	process.exit(1);
}

const firebaseConfig = {
	apiKey: process.env.VITE_FIREBASE_API_KEY,
	authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
	console.error("Missing VITE_FIREBASE_* env vars — pass --env-file=.env to node.");
	process.exit(1);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const email = toAuthEmail(username);
const credential = await createUserWithEmailAndPassword(auth, email, password);
await setDoc(doc(db, "users", credential.user.uid), { username, role });
await signOut(auth);

console.log(`Created ${role} account "${username}" (uid: ${credential.user.uid}).`);
process.exit(0);
