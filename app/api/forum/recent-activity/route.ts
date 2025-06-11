import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleForumError, ForumError } from '@/lib/forum-error-handler';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    if (isNaN(limit) || limit < 1 || limit > 50) {
      throw new ForumError('Invalid limit parameter', 400);
    }

    const [recentThreads, recentPosts] = await Promise.all([
      prisma.thread.findMany({
        take: limit,
      orderBy: {
          lastPostAt: 'desc',
      },
      include: {
        author: {
          select: {
              id: true,
            name: true,
              image: true,
            },
        },
        category: {
          select: {
              id: true,
            name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.post.findMany({
        take: limit,
      orderBy: {
          createdAt: 'desc',
      },
      include: {
        author: {
          select: {
              id: true,
            name: true,
              image: true,
            },
        },
        thread: {
          select: {
            id: true,
            title: true,
              slug: true,
            category: {
              select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // Combine and sort activities
    const activities = [
      ...recentThreads.map(thread => ({
        type: 'thread' as const,
        id: thread.id,
        title: thread.title,
        slug: thread.slug,
        createdAt: thread.createdAt,
        author: thread.author || {
          id: 'deleted',
          name: 'Anonymous',
          image: '/default-avatar.png',
        },
        category: thread.category || {
          id: 'deleted',
          name: 'Uncategorized',
          slug: 'uncategorized',
        },
      })),
      ...recentPosts.map(post => ({
        type: 'post' as const,
        id: post.id,
        content: post.content,
        createdAt: post.createdAt,
        author: post.author || {
          id: 'deleted',
          name: 'Anonymous',
          image: '/default-avatar.png',
        },
        thread: post.thread || {
          id: 'deleted',
          title: 'Deleted Thread',
          slug: 'deleted',
          category: {
            id: 'deleted',
            name: 'Uncategorized',
            slug: 'uncategorized',
          },
        },
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);

    return NextResponse.json(activities);
  } catch (error) {
    return handleForumError(error);
  }
} 