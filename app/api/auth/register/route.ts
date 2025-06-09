import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { saveUser } from '@/lib/storage';
import { sendVerificationEmail } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';
import { getUsers } from '@/lib/storage';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new user with admin role for the first user
    const users = await getUsers();
    const isFirstUser = users.length === 0;

    const user = await saveUser({
      id: uuidv4(),
      name,
      email,
      password,
      role: isFirstUser ? 'admin' : 'member',
      emailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      bio: '',
      gamingUrls: {
        steam: '',
        discord: '',
        twitch: ''
      }
    });

    return NextResponse.json(
      { message: 'User registered successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Failed to register user' },
      { status: 500 }
    );
  }
} 