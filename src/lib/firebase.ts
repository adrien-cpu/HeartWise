/**
 * @fileOverview Firebase configuration and initialization.
 * @module firebase
 * @description Initializes and exports Firebase services like Auth and Firestore.
 *              It reads Firebase configuration from environment variables.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Log at the very start to confirm the module is being loaded
console.log("[Firebase Init] Module loaded. Reading environment variables...");

// Ensure these environment variables are correctly set in your .env.local file
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID; // Optional

// Log the values of environment variables as they are read
console.log(`[Firebase Init] Read NEXT_PUBLIC_FIREBASE_API_KEY: ${apiKey ? 'FOUND (value starts with: ' + String(apiKey).substring(0, 5) + '...)' : 'NOT FOUND or EMPTY'}`);
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
    Please ensure they are correctly set in your .env.local file (e.g., .env.local for local development) and that your Next.js development server has been restarted.
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

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export { criticalConfigError };
