/**
 * @fileOverview Firebase configuration and initialization.
 * @module firebase
 * @description Initializes and exports Firebase services like Auth and Firestore.
 *              It reads Firebase configuration from environment variables.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
// Add other necessary Firebase config variables here

let criticalConfigError = false;

if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
  console.error("CRITICAL_FIREBASE_CONFIG_ERROR: NEXT_PUBLIC_FIREBASE_API_KEY is missing, empty, or not a string. Value received:", apiKey);
  criticalConfigError = true;
}
if (!authDomain || typeof authDomain !== 'string' || authDomain.trim() === '') {
  console.error("CRITICAL_FIREBASE_CONFIG_ERROR: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is missing or empty. Value received:", authDomain);
  criticalConfigError = true;
}
if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
  console.error("CRITICAL_FIREBASE_CONFIG_ERROR: NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing or empty. Value received:", projectId);
  criticalConfigError = true;
}

if (criticalConfigError) {
  console.error("Firebase initialization cannot proceed due to missing critical configuration. Please check your .env.local file and ensure all NEXT_PUBLIC_FIREBASE_ prefixed variables are correctly set and your Next.js development server has been restarted.");
  // Optional: throw new Error("Firebase critical configuration is missing.");
} else {
  console.log("Firebase API Key (NEXT_PUBLIC_FIREBASE_API_KEY) appears to be present.");
}

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: apiKey,
  authDomain: authDomain,
  projectId: projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

/**
 * Firebase application instance.
 * @type {FirebaseApp}
 */
let app: FirebaseApp;

// Initialize Firebase only if it hasn't been initialized yet and no critical errors
if (!getApps().length && !criticalConfigError) {
  try {
    app = initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully with Project ID:", firebaseConfig.projectId);
  } catch (e) {
    console.error("Firebase initializeApp failed. Config used:", firebaseConfig, "Actual Error:", e);
    // This error might occur if the config values are present but malformed,
    // or if there's an issue with the Firebase SDK itself.
    // The `auth/api-key-not-valid` error is usually caught later by Firebase services if initializeApp succeeds with a bad key.
    criticalConfigError = true; // Mark as critical error if initializeApp fails
  }
} else if (getApps().length) {
  app = getApps()[0];
  console.log("Firebase app already initialized.");
} else {
  // This case means criticalConfigError was true, and we didn't attempt initialization.
  console.error("Firebase was not initialized due to configuration errors.");
  // Create a dummy app object to prevent further errors down the line if auth/firestore are accessed,
  // though operations will fail. This is a debated approach.
  // A more robust solution would be to conditionally render parts of the app or show a global error.
  app = {} as FirebaseApp; 
}

// Conditionally export auth and firestore if initialization was attempted and didn't critically fail before this point.
// However, if firebaseConfig was bad, these will still error upon use.
const auth: Auth = !criticalConfigError ? getAuth(app) : {} as Auth;
const firestore: Firestore = !criticalConfigError ? getFirestore(app) : {} as Firestore;

export { app, auth, firestore, firebaseConfig };
