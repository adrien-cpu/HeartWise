
/**
 * @fileOverview Firebase configuration and initialization.
 * @module firebase
 * @description Initializes and exports Firebase services like Auth and Firestore.
 *              It reads Firebase configuration from environment variables.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Log at the very start to confirm the module is being loaded
console.log("[Firebase Init] Module loaded. Reading environment variables...");

// Ensure these environment variables are correctly set in your .env file
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID; // Optional

// Log the values of environment variables as they are read
console.log(`[Firebase Init] Read NEXT_PUBLIC_FIREBASE_API_KEY: ${apiKey ? 'FOUND (value starts with: ' + String(apiKey).substring(0,5) + '...)' : 'NOT FOUND or EMPTY'}`);
console.log(`[Firebase Init] Read NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${authDomain ? 'FOUND' : 'NOT FOUND or EMPTY'}`);
console.log(`[Firebase Init] Read NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${projectId ? 'FOUND' : 'NOT FOUND or EMPTY'}`);
// console.log(`[Firebase Init] Read NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${storageBucket ? 'FOUND' : 'NOT FOUND or EMPTY'}`);
// console.log(`[Firebase Init] Read NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${messagingSenderId ? 'FOUND' : 'NOT FOUND or EMPTY'}`);
// console.log(`[Firebase Init] Read NEXT_PUBLIC_FIREBASE_APP_ID: ${appId ? 'FOUND' : 'NOT FOUND or EMPTY'}`);
// console.log(`[Firebase Init] Read NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: ${measurementId ? 'FOUND' : 'NOT FOUND or EMPTY'}`);


let criticalConfigError = false;
const missingVars: string[] = [];

if (!apiKey) missingVars.push("NEXT_PUBLIC_FIREBASE_API_KEY");
if (!authDomain) missingVars.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
if (!projectId) missingVars.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
// Optional vars are not checked as critical, but good to have for full functionality
// if (!storageBucket) missingVars.push("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"); // Usually needed for storage
// if (!messagingSenderId) missingVars.push("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"); // For FCM
// if (!appId) missingVars.push("NEXT_PUBLIC_FIREBASE_APP_ID"); // Often required


if (missingVars.length > 0) {
  console.error(`[Firebase Init] CRITICAL_FIREBASE_CONFIG_ERROR: The following Firebase environment variables are missing or empty: ${missingVars.join(', ')}. 
    Please ensure they are correctly set in your .env file (e.g., .env.local for local development) and that your Next.js development server has been restarted.
    You can find these values in your Firebase project settings under 'Project Settings' > 'General' > 'Your apps' > 'Firebase SDK snippet' > 'Config'.
    Firebase services (Authentication, Firestore, etc.) will NOT work correctly until these are provided.`);
  criticalConfigError = true;
} else {
  console.log("[Firebase Init] Required Firebase configuration variables (API Key, Auth Domain, Project ID) appear to be present.");
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

if (!criticalConfigError) {
    // Avoid logging the full config object which includes the API key
    console.log("[Firebase Init] Firebase Config Object (excluding API key for security):", { 
        authDomain: firebaseConfig.authDomain, 
        projectId: firebaseConfig.projectId,
        // Add other non-sensitive keys if needed for debugging
    });
}


/**
 * Firebase application instance.
 * @type {FirebaseApp}
 */
let app: FirebaseApp;
/**
 * Firebase Auth instance.
 * @type {Auth}
 */
let auth: Auth;
/**
 * Firebase Firestore instance.
 * @type {Firestore}
 */
let firestore: Firestore;

// Initialize Firebase only if it hasn't been initialized yet and no critical errors
if (!criticalConfigError) {
  if (!getApps().length) {
    try {
      console.log("[Firebase Init] Initializing Firebase app...");
      app = initializeApp(firebaseConfig);
      console.log("[Firebase Init] Firebase app initialized successfully. Project ID from initialized app:", app.options.projectId);
      auth = getAuth(app);
      firestore = getFirestore(app);
      console.log("[Firebase Init] Firebase Auth and Firestore services initialized.");
    } catch (e: any) {
      console.error(`[Firebase Init] Firebase initializeApp FAILED. This can happen if config values are present but malformed (e.g., incorrect format for Project ID '${projectId}'), or there's an issue with the Firebase SDK itself. Error: ${e.message}`, "Stack:", e.stack);
      criticalConfigError = true; 
      // Create dummy objects to prevent further crashes if auth/firestore are accessed,
      // though operations will fail.
      app = {} as FirebaseApp; 
      auth = {} as Auth; 
      firestore = {} as Firestore; 
    }
  } else {
    app = getApps()[0];
    console.log("[Firebase Init] Firebase app already initialized. Project ID:", app.options.projectId);
    auth = getAuth(app);
    firestore = getFirestore(app);
    console.log("[Firebase Init] Using existing Firebase Auth and Firestore services.");
  }
} else {
  // This case means criticalConfigError was true, and we didn't attempt initialization.
  console.error("[Firebase Init] Firebase was NOT initialized due to missing or invalid configuration. Please check your .env file for NEXT_PUBLIC_FIREBASE_... variables and restart the server.");
  // Create dummy objects to prevent further crashes if auth/firestore are accessed,
  // though operations will fail.
  app = {} as FirebaseApp; 
  auth = {} as Auth; 
  firestore = {} as Firestore; 
}

export { app, auth, firestore, firebaseConfig, criticalConfigError };
