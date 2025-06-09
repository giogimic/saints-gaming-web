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

const postSchema = z.object({
  content: z.string().min(1).max(10000),
  threadId: z.string(),
});

// GET: List all posts
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const threadId = searchParams.get('threadId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    if (!threadId) {
      return new NextResponse('Thread ID is required', { status: 400 });
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
      prisma.post.count({
        where: { threadId },
      }),
    ]);

    return NextResponse.json({
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('[POSTS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

// POST: Create a new post
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const json = await req.json();
    const body = postSchema.parse(json);

    const thread = await prisma.thread.findUnique({
      where: { id: body.threadId },
      select: { isLocked: true },
    });

    if (!thread) {
      return new NextResponse('Thread not found', { status: 404 });
    }

    if (thread.isLocked) {
      return new NextResponse('Thread is locked', { status: 403 });
    }

    const post = await prisma.post.create({
      data: {
        content: body.content,
        threadId: body.threadId,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('[POSTS_POST]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 422 });
    }
    return new NextResponse('Internal error', { status: 500 });
  }
}

// PATCH: Update a post
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const json = await req.json();
    const { id, content } = z
      .object({
        id: z.string(),
        content: z.string().min(1).max(10000),
      })
      .parse(json);

    const post = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!post) {
      return new NextResponse('Post not found', { status: 404 });
    }

    if (post.authorId !== session.user.id) {
      const hasPermission = await checkPermission(session.user.id, 'edit:posts');
      if (!hasPermission) {
        return new NextResponse('Forbidden', { status: 403 });
      }
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
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('[POSTS_PATCH]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 422 });
    }
    return new NextResponse('Internal error', { status: 500 });
  }
}

// DELETE: Delete a post
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse('Post ID is required', { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!post) {
      return new NextResponse('Post not found', { status: 404 });
    }

    if (post.authorId !== session.user.id) {
      const hasPermission = await checkPermission(session.user.id, 'delete:posts');
      if (!hasPermission) {
        return new NextResponse('Forbidden', { status: 403 });
      }
    }

    await prisma.post.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[POSTS_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 