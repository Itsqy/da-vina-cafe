const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, orderBy, limit } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkLogs() {
    try {
        console.log("Checking activity_logs...");
        const logsRef = collection(db, 'activity_logs');
        const q = query(logsRef, orderBy('timestamp', 'desc'), limit(5));
        const snap = await getDocs(q);

        console.log(`Found ${snap.size} logs.`);
        snap.forEach(doc => {
            console.log(doc.id, "=>", doc.data());
        });
    } catch (err) {
        console.error("Error fetching logs:", err.message);
        if (err.message.includes('FAILED_PRECONDITION')) {
            console.log("\nPotential missing index! Look for a URL in the full error message to create it.");
        }
    }
    process.exit();
}

checkLogs();
