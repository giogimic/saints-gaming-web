import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch recent threads and posts, combine and sort by createdAt
    const threads = await prisma.thread.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, avatar: true } }
      }
    });
    const posts = await prisma.post.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        thread: { select: { id: true, title: true } }
      }
    });
    const activity = [
      ...threads.map(t => ({
        id: t.id,
        type: 'thread',
        content: `New thread: ${t.title}`,
        createdAt: t.createdAt,
        user: t.author
      })),
      ...posts.map(p => ({
        id: p.id,
        type: 'reply',
        content: `Reply in: ${p.thread?.title || 'a thread'}`,
        createdAt: p.createdAt,
        user: p.author
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);
    return NextResponse.json(activity);
  } catch (error) {
    console.error('[ACTIVITY_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 