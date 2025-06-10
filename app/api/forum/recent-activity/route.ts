import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const recentThreads = await prisma.thread.findMany({
      take: 5,
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        author: {
          select: {
            name: true,
            image: true
          }
        },
        category: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    });

    const recentPosts = await prisma.post.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        author: {
          select: {
            name: true,
            image: true
          }
        },
        thread: {
          select: {
            id: true,
            title: true,
            category: {
              select: {
                slug: true
              }
            }
          }
        }
      }
    });

    // Combine and sort activities
    const activities = [
      ...recentThreads.map(thread => ({
        id: `thread-${thread.id}`,
        type: 'thread',
        title: thread.title,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
        author: thread.author,
        category: thread.category,
        url: `/forum/${thread.category.slug}/${thread.id}`
      })),
      ...recentPosts.map(post => ({
        id: `post-${post.id}`,
        type: 'post',
        content: post.content,
        createdAt: post.createdAt,
        author: post.author,
        thread: post.thread,
        url: `/forum/${post.thread.category.slug}/${post.thread.id}#post-${post.id}`
      }))
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10);

    return NextResponse.json(activities);
  } catch (error) {
    console.error("[RECENT_ACTIVITY_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 