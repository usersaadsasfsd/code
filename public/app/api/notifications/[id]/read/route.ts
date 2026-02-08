// api/notifications/[id]/read/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/server-utils';
import { NotificationsAPI } from '@/lib/api/notifications';

/**
 * Handles PATCH requests to mark a specific notification as read.
 * This endpoint expects the notification ID in the URL parameters.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const decoded = verifyAuth(request);
    if (!decoded || !decoded.userId) {
      throw new Error('Authentication token invalid or missing userId.');
    }
    const userId = decoded.userId;

    // Corrected method name: markNotificationAsRead
    const success = await NotificationsAPI.markNotificationAsRead(id, userId);

    if (!success) {
      return NextResponse.json(
        { message: 'Notification not found or access denied for this user.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Notification marked as read successfully.' });

  } catch (error) {
    console.error('PATCH /api/notifications/[id]/read error:', error);

    if (error instanceof Error) {
      if (error.message.includes('Authentication required') || error.message.includes('Invalid or expired token')) {
        return NextResponse.json({ message: error.message }, { status: 401 });
      }
    }

    return NextResponse.json(
      { message: 'Internal server error. Could not process request.' },
      { status: 500 }
    );
  }
}
