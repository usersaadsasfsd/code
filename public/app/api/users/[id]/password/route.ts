import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { UsersAPI } from '@/lib/api/users';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Verify admin access
function verifyAdminAccess(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Authentication required');
  }

  const token = authHeader.substring(7);
  const decoded = jwt.verify(token, JWT_SECRET) as any;
  
  if (decoded.role !== 'admin') {
    throw new Error('Admin access required');
  }
  
  return decoded;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = verifyAdminAccess(request);
    
    const { newPassword } = await request.json();
    
    if (!newPassword || newPassword.trim().length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Update user password
    const result = await UsersAPI.updateUser(params.id, { password: newPassword });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Change password error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Authentication required')) {
        return NextResponse.json({ message: error.message }, { status: 401 });
      }
      if (error.message.includes('Admin access required')) {
        return NextResponse.json({ message: error.message }, { status: 403 });
      }
      if (error.message.includes('not found')) {
        return NextResponse.json({ message: error.message }, { status: 404 });
      }
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
