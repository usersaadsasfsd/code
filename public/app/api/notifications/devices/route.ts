// app/api/notifications/devices/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/server-utils';
import {
  getDeviceRegistrationsByUserId,
  addOrUpdateDeviceRegistration,
} from '@/lib/dev-db/push-devices';
import { DeviceRegistration } from '@/types/device'; // Import for typing

/**
 * Handles GET requests to retrieve device registrations for the authenticated user.
 * Expects a `userId` query parameter which must match the authenticated user's ID.
 */
export async function GET(request: NextRequest) {
  try {
    const decoded = verifyAuth(request);
    if (!decoded || !decoded.userId) {
        throw new Error('Authentication token invalid or missing userId.');
    }

    const { searchParams } = new URL(request.url);
    const userIdFromQuery = searchParams.get('userId');

    if (!userIdFromQuery) {
      return NextResponse.json(
        { message: 'User ID is required in query parameters.' },
        { status: 400 }
      );
    }

    if (userIdFromQuery !== decoded.userId) {
      return NextResponse.json(
        { message: 'Unauthorized: User ID mismatch. Cannot retrieve devices for another user.' },
        { status: 403 }
      );
    }

    const userDevices = await getDeviceRegistrationsByUserId(decoded.userId);

    if (userDevices.length === 0) {
      return NextResponse.json(
        { message: 'No devices registered for this user.', devices: [] },
        { status: 200 }
      );
    }

    return NextResponse.json(userDevices);
  } catch (error) {
    console.error('API GET /notifications/devices error:', error);
    if (error instanceof Error) {
      if (error.message.includes('Authentication required') || error.message.includes('Invalid or expired token')) {
        return NextResponse.json({ message: error.message }, { status: 401 });
      }
    }
    return NextResponse.json(
      { message: 'Failed to retrieve device registrations due to an unexpected server error.' },
      { status: 500 }
    );
  }
}

/**
 * Handles POST requests to register (add or update) a device for push notifications.
 * It expects device information including the FCM token and user ID.
 */
export async function POST(request: NextRequest) {
  // Changed deviceData type to expect fcmToken
  let deviceData: Omit<DeviceRegistration, 'id' | 'mongoId' | '_id' | 'createdAt' | 'updatedAt' | 'subscription'>; 
  try {
    const decoded = verifyAuth(request);
    if (!decoded || !decoded.userId) {
        throw new Error('Authentication token invalid or missing userId.');
    }

    try {
        deviceData = await request.json();
    } catch (jsonParseError: any) {
        console.error('Error parsing request JSON body:', jsonParseError);
        return NextResponse.json(
            { message: 'Invalid JSON in request body', error: jsonParseError.message },
            { status: 400 }
        );
    }

    // Validate for fcmToken instead of subscription
    if (!deviceData.userId || !deviceData.fcmToken) { 
        return NextResponse.json(
            { message: 'Missing required device registration information: userId or fcmToken.' },
            { status: 400 }
        );
    }

    if (deviceData.userId !== decoded.userId) {
      return NextResponse.json(
        { message: 'Unauthorized: User ID mismatch in device data. Cannot register device for another user.' },
        { status: 403 }
      );
    }

    // --- Utilize the unified addOrUpdateDeviceRegistration function ---
    // This function now returns whether a new device was created or an existing one was updated.
    const { device: registeredDevice, created: wasNewDeviceCreated } = await addOrUpdateDeviceRegistration(deviceData);

    // Return different status codes based on whether a new device was created or an existing one updated
    const status = wasNewDeviceCreated ? 201 : 200; // 201 Created for new, 200 OK for update

    return NextResponse.json(registeredDevice, { status: status });
  } catch (error) {
    console.error('API POST /notifications/devices error:', error);
    if (error instanceof Error) {
      if (error.message.includes('Authentication required') || error.message.includes('Invalid or expired token')) {
        return NextResponse.json({ message: error.message }, { status: 401 });
      }
      if (error.message.includes('Unauthorized: User ID mismatch')) {
        return NextResponse.json({ message: error.message }, { status: 403 });
      }
      // Changed error message check for FCM token
      if (error.message.includes('FCM token is required')) { 
        return NextResponse.json({ message: error.message }, { status: 400 });
      }
    }
    return NextResponse.json(
      { message: 'Failed to register/update device due to an unexpected server error.' },
      { status: 500 }
    );
  }
}
