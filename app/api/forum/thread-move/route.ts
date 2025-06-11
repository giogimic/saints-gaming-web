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
      throw new ForumError('Not authorized to move threads', 403);
    }

    const data = await request.json();
    const { threadId, categoryId } = data;

    if (!threadId || typeof threadId !== 'string') {
      throw new ForumError('Invalid thread ID', 400);
    }

    if (!categoryId || typeof categoryId !== 'string') {
      throw new ForumError('Invalid category ID', 400);
    }

    // Check if thread exists
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
    });

    if (!thread) {
      throw new ForumError('Thread not found', 404);
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new ForumError('Category not found', 404);
    }

    // Move thread to new category
    const updatedThread = await prisma.thread.update({
      where: { id: threadId },
      data: {
        categoryId,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(updatedThread);
  } catch (error) {
    return handleForumError(error);
  }
} 