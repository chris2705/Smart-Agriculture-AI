// Firebase configuration for Smart Agriculture AI
// Reads config from environment variables (VITE_FIREBASE_*)
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase safely — don't crash the app when env vars are missing
let app = null;
let database = null;

try {
    // Try to initialize the app; this may succeed even if some env vars are undefined
    app = initializeApp(firebaseConfig);
} catch (initErr) {
    // Initialization failed (likely missing/invalid config) — log and continue
    // eslint-disable-next-line no-console
    console.warn('[firebase] initializeApp failed:', initErr?.message || initErr);
    app = null;
}

if (app) {
    try {
        database = getDatabase(app);
    } catch (dbErr) {
        // getDatabase throws when it cannot determine a URL/project — avoid crashing
        // eslint-disable-next-line no-console
        console.warn('[firebase] getDatabase failed:', dbErr?.message || dbErr);
        database = null;
    }
} else {
    // No app — likely missing VITE_FIREBASE_* env vars. Warn once.
    // eslint-disable-next-line no-console
    console.warn('[firebase] Firebase not initialized: missing VITE_FIREBASE_* environment variables. Realtime features will be disabled.');
}

export { database };
export default app;
