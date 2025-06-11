import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleForumError, ForumError } from '@/lib/forum-error-handler';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('threadId');

    if (!threadId) {
      throw new ForumError('Thread ID is required', 400);
    }

    const tags = await prisma.tag.findMany({
      where: {
        threads: {
          some: {
            id: threadId,
          },
        },
      },
    });

    return NextResponse.json(tags);
  } catch (error) {
    return handleForumError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new ForumError('Unauthorized', 401);
    }

    const data = await request.json();
    const { threadId, tagIds } = data;

    if (!threadId || typeof threadId !== 'string') {
      throw new ForumError('Invalid thread ID', 400);
    }

    if (!Array.isArray(tagIds) || !tagIds.every(id => typeof id === 'string')) {
      throw new ForumError('Invalid tag IDs', 400);
    }

    // Check if thread exists and user has permission to modify it
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: { author: true },
    });

    if (!thread) {
      throw new ForumError('Thread not found', 404);
    }

    if (thread.authorId !== session.user.id) {
      throw new ForumError('Not authorized to modify this thread', 403);
    }

    // Check if all tags exist
    const existingTags = await prisma.tag.findMany({
      where: {
        id: {
          in: tagIds,
        },
      },
    });

    if (existingTags.length !== tagIds.length) {
      throw new ForumError('One or more tags not found', 404);
    }

    // Update thread tags
    await prisma.thread.update({
      where: { id: threadId },
      data: {
        tags: {
          set: tagIds.map(id => ({ id })),
        },
      },
    });

    return NextResponse.json(existingTags);
  } catch (error) {
    return handleForumError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new ForumError('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('threadId');
    const tagId = searchParams.get('tagId');

    if (!threadId) {
      throw new ForumError('Thread ID is required', 400);
    }

    if (!tagId) {
      throw new ForumError('Tag ID is required', 400);
    }

    // Check if thread exists and user has permission to modify it
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: { author: true },
    });

    if (!thread) {
      throw new ForumError('Thread not found', 404);
    }

    if (thread.authorId !== session.user.id) {
      throw new ForumError('Not authorized to modify this thread', 403);
    }

    // Check if tag exists
    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      throw new ForumError('Tag not found', 404);
    }

    // Remove tag from thread
    await prisma.thread.update({
      where: { id: threadId },
      data: {
        tags: {
          disconnect: {
            id: tagId,
          },
        },
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleForumError(error);
  }
} 