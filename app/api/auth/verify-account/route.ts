import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email' },
        { status: 404 }
      );
    }

    // Return success without exposing user data
    return NextResponse.json({ message: 'Account found' });
  } catch (error) {
    console.error('Account verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify account' },
      { status: 500 }
    );
  }
} 