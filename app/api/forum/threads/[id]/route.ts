import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { hasPermission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { slugify } from '@/lib/utils';

const updateThreadSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  isPinned: z.boolean().optional(),
  isLocked: z.boolean().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const thread = await prisma.thread.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!thread) {
      return new NextResponse('Thread not found', { status: 404 });
    }

    const isAuthor = thread.author.id === session.user.id;
    const canManage = hasPermission(session.user.role, 'manage:content');

    if (!isAuthor && !canManage) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await request.json();
    const validatedData = updateThreadSchema.parse(data);

    const updateData: any = { ...validatedData };

    if (validatedData.title) {
      const slug = slugify(validatedData.title);
      const existingThread = await prisma.thread.findFirst({
        where: {
          categoryId: thread.categoryId,
          slug,
          id: { not: thread.id },
        },
      });

      if (existingThread) {
        return new NextResponse('A thread with this title already exists', { status: 409 });
      }

      updateData.slug = slug;
    }

    const updatedThread = await prisma.thread.update({
      where: { id: params.id },
      data: updateData,
      include: {
        category: {
          select: {
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(updatedThread);
  } catch (error) {
    console.error('Error updating thread:', error);
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 422 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const thread = await prisma.thread.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!thread) {
      return new NextResponse('Thread not found', { status: 404 });
    }

    const isAuthor = thread.author.id === session.user.id;
    const canManage = hasPermission(session.user.role, 'manage:content');

    if (!isAuthor && !canManage) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await prisma.thread.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting thread:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 