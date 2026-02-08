// lib/client/pushNotifications.ts

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, MessagePayload, deleteToken } from 'firebase/messaging';
import { DeviceRegistration } from '@/types/device'; // Your existing DeviceRegistration type
import { toast } from '@/hooks/use-toast'; // Import your toast component

// Define the expected structure of the payload for foreground messages
// This is what FCM sends when the app is in the foreground.
// The 'notification' field is standard FCM, 'data' is custom data.
export interface ForegroundMessagePayload {
  notification?: {
    title?: string;
    body?: string;
    icon?: string;
    // Add other standard notification properties if used (e.g., image, click_action)
  };
  data?: {
    actionUrl?: string; // e.g., URL to navigate to on click (from your backend)
    notificationId?: string; // if your backend sends this
    userId?: string; // if your backend sends this
    type?: string; // e.g., 'alert', 'info', 'success'
    priority?: string; // e.g., 'high', 'normal'
    [key: string]: any; // Allow other custom data
  };
}

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // If you use Google Analytics
};

// Initialize Firebase App (client-side)
let firebaseApp;
if (typeof window !== 'undefined' && !getApps().length) { // Ensure runs only in browser and only once
  firebaseApp = initializeApp(firebaseConfig);
} else if (typeof window !== 'undefined' && getApps().length) {
  firebaseApp = getApp();
}

const messaging = typeof window !== 'undefined' ? getMessaging(firebaseApp) : null;

/**
 * Checks if the current browser environment supports push notifications.
 * This includes checking for Notification API, Service Workers, and Firebase Messaging initialization.
 * @returns boolean - true if supported, false otherwise.
 */
export function isSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    !!messaging
  );
}

/**
 * Global function to set up Firebase Cloud Messaging on the client side.
 * This includes requesting permission, getting the FCM token, and sending it to the backend.
 * Renamed from setupPushNotificationsClient to subscribeToPush for clarity and consistency.
 * @param userId The ID of the current user.
 * @returns Promise that resolves with the FCM token string or null if not available/permission denied.
 */
export async function subscribeToPush(userId: string): Promise<string | null> {
  if (!isSupported()) {
    console.warn("Push notifications are not fully supported or initialized in this environment.");
    return null; // --- FIX: Return null when not supported
  }
  // Changed NEXT_PUBLIC_FIREBASE_VAPID_KEY to NEXT_PUBLIC_VAPID_PUBLIC_KEY for consistency,
  // but if your env is explicitly NEXT_PUBLIC_FIREBASE_VAPID_KEY, keep it that way.
  // For this update, I'll stick to your provided variable name.
  if (!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY) {
    console.error("NEXT_PUBLIC_FIREBASE_VAPID_KEY is not set. FCM will not work.");
    return null; // --- FIX: Return null when VAPID key is missing
  }

  try {
    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied by the user.');
      return null; // --- FIX: Return null when permission is denied
    }

    // Register the Firebase service worker (even though it's served from /public)
    // The path here MUST match the path to your firebase-messaging-sw.js file.
    // This registration can also happen once in app/layout.tsx
    const serviceWorkerRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('Firebase Messaging Service Worker registered:', serviceWorkerRegistration);

    // Get FCM registration token
    const currentToken = await getToken(messaging!, { // Use non-null assertion as messaging is checked by isSupported
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY, // This is your VAPID key from Firebase Console
      serviceWorkerRegistration: serviceWorkerRegistration,
    });

    if (currentToken) {
      console.log("FCM Registration Token:", currentToken);
      // Send this token to your backend to associate with the userId
      await sendFcmTokenToBackend(userId, currentToken); // Removed swRegistration as it's not needed for backend storage
      return currentToken; // --- FIX: Return the token on success
    } else {
      console.log('No FCM registration token available. Request permission to generate one.');
      return null; // --- FIX: Return null if no token is available
    }
  } catch (error) {
    console.error('Error setting up Firebase push notifications:', error);
    return null; // --- FIX: Return null on any error during setup
  }
}

/**
 * Checks if there is an active FCM subscription for the current device.
 * This does not guarantee the subscription is valid on the backend, only that a token exists client-side.
 * @returns Promise<boolean> - true if an FCM token is found, false otherwise.
 */
export async function hasActiveSubscription(): Promise<boolean> {
  if (!messaging) {
    return false;
  }
  try {
    const currentToken = await getToken(messaging);
    return !!currentToken;
  } catch (error) {
    console.error('Error checking active subscription:', error);
    return false;
  }
}


/**
 * Sends the FCM token and device info to your backend for registration.
 * This function is internal to this file, called by subscribeToPush.
 */
async function sendFcmTokenToBackend(
  userId: string,
  fcmToken: string
): Promise<DeviceRegistration | null> {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }

    const deviceName = getDeviceType(); // Reusing your helper from the old service
    const deviceType = getDeviceType();

    const response = await fetch('/api/notifications/devices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
        fcmToken, // Now sending the FCM token string
        deviceName: `Browser (${deviceName})`,
        deviceType: deviceType,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to register FCM token with the server.');
    }

    const device: DeviceRegistration = await response.json();
    console.log('FCM Token registered/updated successfully with backend:', device);
    return device;
  } catch (err) {
    console.error('Error sending FCM token to backend:', err);
    return null;
  }
}

/**
 * Retrieves a list of push device registrations for the given user from the backend.
 * This function makes an API call to your backend.
 * @param userId The ID of the user whose devices to retrieve.
 * @returns Promise<DeviceRegistration[]> - An array of registered devices.
 */
