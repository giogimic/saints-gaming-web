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
      throw new ForumError('Not authorized to delete threads', 403);
    }

    const data = await request.json();
    const { threadId } = data;

    if (!threadId || typeof threadId !== 'string') {
      throw new ForumError('Invalid thread ID', 400);
    }

    // Check if thread exists
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: {
        author: true,
      },
    });

    if (!thread) {
      throw new ForumError('Thread not found', 404);
    }

    // Delete thread and all associated posts
    await prisma.$transaction([
      prisma.post.deleteMany({
        where: { threadId },
      }),
      prisma.thread.delete({
        where: { id: threadId },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleForumError(error);
  }
} 