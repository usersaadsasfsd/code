// lib/firebase/admin-sdk.ts
import * as admin from 'firebase-admin';

let messagingAdmin: admin.messaging.Messaging | null = null;

// --- START DEBUGGING LOGS ---
console.log('--- Firebase Admin SDK Initialization Debugging ---');
console.log('DEBUG: Checking environment variables...');
console.log('DEBUG: FIREBASE_ADMIN_PROJECT_ID:', process.env.FIREBASE_ADMIN_PROJECT_ID);
console.log('DEBUG: FIREBASE_ADMIN_CLIENT_EMAIL:', process.env.FIREBASE_ADMIN_CLIENT_EMAIL);

// IMPORTANT: Do NOT log the entire private key in production. Log length/snippet for debug.
const privateKeyExists = !!process.env.FIREBASE_ADMIN_PRIVATE_KEY;
console.log('DEBUG: FIREBASE_ADMIN_PRIVATE_KEY exists:', privateKeyExists);
if (privateKeyExists) {
  const pk = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  console.log('DEBUG: FIREBASE_ADMIN_PRIVATE_KEY length:', pk?.length);
  // Log first and last few characters to verify content, and check for '\n' replacement
  console.log('DEBUG: FIREBASE_ADMIN_PRIVATE_KEY snippet (raw):', pk?.substring(0, 20) + '...' + pk?.substring(pk?.length - 20));
  console.log('DEBUG: FIREBASE_ADMIN_PRIVATE_KEY after \\n replacement (snippet):', pk?.replace(/\\n/g, '\n').substring(0, 20) + '...');
} else {
  console.error('ERROR: FIREBASE_ADMIN_PRIVATE_KEY is missing or empty!');
}
console.log('--------------------------------------------------');
// --- END DEBUGGING LOGS ---

if (!admin.apps.length) {
  try {
    // Replace escaped newlines with actual newlines
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

    // Add a check for all required credentials
    if (!process.env.FIREBASE_ADMIN_PROJECT_ID || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !privateKey) {
        console.error('Firebase Admin SDK: CRITICAL - One or more required environment variables (PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY) are missing or invalid.');
        // Throw an error here to halt execution if essential credentials are not present
        throw new Error('Firebase Admin SDK: Incomplete or invalid credentials for initialization.');
    }

    const app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
    messagingAdmin = admin.messaging(app); // Get messaging from the specific app instance
    console.log('Firebase Admin SDK initialized successfully. Messaging instance obtained.');
  } catch (error) {
    console.error('Firebase Admin SDK initialization error (caught in admin-sdk.ts):', error);
    messagingAdmin = null; // Ensure it's null if initialization fails
    // Re-throw the error to propagate it up if initialization failed critically
    throw error;
  }
} else {
  // If the app is already initialized (e.g., during hot module reload in dev)
  try {
    messagingAdmin = admin.messaging();
    console.log('Firebase Admin SDK already initialized. Reusing existing messaging instance.');
  } catch (error) {
    console.error('Error retrieving existing Firebase Messaging instance:', error);
    messagingAdmin = null;
  }
}

export { messagingAdmin };
