import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const threadSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  categoryId: z.string(),
});

// Mock data - replace with actual database queries
const threads = [
  {
    id: '1',
    title: 'Welcome to Saints Gaming!',
    content: 'Welcome to our community forum. Feel free to introduce yourself!',
    author: {
      id: '1',
      name: 'Admin',
      avatar: '/saintsgaming-logo.png'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    categoryId: '1',
    posts: 5,
    views: 100
  },
  {
    id: '2',
    title: 'Server Rules and Guidelines',
    content: 'Please read our server rules before joining.',
    author: {
      id: '1',
      name: 'Admin',
      avatar: '/saintsgaming-logo.png'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    categoryId: '1',
    posts: 2,
    views: 50
  }
];

export async function GET() {
  try {
    const threads = await prisma.thread.findMany({
      include: {
        author: {
          select: { id: true, name: true, avatar: true }
        },
        category: {
          select: { id: true, name: true }
        },
        posts: {
          select: { id: true }
        }
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Transform the data to include post count
    const threadsWithCounts = threads.map(thread => ({
      ...thread,
      posts: thread.posts.length,
      views: thread.views
    }));

    return NextResponse.json(threadsWithCounts);
  } catch (error) {
    console.error('[THREADS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const result = threadSchema.safeParse(body);

    if (!result.success) {
      return new NextResponse('Invalid input', { status: 400 });
    }

    const { title, content, categoryId } = result.data;

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return new NextResponse('Category not found', { status: 404 });
    }

    const thread = await prisma.thread.create({
      data: {
        title,
        content,
        authorId: session.user.id,
        categoryId,
        views: 0
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true }
        },
        category: {
          select: { id: true, name: true }
        }
      }
    });

    return NextResponse.json(thread);
  } catch (error) {
    console.error('Error creating thread:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 