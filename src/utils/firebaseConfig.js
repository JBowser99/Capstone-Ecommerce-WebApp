import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore, memoryLocalCache, persistentLocalCache } from "firebase/firestore";
import { setLogLevel } from "firebase/firestore";

//Firebase Configuration
// ✅ Correctly use `import.meta.env`
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

setLogLevel("error"); // Only show critical errors, not debug warnings

// ✅ Initialize Firebase App
const app = initializeApp(firebaseConfig);

// ✅ Initialize Firebase Auth
const auth = getAuth(app);

// ✅ Initialize Firestore with Persistent Cache (Replaces `enableIndexedDbPersistence`)
const db = initializeFirestore(app, {
  localCache: persistentLocalCache()
});

export { auth, db };
