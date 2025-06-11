import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleForumError, ForumError } from '@/lib/forum-error-handler';
import { UserRole } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new ForumError('Unauthorized', 401);
    }

    // Check if user has admin or moderator permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== UserRole.admin && user?.role !== UserRole.moderator) {
      throw new ForumError('Not authorized to lock threads', 403);
    }

    const data = await request.json();
    const { threadId, isLocked } = data;

    if (!threadId || typeof threadId !== 'string') {
      throw new ForumError('Invalid thread ID', 400);
    }

    if (typeof isLocked !== 'boolean') {
      throw new ForumError('Invalid lock status', 400);
    }

    // Check if thread exists
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
    });

    if (!thread) {
      throw new ForumError('Thread not found', 404);
    }

    // Update thread lock status
    const updatedThread = await prisma.thread.update({
      where: { id: threadId },
      data: {
        isLocked,
      },
    });

    return NextResponse.json(updatedThread);
  } catch (error) {
    return handleForumError(error);
  }
} 