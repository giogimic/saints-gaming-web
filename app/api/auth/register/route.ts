import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { createUser, getUserByEmail } from '@/lib/db';
import { UserRole } from '@/lib/permissions';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { email, name, password } = await req.json();

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user with default settings
    const user = await createUser({
      email,
      name,
      password: hashedPassword,
      role: UserRole.MEMBER,
      emailVerified: new Date().toISOString(),
      settings: {
        theme: 'system',
        notifications: true,
        language: 'en',
        timezone: 'UTC',
        emailNotifications: true,
        darkMode: false,
        showOnlineStatus: true
      },
      gamingProfile: {
        favoriteGames: [],
        gamingSetup: [],
        gamingPreferences: []
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
} 