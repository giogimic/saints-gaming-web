import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleForumError, ForumError } from '@/lib/forum-error-handler';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { threadId } = data;

    if (!threadId || typeof threadId !== 'string') {
      throw new ForumError('Invalid thread ID', 400);
    }

    // Check if thread exists
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
    });

    if (!thread) {
      throw new ForumError('Thread not found', 404);
    }

    // Increment view count
    const updatedThread = await prisma.thread.update({
      where: { id: threadId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ viewCount: updatedThread.viewCount });
  } catch (error) {
    return handleForumError(error);
  }
} 