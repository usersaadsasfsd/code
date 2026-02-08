// lib/firebase/admin-sdk.ts
import * as admin from 'firebase-admin';

let messagingAdmin: admin.messaging.Messaging | null = null;

if (!admin.apps.length) {
  try {
    // Replace escaped newlines with actual newlines
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

    // Check for all required credentials
    if (!process.env.FIREBASE_ADMIN_PROJECT_ID || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !privateKey) {
        console.error('Firebase Admin SDK: Missing required credentials');
        throw new Error('Firebase Admin SDK: Incomplete or invalid credentials for initialization.');
    }

    const app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
    messagingAdmin = admin.messaging(app);
  } catch (error) {
    console.error('Firebase Admin SDK initialization error');
    messagingAdmin = null;
    throw error;
  }
} else {
  try {
    messagingAdmin = admin.messaging();
  } catch (error) {
    console.error('Error retrieving Firebase Messaging instance');
    messagingAdmin = null;
  }
}

export { messagingAdmin };
