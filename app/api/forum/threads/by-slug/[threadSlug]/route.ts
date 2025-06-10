import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { threadSlug: string } }
) {
  try {
    const thread = await prisma.thread.findUnique({
      where: {
        id: params.threadSlug,
      },
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
        category: true,
        posts: {
          include: {
            author: {
              select: {
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
    });

    if (!thread) {
      return new NextResponse('Thread not found', { status: 404 });
    }

    // Increment view count
    await prisma.thread.update({
      where: { id: thread.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json(thread);
  } catch (error) {
    console.error('Error fetching thread:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 