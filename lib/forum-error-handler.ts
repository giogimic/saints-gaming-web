import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export class ForumError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ForumError';
  }
}

export function handleForumError(error: unknown) {
  console.error('[FORUM_ERROR]', error);

  if (error instanceof ForumError) {
    return new NextResponse(error.message, { status: error.statusCode });
  }

  if (error instanceof ZodError) {
    return new NextResponse('Invalid input data', {
      status: 422,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return new NextResponse('A record with this value already exists', {
        status: 409,
      });
    }

    // Handle record not found
    if (error.code === 'P2025') {
      return new NextResponse('Record not found', {
        status: 404,
      });
    }

    // Handle foreign key constraint violations
    if (error.code === 'P2003') {
      return new NextResponse('Referenced record does not exist', {
        status: 400,
      });
    }
  }

  // Default error response
  return new NextResponse('Internal server error', {
    status: 500,
  });
}

export function validateThreadInput(data: unknown) {
  if (!data || typeof data !== 'object') {
    throw new ForumError('Invalid input data', 400);
  }

  const { title, content, categoryId } = data as any;

  if (!title || typeof title !== 'string' || title.length > 200) {
    throw new ForumError('Invalid title', 400);
  }

  if (!content || typeof content !== 'string') {
    throw new ForumError('Invalid content', 400);
  }

  if (!categoryId || typeof categoryId !== 'string') {
    throw new ForumError('Invalid category ID', 400);
  }

  return { title, content, categoryId };
}

export function validatePostInput(data: unknown) {
  if (!data || typeof data !== 'object') {
    throw new ForumError('Invalid input data', 400);
  }

  const { content, threadId } = data as any;

  if (!content || typeof content !== 'string') {
    throw new ForumError('Invalid content', 400);
  }

  if (!threadId || typeof threadId !== 'string') {
    throw new ForumError('Invalid thread ID', 400);
  }

  return { content, threadId };
}

export function validateCommentInput(data: unknown) {
  if (!data || typeof data !== 'object') {
    throw new ForumError('Invalid input data', 400);
  }

  const { content, postId } = data as any;

  if (!content || typeof content !== 'string' || content.length > 1000) {
    throw new ForumError('Invalid content', 400);
  }

  if (!postId || typeof postId !== 'string') {
    throw new ForumError('Invalid post ID', 400);
  }

  return { content, postId };
} 