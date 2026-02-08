// project/app/api/communications/stats/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { CommunicationsAPI } from '@/lib/api/communications';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userRole = searchParams.get('userRole'); // Get userRole from query parameter (for demo)

    // Determine if the request is from an admin
    // In a real app, this logic would involve verifying a JWT/session on the backend
    // to securely get the user's role. DO NOT trust userRole from query params in production.
    const isAdmin = userRole === 'admin'; 

    let stats;
    if (isAdmin) {
      stats = await CommunicationsAPI.getCommunicationStats(); // No userId filter for admin
    } else {
      stats = await CommunicationsAPI.getCommunicationStats(userId || undefined); // Filter by userId for regular user
    }
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('API Error fetching communication stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch communication statistics' },
      { status: 500 }
    );
  }
}
