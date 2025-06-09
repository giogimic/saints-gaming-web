import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { getUserByEmail, updateUser } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, name, newPassword } = await req.json();

    if (!email || !name || !newPassword) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user and verify name matches
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email' },
        { status: 404 }
      );
    }

    if (user.name !== name) {
      return NextResponse.json(
        { error: 'Name does not match account' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10);

    // Update user's password
    await updateUser({
      ...user,
      password: hashedPassword,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
} 