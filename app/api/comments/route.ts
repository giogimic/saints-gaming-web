import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, requireAuth, requireRole } from '@/lib/api-utils';
import { z } from 'zod';

const commentSchema = z.object({
  content: z.string().min(1),
  postId: z.string(),
});

const updateCommentSchema = commentSchema.extend({
  id: z.string(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    if (!postId) {
      throw new Error('Post ID is required');
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { postId },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      prisma.comment.count({ where: { postId } }),
    ]);

    return NextResponse.json({
      comments,
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
    const validatedData = commentSchema.parse(data);

    // Check if post exists and thread is not locked
    const post = await prisma.post.findUnique({
      where: { id: validatedData.postId },
      include: { thread: true },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    if (post.thread?.isLocked) {
      await requireRole(['admin', 'moderator']);
    }

    const comment = await prisma.comment.create({
      data: {
        content: validatedData.content,
        postId: validatedData.postId,
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

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth();
    const data = await req.json();
    const { id, ...updateData } = updateCommentSchema.parse(data);

    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.authorId !== session.user.id) {
      await requireRole(['admin', 'moderator']);
    }

    const updatedComment = await prisma.comment.update({
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

    return NextResponse.json(updatedComment);
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
      throw new Error('Comment ID is required');
    }

    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.authorId !== session.user.id) {
      await requireRole(['admin', 'moderator']);
    }

    await prisma.comment.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
} 