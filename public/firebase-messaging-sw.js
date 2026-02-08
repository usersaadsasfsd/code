// public/firebase-messaging-sw.js
// This is the Firebase Cloud Messaging Service Worker file.
// It handles background messages and ensures the app can receive push notifications.

// Import Firebase scripts from a CDN. Make sure the version matches your installed firebase package.
// Check your package.json for the 'firebase' dependency version.
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// "Default" Firebase configuration for the Service Worker.
// These values MUST match the ones you use in lib/client/pushNotifications.ts
// Replace with your actual environment variables (they must be hardcoded here for the SW).
const firebaseConfig = {
  // *** IMPORTANT: REPLACE THESE WITH YOUR ACTUAL VALUES FROM .env.local ***
  apiKey: "AIzaSyBMj91MMojzomwaLsNA1JOhjzveHbF2w5Q", // YOUR_NEXT_PUBLIC_FIREBASE_API_KEY
  authDomain: "lms-realestate.firebaseapp.com",     // YOUR_NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  projectId: "lms-realestate",                       // YOUR_NEXT_PUBLIC_FIREBASE_PROJECT_ID
  storageBucket: "lms-realestate.firebasestorage.app", // YOUR_NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "776687413506",                 // YOUR_NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:776687413506:web:28848cd930fd7f8aa5ba1b", // YOUR_NEXT_PUBLIC_FIREBASE_APP_ID
  // measurementId: "YOUR_NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID" // Optional, if you have it
};

// Initialize Firebase App within the Service Worker
firebase.initializeApp(firebaseConfig);

// Get the Firebase Messaging instance
const messaging = firebase.messaging();

// Handle incoming background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  // Customize notification display options
  const notificationTitle = payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.notification?.body,
    icon: payload.notification?.icon || '/favicon.png', // Path to your app's default icon
    badge: '/badge.png', // Optional: A small icon displayed on some platforms
    data: payload.data || {}, // Custom data passed with the notification
    // Actions for notification buttons (optional)
    actions: [
      // { action: 'view-action', title: 'View', icon: '/images/checkmark.png' },
    ],
  };

  // Show the notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks (optional)
self.addEventListener('notificationclick', (event) => {
  const clickedNotification = event.notification;
  const action = event.action; // If you have action buttons

  console.log('Notification click:', event);

  clickedNotification.close(); // Close the notification

  // Check if a custom action URL was provided in the notification data
  // FCM 'data' field is directly accessible here.
  const actionUrl = event.notification.data?.actionUrl || '/'; // Default to homepage

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === actionUrl && 'focus' in client) {
          return client.focus(); // Focus on existing tab
        }
      }
      // Otherwise, open a new window
      return clients.openWindow(actionUrl);
    })
  );
});
