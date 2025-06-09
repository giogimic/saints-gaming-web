import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { hasPermission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!hasPermission(session.user.role, 'manage:content')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const thread = await prisma.thread.findUnique({
      where: { id: params.id },
    });

    if (!thread) {
      return new NextResponse('Thread not found', { status: 404 });
    }

    const updatedThread = await prisma.thread.update({
      where: { id: params.id },
      data: {
        isLocked: !thread.isLocked,
      },
      include: {
        category: {
          select: {
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(updatedThread);
  } catch (error) {
    console.error('Error toggling thread lock:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 