export async function getUserDevices(userId: string): Promise<DeviceRegistration[]> {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }

    const response = await fetch(`/api/notifications/devices?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch user devices from the server.');
    }

    const devices: DeviceRegistration[] = await response.json();
    console.log('User devices fetched successfully:', devices);
    return devices;
  } catch (error) {
    console.error('Error fetching user devices:', error);
    return []; // Return an empty array on error
  }
}

/**
 * Sets up a listener for messages coming from FCM when the app is in the foreground.
 * This function now also handles displaying the system notification and in-app toast.
 * @param callback Optional: A function to call with the parsed payload after displaying notifications.
 * @returns A cleanup function to unsubscribe the listener.
 */
export function onPushMessageReceived(callback?: (payload: ForegroundMessagePayload) => void): () => void {
  if (!messaging) {
    console.warn("Firebase Messaging not initialized. Cannot listen for foreground messages.");
    return () => {}; // Return a no-op cleanup
  }

  const unsubscribe = onMessage(messaging, (payload: MessagePayload) => {
    console.log('Foreground FCM message received:', payload);

    // Transform FCM MessagePayload to your internal ForegroundMessagePayload structure
    const transformedPayload: ForegroundMessagePayload = {
      notification: payload.notification,
      data: payload.data, // Custom data sent from Firebase Admin SDK
    };

    // --- NEW: Display the browser notification ---
    if (transformedPayload.notification && Notification.permission === 'granted') {
      const { title, body, icon } = transformedPayload.notification;
      const { actionUrl, ...customData } = transformedPayload.data || {};

      const notificationOptions: NotificationOptions = {
        body: body,
        icon: icon || '/favicon.png', // Use provided icon or default favicon
        data: customData, // Attach custom data to the notification object
        // Add a tag to group notifications, e.g., 'new-message'
        tag: 'foreground-fcm-notification',
      };

      try {
        const notification = new Notification(title || 'New Notification', notificationOptions);

        // Optional: Add click handler to the notification
        if (actionUrl) {
          notification.onclick = (event) => {
            event.preventDefault();
            window.open(actionUrl, '_blank'); // Open the URL in a new tab
            notification.close();
          };
        }
        console.log('Foreground system notification displayed successfully.');
      } catch (error) {
        console.error('Error displaying foreground system notification:', error);
      }
    } else if (transformedPayload.notification) {
      console.warn('Notification permission not granted, skipping system notification display.');
    }

    // --- NEW: Show an in-app toast notification ---
    if (transformedPayload.notification) {
      const { title, body } = transformedPayload.notification;
      const { actionUrl } = transformedPayload.data || {};
      toast({
        title: title || "New Notification",
        description: body,
        action: actionUrl ? {
          label: "View",
          onClick: () => window.open(actionUrl, '_blank'),
        } : undefined,
      });
    }

    // Call the provided callback (if any) after handling display
    if (callback) {
      callback(transformedPayload);
    }
  });
  return unsubscribe;
}

/**
 * Unsubscribes from FCM push notifications and optionally deregisters from the backend.
 * NOTE: FCM doesn't have a direct 'unsubscribe' like Web Push. Deleting the token
 * is the closest equivalent. If you want to stop receiving notifications, you
 * should delete the token from the client and from your backend.
 * @param deviceId The ID of the device registration to delete from the backend.
 * @returns True if successfully unregistered from backend, false otherwise.
 */
export async function unsubscribeFromPush(deviceId: string): Promise<boolean> {
  try {
    // Delete the FCM token from the client (this might prevent future messages)
    if (messaging) {
      // getToken() returns the current token, if it exists, without generating a new one.
      // We then delete that token.
      await getToken(messaging)
        .then(async (currentToken) => {
          if (currentToken) {
            await deleteToken(messaging);
            console.log('FCM token deleted from client.');
          }
        })
        .catch((error) => {
          // Handle cases where getToken fails (e.g., no active subscription)
          console.warn('Could not get FCM token to delete (may not exist or permission denied):', error);
        });
    }

    // Also delete the device registration from your backend API
    const response = await fetch(`/api/notifications/devices/${deviceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to unregister device from the server.');
    }

    console.log('Device unregistered successfully from backend.');
    return true;
  } catch (err: any) {
    console.error('Error unsubscribing from push notifications:', err);
    return false;
  }
}

/**
 * Sends a test push notification to the user's registered devices via the backend API.
 * This is still triggered from the frontend, but the actual sending happens on the backend
 * using Firebase Admin SDK.
 * @param userId The ID of the user to send the test notification to.
 * @param title Title of the test notification.
 * @param message Body of the test notification.
 * @param actionUrl Optional URL for notification click action.
 * @throws Error if sending the test notification fails.
 */
export async function testPushNotification(userId: string, title: string, message: string, actionUrl?: string): Promise<void> {
  const response = await fetch('/api/notifications/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
    },
    body: JSON.stringify({
      userId,
      title,
      message,
      actionUrl, // Pass actionUrl to the backend to include in FCM data
      icon: '/favicon.png', // Or a default icon
      tag: 'test-notification', // For grouping notifications
      data: { // Additional custom data that will be in payload.data
        source: 'frontend_test',
        timestamp: Date.now(),
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to send test notification.');
  }
  console.log('Test push notification request sent successfully to backend for FCM.');
}


/**
 * Helper to determine the device type based on user agent string.
 * @returns The determined device type ('desktop', 'mobile', or 'tablet').
 */
export function getDeviceType(): DeviceRegistration['deviceType'] {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  if (/Mobi|Android|iPhone|iPod/i.test(userAgent)) {
    return 'mobile';
  }
  if (/Tablet|iPad/i.test(userAgent) && !/Mobi/i.test(userAgent)) {
    return 'tablet';
  }
  return 'desktop';
}
