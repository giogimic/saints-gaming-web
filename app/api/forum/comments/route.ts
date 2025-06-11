import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleForumError, validateCommentInput, ForumError } from '@/lib/forum-error-handler';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    if (!postId) {
      throw new ForumError('Post ID is required', 400);
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
        orderBy: {
          createdAt: 'asc',
        },
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
    const { content, postId } = validateCommentInput(data);

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        thread: {
          select: {
            isLocked: true,
          },
        },
      },
    });

    if (!post) {
      throw new ForumError('Post not found', 404);
    }

    if (post.thread.isLocked) {
      throw new ForumError('Thread is locked', 403);
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: session.user.id,
        postId,
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

    // Update thread's lastPostAt
    await prisma.thread.update({
      where: { id: post.threadId },
      data: { lastPostAt: new Date() },
    });

    return NextResponse.json(comment);
  } catch (error) {
    return handleForumError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new ForumError('Unauthorized', 401);
    }

    const data = await request.json();
    const { id, content } = data;

    if (!id) {
      throw new ForumError('Comment ID is required', 400);
    }

    const comment = await prisma.comment.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!comment) {
      throw new ForumError('Comment not found', 404);
    }

    if (comment.authorId !== session.user.id) {
      throw new ForumError('Not authorized to edit this comment', 403);
    }

    const updatedComment = await prisma.comment.update({
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

    return NextResponse.json(updatedComment);
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
    const id = searchParams.get('id');

    if (!id) {
      throw new ForumError('Comment ID is required', 400);
    }

    const comment = await prisma.comment.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!comment) {
      throw new ForumError('Comment not found', 404);
    }

    if (comment.authorId !== session.user.id) {
      throw new ForumError('Not authorized to delete this comment', 403);
    }

    await prisma.comment.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleForumError(error);
  }
} 