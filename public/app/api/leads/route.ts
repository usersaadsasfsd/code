import { NextRequest, NextResponse } from 'next/server';
import { LeadsAPI } from '@/lib/api/leads'; // Assuming this path is correct

export async function GET(request: NextRequest) { // <-- Accept the request object
  try {
    const { searchParams } = new URL(request.url);
    const leadType = searchParams.get('leadType'); // <-- Extract leadType from query params

    // Prepare filter options only if leadType is present and valid
    const filterOptions: { leadType?: 'Lead' | 'Cold-Lead' } = {};
    if (leadType === 'Lead' || leadType === 'Cold-Lead') {
      filterOptions.leadType = leadType;
    }

    console.log('Filter options:', filterOptions); // Debugging log

    // Pass the filterOptions to LeadsAPI.getLeads()
    const leads = await LeadsAPI.getLeads(filterOptions);
    console.log('Fetched leads:', leads); // Debugging log

    return NextResponse.json(leads);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const leadData = await request.json();
    const newLead = await LeadsAPI.createLead(leadData);
    return NextResponse.json(newLead, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}
