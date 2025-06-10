import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { UserRole } from '@/lib/permissions';
import prisma from '@/lib/prisma';
import { Session } from 'next-auth';

interface UserSession extends Session {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: UserRole;
  };
}

interface ActivityLog {
  type: string;
  description: string;
  createdAt: Date;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as UserSession;
    
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Fetch statistics from the database
    const [totalUsers, totalPosts, totalCategories, recentActivity] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.category.count(),
      prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          type: true,
          description: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalPosts,
      totalCategories,
      recentActivity: recentActivity.map((activity: ActivityLog) => ({
        type: activity.type,
        description: activity.description,
        timestamp: activity.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 