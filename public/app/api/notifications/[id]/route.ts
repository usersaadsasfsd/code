// api/notifications/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
// Removed direct 'jwt' import as verifyAuth handles it
import { verifyAuth } from '@/lib/auth/server-utils'; // Centralized authentication utility
import { NotificationsAPI } from '@/lib/api/notifications'; // Assuming this path is correct

// Removed JwtPayload interface and local verifyAuth function
// as they are now imported from '@/lib/auth/server-utils'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } } // `id` will be the notification ID
) {
  try {
    const { id } = params; // Extract notification ID from params

    // Verify authentication and get the userId from the token using the centralized utility
    const decoded = verifyAuth(request);
    // Ensure the decoded token has a userId (though verifyAuth should already ensure this)
    if (!decoded || !decoded.userId) {
      throw new Error('Authentication token invalid or missing userId.');
    }
    const userId = decoded.userId;

    // Call the NotificationsAPI to delete the notification
    // It's crucial that deleteNotification checks if the notification belongs to the userId
    const success = await NotificationsAPI.deleteNotification(id, userId);

    if (!success) {
      // If deleteNotification returns false, it means the notification was not found
      // or the user was not authorized to delete it (if handled within the API method)
      return NextResponse.json(
        { message: 'Notification not found or not authorized to delete.' },
        { status: 404 }
      );
    }

    // Return success response
    return NextResponse.json({ message: 'Notification deleted successfully' });

  } catch (error) {
    console.error('DELETE /api/notifications/[id] error:', error);

    // Handle specific error types from the centralized verifyAuth utility
    if (error instanceof Error) {
      if (error.message.includes('Authentication required') || error.message.includes('Invalid or expired token')) {
        return NextResponse.json({ message: error.message }, { status: 401 }); // Unauthorized
      }
      // You can add more specific error handling here if NotificationsAPI.deleteNotification throws custom errors
    }

    // Fallback for unexpected errors
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
