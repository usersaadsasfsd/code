// app/api/notifications/devices/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/server-utils';
import {
  deleteDeviceRegistration,
  getDeviceRegistrationById
} from '@/lib/dev-db/push-devices';
import { DeviceRegistration } from '@/types/device';

/**
 * Handles DELETE requests to unregister (delete) a specific device registration.
 * The device ID is provided as a dynamic segment in the URL.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const decoded = verifyAuth(request);
    if (!decoded || !decoded.userId) {
        throw new Error('Authentication token invalid or missing userId.');
    }

    const deviceId = params.id;

    if (!deviceId) {
      return NextResponse.json(
        { message: 'Device ID is required for deletion.' },
        { status: 400 }
      );
    }

    // --- Security Check: Verify device ownership efficiently ---
    // Fetch the specific device by its ID
    const deviceToDelete: DeviceRegistration | null = await getDeviceRegistrationById(deviceId);

    // If device not found OR if it doesn't belong to the authenticated user
    if (!deviceToDelete || deviceToDelete.userId !== decoded.userId) {
      return NextResponse.json(
        { message: 'Device not found or you are not authorized to delete this device.' },
        { status: 404 }
      );
    }

    // If ownership is verified, proceed with deletion
    const success = await deleteDeviceRegistration(deviceId);

    if (!success) {
      console.error(`Failed to delete device ${deviceId} for user ${decoded.userId} after ownership verification.`);
      return NextResponse.json(
        { message: 'Failed to unregister device due to a database error.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Device unregistered successfully.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('API DELETE /notifications/devices/[id] error:', error);

    if (error instanceof Error) {
      if (error.message.includes('Authentication required') || error.message.includes('Invalid or expired token')) {
        return NextResponse.json({ message: error.message }, { status: 401 });
      }
      if (error.message.includes('invalid ObjectId')) {
        return NextResponse.json({ message: 'Invalid device ID format.' }, { status: 400 });
      }
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
