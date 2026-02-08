// api/notifications/mark-all-read/route.ts

import { NextRequest, NextResponse } from 'next/server';
// Assuming NotificationsAPI handles database operations for notifications
import { NotificationsAPI } from '@/lib/api/notifications';
// Assuming verifyAuth and JwtPayload are exported from this utility file
import { verifyAuth } from '@/lib/auth/server-utils';

// Removed the local JwtPayload interface definition as verifyAuth from server-utils
// handles the return type implicitly.

/**
 * Handles PATCH requests to mark all notifications for the authenticated user as read.
 * This endpoint is designed to operate on all notifications associated with the user
 * identified by the JWT token, rather than a single notification by ID.
 *
 * @param request The NextRequest object representing the incoming request.
 * @returns A NextResponse object indicating success or failure.
 */
export async function PATCH(request: NextRequest) { // Changed to PATCH to match common frontend use
  try {
    // 1. Authenticate the user and extract their userId from the JWT.
    // The verifyAuth function (from server-utils) will throw an error if authentication fails,
    // which is then caught by the try/catch block.
    const decoded = verifyAuth(request); // `decoded` will have the userId
    // Ensure the decoded token has a userId (though verifyAuth should already ensure this)
    if (!decoded || !decoded.userId) {
      throw new Error('Authentication token invalid or missing userId.');
    }
    const userId = decoded.userId; // Assuming 'userId' is the key in your JWT payload

    // 2. Call the NotificationsAPI to perform the 'mark all as read' operation.
    // It's crucial that NotificationsAPI.markAllNotificationsAsRead ensures that only notifications
    // belonging to the provided userId are affected.
    const success = await NotificationsAPI.markAllNotificationsAsRead(userId);

    // 3. Return a successful response, including the count of notifications affected.
    // The markAllNotificationsAsRead function returns a boolean.
    // The frontend can determine success from this or the status code.
    if (!success) {
      // If no notifications were updated (e.g., all were already read),
      // we can still return a success message but with a count of 0.
      return NextResponse.json({
        message: 'No unread notifications found to mark as read.',
        count: 0,
      });
    }

    // A more accurate count would require changing the API method to return the number of modified documents.
    // As it currently returns a boolean, we'll assume a successful update means at least one was modified.
    // The current implementation of markAllNotificationsAsRead returns true if > 0 modified.
    return NextResponse.json({
      message: 'Notifications marked as read successfully.',
      // The current API method returns a boolean, so we can't provide a count.
      // If you update your API method to return `result.modifiedCount`, you can use that here.
      // For now, we'll just indicate success.
    });

  } catch (error) {
    // 4. Handle various error scenarios.
    console.error('PATCH /api/notifications/mark-all-read error:', error); // Log the error for server-side debugging

    if (error instanceof Error) {
      // Handle authentication-related errors thrown by verifyAuth
      if (
        error.message.includes('Authentication required') ||
        error.message.includes('Invalid or expired token')
      ) {
        return NextResponse.json({ message: error.message }, { status: 401 }); // 401 Unauthorized
      }
      // You can add more specific error handling here for errors originating
      // from NotificationsAPI.markAllNotificationsAsRead if it throws distinct types of errors.
    }

    // 5. Return a generic 500 Internal Server Error for any unhandled exceptions.
    return NextResponse.json(
      { message: 'Internal server error. Failed to mark all notifications as read.' },
      { status: 500 }
    );
  }
}
