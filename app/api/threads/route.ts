import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, requireAuth, requireRole } from '@/lib/api-utils';
import { z } from 'zod';

const threadSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  categoryId: z.string(),
  isPinned: z.boolean().optional(),
  isLocked: z.boolean().optional(),
});

const updateThreadSchema = threadSchema.extend({
  id: z.string(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where = categoryId ? { categoryId } : {};
    
    const [threads, total] = await Promise.all([
      prisma.thread.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          category: true,
          _count: {
            select: { posts: true },
          },
        },
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.thread.count({ where }),
    ]);

    return NextResponse.json({
      threads,
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
    const validatedData = threadSchema.parse(data);

    const thread = await prisma.thread.create({
      data: {
        ...validatedData,
        authorId: session.user.id,
        slug: validatedData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        category: true,
      },
    });

    return NextResponse.json(thread, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth();
    const data = await req.json();
    const { id, ...updateData } = updateThreadSchema.parse(data);

    const thread = await prisma.thread.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!thread) {
      throw new Error('Thread not found');
    }

    if (thread.authorId !== session.user.id) {
      await requireRole(['admin', 'moderator']);
    }

    const updatedThread = await prisma.thread.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        category: true,
      },
    });

    return NextResponse.json(updatedThread);
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
      throw new Error('Thread ID is required');
    }

    const thread = await prisma.thread.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!thread) {
      throw new Error('Thread not found');
    }

    if (thread.authorId !== session.user.id) {
      await requireRole(['admin', 'moderator']);
    }

    await prisma.thread.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
} 