// types/device.ts

import { ObjectId } from 'mongodb'; // Import ObjectId here

// Remove PushSubscription interface as it's no longer used for FCM
// export interface PushSubscription {
//   endpoint: string;
//   expirationTime: number | null;
//   keys: {
//     p256dh: string;
//     auth: string;
//   };
// }

export interface DeviceRegistration {
  id: string; // The unique ID of the device registration (MongoDB's _id as string)
  mongoId: string; // Explicitly add mongoId to hold the _id as string
  _id?: ObjectId; // Make _id optional for when creating, but present when fetched from DB
  
  userId: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet'; //
  fcmToken: string; // NEW: Replaced 'subscription: PushSubscription' with 'fcmToken: string'
  isActive: boolean; // Assuming your backend tracks if the subscription is still valid
  createdAt: string; // Keep as string (ISO format) for the frontend/API output
  updatedAt: string; // Keep as string (ISO format) for the frontend/API output
}
