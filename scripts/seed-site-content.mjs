#!/usr/bin/env node
// Seeds the editable page-copy document into Firestore. Run once against a
// fresh project (after create-account.mjs has created at least one login):
//   node --env-file=.env --experimental-strip-types scripts/seed-site-content.mjs
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { defaultSiteContent } from "../src/data/defaultSiteContent.ts";

const AUTH_EMAIL_DOMAIN = "youth-admin.local";
const toAuthEmail = (username) => `${username.trim().toLowerCase()}@${AUTH_EMAIL_DOMAIN}`;

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
await setDoc(doc(db, "siteContent", "main"), defaultSiteContent);
console.log("seeded siteContent/main");
await signOut(auth);
process.exit(0);
