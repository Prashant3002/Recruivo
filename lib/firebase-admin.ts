import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Check if Firebase Admin is already initialized to prevent multiple initializations
if (!getApps().length) {
  try {
    // First try using service account from environment variables
    if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      initializeApp({
        credential: cert({
          projectId: "recruivo-66a08",
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Replace newlines in the private key
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        storageBucket: "recruivo-66a08.firebasestorage.app"
      });
      console.log("Firebase Admin initialized with environment variables");
    } 
    // Fallback to service account key file
    else {
      try {
        const serviceAccount = require('../service-account-key.json');
        initializeApp({
          credential: cert(serviceAccount),
          storageBucket: "recruivo-66a08.firebasestorage.app"
        });
        console.log("Firebase Admin initialized with service account key file");
      } catch (fileError) {
        console.error("Error loading service account key file:", fileError);
        throw new Error("Firebase Admin initialization failed: No credentials available");
      }
    }
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    // Initialize with a limited configuration for development only
    if (process.env.NODE_ENV === 'development') {
      console.warn("Initializing Firebase Admin in limited mode for development");
      initializeApp();
    }
  }
}

// Export Firestore and Storage instances
export const adminDb = getFirestore();
export const adminStorage = getStorage();

// Helper function to convert Firestore timestamps to ISO strings for JSON responses
export const convertTimestamps = (doc) => {
  const data = doc.data();
  Object.keys(data).forEach((key) => {
    // Check if the value is a Firestore timestamp
    if (data[key] && typeof data[key].toDate === 'function') {
      data[key] = data[key].toDate().toISOString();
    }
  });
  return {
    id: doc.id,
    ...data
  };
};
