/**
 * @fileOverview Firebase configuration and initialization.
 * @module firebase
 * @description Initializes and exports Firebase services like Auth and Firestore.
 *              It reads Firebase configuration from environment variables.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Log the API key to help debug if it's being loaded correctly
console.log("Attempting to load Firebase API Key:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "Exists" : "MISSING or UNDEFINED");
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  console.error("Firebase API Key (NEXT_PUBLIC_FIREBASE_API_KEY) is missing. Please check your .env file and environment configuration.");
}


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/**
 * Firebase application instance.
 * @type {FirebaseApp}
 */
let app: FirebaseApp;

// Initialize Firebase only if it hasn't been initialized yet
if (!getApps().length) {
  if (!firebaseConfig.apiKey) {
    console.error(
      'Firebase API key is missing. Firebase will not be initialized. ' +
      'Please ensure NEXT_PUBLIC_FIREBASE_API_KEY is set in your .env file.'
    );
    // You might want to throw an error here or handle this case more gracefully
    // depending on how critical Firebase is to your app's startup.
    // For now, we'll let it proceed, but auth/firestore calls will fail.
  }
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

/**
 * Firebase Authentication instance.
 * @type {Auth}
 */
const auth: Auth = getAuth(app);

/**
 * Firebase Firestore instance.
 * @type {Firestore}
 */
const firestore: Firestore = getFirestore(app);

export { app, auth, firestore, firebaseConfig };
