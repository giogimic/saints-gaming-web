import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { ForumPost } from '@/lib/types';
import { getForumPosts, createForumPost, updateForumPost, deleteForumPost } from '@/lib/db';
import { hasPermission } from '@/lib/permissions';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { handleForumError, validatePostInput, ForumError } from '@/lib/forum-error-handler';

const postSchema = z.object({
  content: z.string().min(1).max(10000),
  threadId: z.string(),
});

// GET: List all posts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('threadId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    if (!threadId) {
      throw new ForumError('Thread ID is required', 400);
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { threadId },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
        skip,
        take: limit,
      }),
      prisma.post.count({ where: { threadId } }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
      },
    });
  } catch (error) {
    return handleForumError(error);
  }
}

// POST: Create a new post
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new ForumError('Unauthorized', 401);
    }

    const data = await request.json();
    const { content, threadId } = validatePostInput(data);

    // Check if thread exists and is not locked
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
    });

    if (!thread) {
      throw new ForumError('Thread not found', 404);
    }

    if (thread.isLocked) {
      throw new ForumError('Thread is locked', 403);
    }

    const post = await prisma.post.create({
      data: {
        content,
        authorId: session.user.id,
        threadId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    // Update thread's lastPostAt
    await prisma.thread.update({
      where: { id: threadId },
      data: { lastPostAt: new Date() },
    });

    return NextResponse.json(post);
  } catch (error) {
    return handleForumError(error);
  }
}

// PATCH: Update a post
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new ForumError('Unauthorized', 401);
    }

    const data = await request.json();
    const { id, content } = data;

    if (!id) {
      throw new ForumError('Post ID is required', 400);
    }

    const post = await prisma.post.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!post) {
      throw new ForumError('Post not found', 404);
    }

    if (post.authorId !== session.user.id) {
      throw new ForumError('Not authorized to edit this post', 403);
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: { content },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    return handleForumError(error);
  }
}

// DELETE: Delete a post
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new ForumError('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      throw new ForumError('Post ID is required', 400);
    }

    const post = await prisma.post.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!post) {
      throw new ForumError('Post not found', 404);
    }

    if (post.authorId !== session.user.id) {
      throw new ForumError('Not authorized to delete this post', 403);
    }

    await prisma.post.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleForumError(error);
  }
} 