// app/api/notifications/push/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/server-utils';
import {
  getDeviceRegistrationsByUserId,
  updateDeviceRegistration,
} from '@/lib/dev-db/push-devices';
import { DeviceRegistration } from '@/types/device';
import { sendFCMNotifications } from '@/lib/server/pushNotifications'; // NEW: Import FCM sender

// Remove webpush imports and VAPID key declarations as they are no longer used
// import webpush from 'web-push';
// const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
// const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
// const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@countryroof.com';

// Remove web-push configuration
// if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
//   console.warn('VAPID keys are not set. Push notifications will not work until they are configured correctly.');
// } else {
//   try {
//     webpush.setVapidDetails(
//       VAPID_SUBJECT,
//       VAPID_PUBLIC_KEY,
//       VAPID_PRIVATE_KEY
//     );
//     console.log('web-push VAPID details successfully set.');
//   } catch (err) {
//     console.error('Error setting web-push VAPID details:', err);
//   }
// }

export async function POST(request: NextRequest) {
  let requestBody: { userId: string; title: string; message: string; url?: string; imageUrl?: string; data?: { [key: string]: string } }; // Changed icon to imageUrl for FCM
  try {
    // No longer need VAPID key check here, Firebase Admin SDK handles credentials

    const decoded = verifyAuth(request);
    if (!decoded || !decoded.userId) {
        throw new Error('Authentication token invalid or missing userId.');
    }

    try {
      requestBody = await request.json();
    } catch (jsonParseError: any) {
      console.error('Error parsing request JSON body:', jsonParseError);
      return NextResponse.json(
        { message: 'Invalid JSON in request body', error: jsonParseError.message },
        { status: 400 }
      );
    }

    const { userId, title, message, url, imageUrl, data } = requestBody;

    if (!userId || !title || !message) {
      return NextResponse.json(
        { message: 'Missing required notification information: userId, title, or message' },
        { status: 400 }
      );
    }

    if (userId !== decoded.userId) {
      return NextResponse.json(
        { message: 'Unauthorized: Attempt to send notification for a different user ID.' },
        { status: 403 }
      );
    }

    const userDevices: DeviceRegistration[] = await getDeviceRegistrationsByUserId(userId);

    if (userDevices.length === 0) {
      console.log(`No active devices found for user ${userId}. Skipping push notification.`);
      return NextResponse.json(
        { message: 'No active devices registered for this user to send push notifications to.' },
        { status: 200 }
      );
    }

    const fcmTokens = userDevices
      .filter(device => device.isActive && device.fcmToken) // Ensure device is active and has an FCM token
      .map(device => device.fcmToken);

    if (fcmTokens.length === 0) {
      console.log(`No valid FCM tokens found for user ${userId}. Skipping push notification.`);
      return NextResponse.json(
        { message: 'No valid FCM tokens found for this user.' },
        { status: 200 }
      );
    }

    const notificationPayload = {
      title: title,
      body: message,
      imageUrl: imageUrl, // Use imageUrl for FCM
    };

    const dataPayload = {
      url: url || '/',
      userId: userId,
      ...data,
      // Ensure all values in dataPayload are strings for FCM
      ...(Object.fromEntries(
        Object.entries(data || {}).map(([key, value]) => [key, String(value)])
      ) as { [key: string]: string }),
    };

    let successCount = 0;
    let failureCount = 0;

    // Use the new sendFCMNotifications function
    const response = await sendFCMNotifications(fcmTokens, notificationPayload, dataPayload);
    successCount = response.successCount;
    failureCount = response.failureCount;

    // Iterate through responses to update device status for failed tokens
    for (const [index, resp] of response.responses.entries()) {
      if (!resp.success && fcmTokens[index]) {
        const failedToken = fcmTokens[index];
        // Check for specific FCM errors that indicate token invalidation
        if (resp.error?.code === 'messaging/invalid-registration-token' ||
            resp.error?.code === 'messaging/registration-token-not-registered' ||
            resp.error?.code === 'messaging/token-not-in-topic') { // token-not-in-topic might mean unsubscribe too
          
          console.log(`FCM token ${failedToken} for user ${userId} is no longer valid. Deactivating device.`);
          const deviceToDeactivate = userDevices.find(d => d.fcmToken === failedToken);
          if (deviceToDeactivate) {
            await updateDeviceRegistration({ ...deviceToDeactivate, isActive: false });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${successCount} push notifications sent successfully. ${failureCount} failed.`,
      sentToCount: successCount,
      totalActiveDevices: userDevices.length,
    });

  } catch (error) {
    console.error('Push notification API internal error (caught in main try-catch block):', error);

    if (error instanceof Error) {
      if (error.message.includes('Authentication required') || error.message.includes('Invalid or expired token')) {
        return NextResponse.json({ message: error.message }, { status: 401 });
      }
      // Handle Firebase Admin SDK specific errors
      if (error.message.includes('Firebase Admin SDK not initialized')) {
        return NextResponse.json({ message: 'Server configuration error: Firebase Admin SDK not initialized.' }, { status: 500 });
      }
    }

    return NextResponse.json(
      { message: 'Failed to send push notification due to an unexpected server error.', details: (error as Error).message || 'No specific details available.' },
      { status: 500 }
    );
  }
}
