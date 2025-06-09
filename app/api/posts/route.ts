import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, requireAuth, requireRole } from '@/lib/api-utils';
import { z } from 'zod';

const postSchema = z.object({
  content: z.string().min(1),
  threadId: z.string(),
});

const updatePostSchema = postSchema.extend({
  id: z.string(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const threadId = searchParams.get('threadId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    if (!threadId) {
      throw new Error('Thread ID is required');
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
          },
        },
        orderBy: { createdAt: 'asc' },
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
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const data = await req.json();
    const validatedData = postSchema.parse(data);

    // Check if thread exists and is not locked
    const thread = await prisma.thread.findUnique({
      where: { id: validatedData.threadId },
      select: { isLocked: true },
    });

    if (!thread) {
      throw new Error('Thread not found');
    }

    if (thread.isLocked) {
      await requireRole(['admin', 'moderator']);
    }

    const post = await prisma.post.create({
      data: {
        content: validatedData.content,
        threadId: validatedData.threadId,
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

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth();
    const data = await req.json();
    const { id, ...updateData } = updatePostSchema.parse(data);

    const post = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    if (post.authorId !== session.user.id) {
      await requireRole(['admin', 'moderator']);
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        content: updateData.content,
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

    return NextResponse.json(updatedPost);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      throw new Error('Post ID is required');
    }

    const post = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    if (post.authorId !== session.user.id) {
      await requireRole(['admin', 'moderator']);
    }

    await prisma.post.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
} 