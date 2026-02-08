// lib/server/pushNotifications.ts
import { messagingAdmin } from '@/lib/firebase/admin-sdk';
import * as admin from 'firebase-admin'; // Import 'firebase-admin' for type definitions, including admin.FirebaseError

interface NotificationPayload {
  title: string;
  body: string;
  imageUrl?: string;
}

interface DataPayload {
  [key: string]: string;
}

interface FCMSendResponse {
  successCount: number;
  failureCount: number;
  responses: Array<{ success: boolean; messageId?: string; error?: admin.FirebaseError }>;
}

/**
 * Sends FCM notifications to multiple devices using sendEachForMulticast.
 * This function can be used for broadcasting or sending to a group of users efficiently.
 * @param fcmTokens An array of FCM registration tokens.
 * @param notificationPayload The notification object (title, body, imageUrl).
 * @param dataPayload Optional data payload (custom key-value pairs, all values as strings).
 * @returns A Promise that resolves to an FCMSendResponse detailing success/failure counts and individual responses.
 */
export async function sendFCMNotifications(
  fcmTokens: string[],
  notificationPayload: NotificationPayload,
  dataPayload?: DataPayload
): Promise<FCMSendResponse> {
  if (fcmTokens.length === 0) {
    console.log('No FCM tokens provided to send notifications to.');
    return { successCount: 0, failureCount: 0, responses: [] };
  }

  if (!messagingAdmin) {
    console.error('Firebase Messaging Admin SDK is not available. This indicates a prior initialization failure.');
    throw new Error('Firebase Admin SDK is not initialized. Check your lib/firebase/admin-sdk.ts for initialization errors.');
  }

  // CORRECTED: Construct a single MulticastMessage object
  const multicastMessage: admin.messaging.MulticastMessage = {
    tokens: fcmTokens, // Array of tokens goes here
    notification: {
      title: notificationPayload.title,
      body: notificationPayload.body,
      imageUrl: notificationPayload.imageUrl,
    },
    data: dataPayload || {}, // Ensure 'data' is always an object, even if dataPayload is null/undefined
    // You can re-enable the webpush block here if needed, in this structure:
    // webpush: {
    //   headers: {
    //     Urgency: 'high',
    //   },
    //   fcmOptions: {
    //     link: dataPayload?.url || '/',
    //   },
    // },
  };

  let successCount = 0;
  let failureCount = 0;
  const responses: Array<{ success: boolean; messageId?: string; error?: admin.FirebaseError }> = [];

  try {
    // CORRECTED: Pass the single multicastMessage object
    const response = await messagingAdmin.sendEachForMulticast(multicastMessage);
    successCount = response.successCount;
    failureCount = response.failureCount;
    responses.push(...response.responses);

    // FCM batch send completed

    response.responses.forEach(
      (
        resp: { success: boolean; messageId?: string; error?: admin.FirebaseError },
        idx: number
      ) => {
        if (!resp.success) {
          // Token failed - will be handled by cleanup
        }
      }
    );

  } catch (error) {
    console.error('FCM send error:', (error as Error).message);
    failureCount = fcmTokens.length;
    responses.push({ success: false, error: error as admin.FirebaseError });
    throw error;
  }

  return { successCount, failureCount, responses };
}
