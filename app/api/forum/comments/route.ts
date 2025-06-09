import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-config';
import { checkPermission } from '@/lib/permissions';

const commentSchema = z.object({
  content: z.string().min(1).max(1000),
  postId: z.string(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const json = await req.json();
    const body = commentSchema.parse(json);

    const post = await prisma.post.findUnique({
      where: { id: body.postId },
      select: {
        thread: {
          select: { isLocked: true },
        },
      },
    });

    if (!post) {
      return new NextResponse('Post not found', { status: 404 });
    }

    if (post.thread.isLocked) {
      return new NextResponse('Thread is locked', { status: 403 });
    }

    const comment = await prisma.comment.create({
      data: {
        content: body.content,
        postId: body.postId,
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

    return NextResponse.json(comment);
  } catch (error) {
    console.error('[COMMENTS_POST]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 422 });
    }
    return new NextResponse('Internal error', { status: 500 });
  }
}

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
        content: z.string().min(1).max(1000),
      })
      .parse(json);

    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!comment) {
      return new NextResponse('Comment not found', { status: 404 });
    }

    if (comment.authorId !== session.user.id) {
      const hasPermission = await checkPermission(session.user.id, 'edit:comments');
      if (!hasPermission) {
        return new NextResponse('Forbidden', { status: 403 });
      }
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
    console.error('[COMMENTS_PATCH]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 422 });
    }
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse('Comment ID is required', { status: 400 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!comment) {
      return new NextResponse('Comment not found', { status: 404 });
    }

    if (comment.authorId !== session.user.id) {
      const hasPermission = await checkPermission(session.user.id, 'delete:comments');
      if (!hasPermission) {
        return new NextResponse('Forbidden', { status: 403 });
      }
    }

    await prisma.comment.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[COMMENTS_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 