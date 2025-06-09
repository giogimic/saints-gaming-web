import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { saveUser } from '@/lib/storage';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Generate verification token
    const verificationToken = crypto.randomUUID();

    // Save user with verification token
    const user = await saveUser({
      id: crypto.randomUUID(),
      email,
      password: hashedPassword,
      name: email.split('@')[0], // Use email username as initial name
      role: 'user',
      emailVerified: false,
      verificationToken,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json(
      { message: 'Registration successful' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Registration failed' },
      { status: 500 }
    );
  }
} 