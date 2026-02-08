// project/app/api/communications/all-activities/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { CommunicationsAPI } from '@/lib/api/communications';

// Define the shape for RecentActivity consistent with your frontend
interface RecentActivity {
  id: string;
  type: 'whatsapp' | 'calendar' | 'email' | 'call';
  message: string;
  timestamp: Date;
  leadName?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const userId = searchParams.get('userId');
    const userRole = searchParams.get('userRole'); // Get userRole from query parameter (for demo)

    const limit = limitParam ? parseInt(limitParam, 10) : 20; // Default limit

    // Determine if the request is from an admin
    // In a real app, this logic would involve verifying a JWT/session on the backend
    // to securely get the user's role. DO NOT trust userRole from query params in production.
    const isAdmin = userRole === 'admin';

    let allActivities;
    if (isAdmin) {
        allActivities = await CommunicationsAPI.getAllRecentActivities(limit);
    } else {
        allActivities = await CommunicationsAPI.getAllRecentActivities(limit, userId || undefined); // Filter by userId for regular user
    }

    const formattedActivities: RecentActivity[] = allActivities.map(activity => {
      const activityType: 'whatsapp' | 'calendar' | 'email' | 'call' =
        ['whatsapp', 'calendar', 'email', 'call'].includes(activity.type)
          ? (activity.type as 'whatsapp' | 'calendar' | 'email' | 'call')
          : 'calendar';

      return {
        id: activity.id,
        type: activityType,
        message: activity.message,
        timestamp: new Date(activity.timestamp),
        leadName: activity.leadId, // Still using leadId as leadName for now
      };
    });

    return NextResponse.json(formattedActivities);
  } catch (error) {
    console.error('API Error fetching all recent activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch all recent communication activities' },
      { status: 500 }
    );
  }
}
