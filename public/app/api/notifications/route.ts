// app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { NotificationsAPI } from '@/lib/api/notifications';
import { getDeviceRegistrationsByUserId } from '@/lib/dev-db/push-devices';
import { sendFCMNotifications } from '@/lib/server/pushNotifications';
import { User } from '@/types/auth'; // Import User interface to get role information

interface DecodedToken {
  userId: string;
  role: User['role']; // Ensure the decoded token includes the user's role
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('JWT_SECRET environment variable is not defined.');
  // In a production environment, you might want to throw an error here to prevent startup
  // throw new Error('JWT_SECRET environment variable is not defined.');
}

/**
 * Verifies the JWT from the Authorization header and decodes it.
 * @param request The NextRequest object.
 * @returns The decoded token payload.
 * @throws Error if authentication fails (missing token, invalid token, token expired).
 */
function verifyAuth(request: NextRequest): DecodedToken {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Authentication required: No Bearer token found in Authorization header.');
  }

  const token = authHeader.substring(7);

  if (!JWT_SECRET) {
    throw new Error('Server configuration error: JWT_SECRET is not set.');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Authentication required: Token expired.');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Authentication required: Invalid token.');
    }
    throw new Error('Authentication required: Failed to verify token.');
  }
}

/**
 * Handles GET requests to retrieve notifications for the authenticated user.
 * Filters notifications based on user role (agent gets their own, admin gets all).
 * @param request The NextRequest object.
 * @returns A NextResponse containing the list of notifications or an error.
 */
export async function GET(request: NextRequest) {
  try {
    const decoded = verifyAuth(request);
    // Ensure userId and role are present in the decoded token
    if (!decoded || !decoded.userId || !decoded.role) {
        throw new Error('Authentication token invalid or missing userId/role.');
    }

    // Call getUserNotifications with both userId and userRole for role-based filtering
    const notifications = await NotificationsAPI.getUserNotifications(decoded.userId, decoded.role);

    return NextResponse.json(notifications, { status: 200 });
  } catch (error: any) {
    console.error('API GET /notifications error:', error.message);
    if (error.message.includes('Authentication required')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { message: 'Internal server error', details: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

/**
 * Handles POST requests to create a new notification.
 * Includes logic for sending push notifications if devices are registered.
 * Admin users can create notifications for other users; regular users can only create for themselves.
 * @param request The NextRequest object.
 * @returns A NextResponse containing the created notification or an error.
 */
export async function POST(request: NextRequest) {
  try {
    const decoded = verifyAuth(request);
    if (!decoded || !decoded.userId || !decoded.role) { // Ensure role is present for POST as well
        throw new Error('Authentication required: Missing userId or role.');
    }

    const { userId, type, title, message, priority, data, actionUrl, actionLabel, scheduledFor } = await request.json();

    // Basic validation for required fields
    if (!userId || !type || !title || !message) {
      return NextResponse.json({ message: 'Missing required notification fields.' }, { status: 400 });
    }

    // Security check: A user should typically only create notifications for themselves.
    // However, an admin user might need to create notifications for other users.
    if (userId !== decoded.userId) {
      // If the creator is not the target user, check if the creator is an admin.
      if (decoded.role !== 'admin') {
        return NextResponse.json({ message: 'Unauthorized: Cannot create notifications for another user.' }, { status: 403 });
      }
      // If it's an admin creating for another user, allow it.
    }

    // Create the in-app notification record in the database
    const notification = await NotificationsAPI.createNotification({
      userId,
      type,
      title,
      message,
      priority,
      data,
      actionUrl,
      actionLabel,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined, // Convert scheduledFor string to Date object
    });

    // --- Attempt to send push notification ---
    try {
      // Get all active push notification device registrations for the target user
      const userDevices = await getDeviceRegistrationsByUserId(userId);
      const fcmTokens = userDevices.filter(device => device.isActive).map(device => device.fcmToken);

      if (fcmTokens.length > 0) {
        const notificationPayload = {
          title: notification.title,
          body: notification.message,
          // imageUrl: notification.imageUrl, // Uncomment if your Notification type includes imageUrl
        };

        // Ensure dataPayload values are strings, as required by FCM
        const dataPayload = (notification.data ? Object.fromEntries(
          Object.entries(notification.data || {}).map(([key, value]) => [key, String(value)])
        ) : {}) as { [key: string]: string };

        // Add actionUrl and actionLabel to dataPayload for client-side navigation
        if (notification.actionUrl) {
          dataPayload.actionUrl = notification.actionUrl;
        }
        if (notification.actionLabel) {
          dataPayload.actionLabel = notification.actionLabel;
        }
        dataPayload.notificationId = notification.id; // Include notification ID for client-side processing

        // Send FCM notifications to all active devices associated with the user
        await sendFCMNotifications(fcmTokens, notificationPayload, dataPayload);
        console.log(`FCM push initiated for new notification to ${fcmTokens.length} devices.`);
      } else {
        console.log('No active FCM devices found for user, skipping push notification for new in-app notification.');
      }
    } catch (pushError) {
      console.error('Error sending FCM push notification for new in-app notification:', pushError);
      // IMPORTANT: Do NOT rethrow pushError here. The primary task (creating in-app notification)
      // has succeeded. Push notification is a secondary, best-effort action.
    }

    return NextResponse.json(notification, { status: 201 }); // 201 Created status for successful creation
  } catch (error: any) {
    console.error('API POST /notifications error:', error.message);
    
    // Handle specific error types and return appropriate HTTP status codes
    if (error.message.includes('Authentication required')) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }
    if (error.message.includes('Missing required')) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    if (error.message.includes('Unauthorized: Cannot create notifications for another user.')) {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { message: 'Internal server error', details: error.message || 'An unknown error occurred during notification creation' },
      { status: 500 }
    );
  }
}
