import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase with safety checks
let app;
let db;
let auth;

if (typeof window !== "undefined") {
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes("YOUR_")) {
        console.warn("Firebase credentials missing or using placeholders in .env.local. Features like booking and admin dashboard will be disabled.");
    } else {
        try {
            app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
            db = getFirestore(app);
            auth = getAuth(app);
        } catch (error) {
            console.error("Firebase initialization failed:", error);
        }
    }
}

export { db, auth };
