import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserRole } from '@prisma/client';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: unknown) => {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  console.error('Unhandled API error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
};

export const requireAuth = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new ApiError(401, 'Unauthorized');
  }
  return session;
};

export const requireRole = async (allowedRoles: UserRole[]) => {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.user.role as UserRole)) {
    throw new ApiError(403, 'Forbidden');
  }
  return session;
};

export const validateInput = (data: unknown, schema: any) => {
  try {
    return schema.parse(data);
  } catch (error) {
    throw new ApiError(400, 'Invalid input data');
  }
}; 