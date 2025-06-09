import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth-config';
import { getServerSession } from 'next-auth';
import type { UserSession } from "@/lib/auth";
import { UserRole } from '@prisma/client';
import { prisma } from './prisma';

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

export async function getCategories() {
  return prisma.category.findMany({
    include: {
      _count: {
        select: {
          threads: true
        }
      }
    },
    orderBy: {
      order: 'asc'
    }
  });
}

export async function getRecentActivity() {
  const [recentThreads, recentPosts] = await Promise.all([
    prisma.thread.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    }),
    prisma.post.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        },
        thread: {
          select: {
            id: true,
            title: true,
            slug: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      }
    })
  ]);

  return {
    recentThreads,
    recentPosts
  };
} 