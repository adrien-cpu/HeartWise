/**
 * @fileOverview Firebase configuration and initialization.
 * @module firebase
 * @description Initializes and exports Firebase services like Auth and Firestore.
 *              It reads Firebase configuration from environment variables.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Ensure these environment variables are correctly set in your .env.local file
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID; // Optional

let criticalConfigError = false;
const missingVars: string[] = [];

if (!apiKey) missingVars.push("NEXT_PUBLIC_FIREBASE_API_KEY");
if (!authDomain) missingVars.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
if (!projectId) missingVars.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
// Optional vars are not checked as critical, but good to have for full functionality
// if (!storageBucket) missingVars.push("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
// if (!messagingSenderId) missingVars.push("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
// if (!appId) missingVars.push("NEXT_PUBLIC_FIREBASE_APP_ID");


if (missingVars.length > 0) {
  console.error(`CRITICAL_FIREBASE_CONFIG_ERROR: The following Firebase environment variables are missing or empty in your .env file: ${missingVars.join(', ')}. Please ensure they are correctly set and your Next.js development server has been restarted.`);
  criticalConfigError = true;
} else {
  console.log("Firebase configuration variables (API Key, Auth Domain, Project ID) appear to be present.");
}

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: apiKey,
  authDomain: authDomain,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId: messagingSenderId,
  appId: appId,
  measurementId: measurementId, // Optional
};

/**
 * Firebase application instance.
 * @type {FirebaseApp}
 */
let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

// Initialize Firebase only if it hasn't been initialized yet and no critical errors
if (!criticalConfigError) {
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
      console.log("Firebase initialized successfully with Project ID:", firebaseConfig.projectId);
      auth = getAuth(app);
      firestore = getFirestore(app);
    } catch (e: any) {
      console.error("Firebase initializeApp failed. This can happen if config values are present but malformed (e.g., incorrect format), or there's an issue with the Firebase SDK itself. Config used:", firebaseConfig, "Actual Error:", e.message);
      criticalConfigError = true; // Mark as critical error if initializeApp fails
      // Create dummy objects to prevent further crashes, though operations will fail.
      app = {} as FirebaseApp;
      auth = {} as Auth;
      firestore = {} as Firestore;
    }
  } else {
    app = getApps()[0];
    console.log("Firebase app already initialized.");
    auth = getAuth(app);
    firestore = getFirestore(app);
  }
} else {
  // This case means criticalConfigError was true, and we didn't attempt initialization.
  console.error("Firebase was not initialized due to missing or invalid configuration. Please check your .env file and restart the server.");
  // Create dummy objects to prevent further crashes if auth/firestore are accessed,
  // though operations will fail.
  app = {} as FirebaseApp;
  auth = {} as Auth;
  firestore = {} as Firestore;
}

export { app, auth, firestore, firebaseConfig };
