import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { hasPermission } from '@/lib/permissions';
import { UserRole } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { slugify } from '@/lib/utils';

const threadSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  categoryId: z.string(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort = searchParams.get('sort') || 'newest';

    const where = categoryId ? { categoryId } : {};
    const orderBy = {
      ...(sort === 'newest' && { createdAt: 'desc' }),
      ...(sort === 'mostReplied' && { posts: { _count: 'desc' } }),
      ...(sort === 'mostViewed' && { viewCount: 'desc' }),
    };

    const [threads, total] = await Promise.all([
      prisma.thread.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
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
    console.error('Error fetching threads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch threads' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { title, content, categoryId } = await req.json();

    if (!title || !content || !categoryId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return new NextResponse('Category not found', { status: 404 });
    }

    const slug = slugify(title);
    const existingThread = await prisma.thread.findFirst({
      where: {
        categoryId,
        slug,
      },
    });

    if (existingThread) {
      return new NextResponse('A thread with this title already exists', { status: 409 });
    }

    const thread = await prisma.thread.create({
      data: {
        title,
        content,
        slug,
        authorId: session.user.id,
        categoryId,
      },
      include: {
        category: {
          select: {
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(thread);
  } catch (error) {
    console.error('Error creating thread:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 