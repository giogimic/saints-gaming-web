import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { MessageSquare, Users, Clock } from 'lucide-react';
import { Search } from '@/components/forum/search';
import { RecentActivity } from '@/components/forum/recent-activity';

async function getCategories() {
  return await prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: { threads: true }
      }
    }
  });
}

async function getRecentActivity() {
  const [recentThreads, recentPosts] = await Promise.all([
    prisma.thread.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            username: true,
          },
        },
        category: {
          select: {
            slug: true,
          },
        },
      },
    }),
    prisma.post.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            username: true,
          },
        },
        thread: {
          select: {
            slug: true,
            category: {
              select: {
                slug: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const activity = [
    ...recentThreads.map((thread) => ({
      id: thread.id,
      type: 'thread' as const,
      title: thread.title,
      content: thread.content,
      createdAt: thread.createdAt,
      author: thread.author,
      category: thread.category,
      thread: { slug: thread.slug },
    })),
    ...recentPosts.map((post) => ({
      id: post.id,
      type: 'post' as const,
      title: post.thread.title,
      content: post.content,
      createdAt: post.createdAt,
      author: post.author,
      category: post.thread.category,
      thread: { slug: post.thread.slug },
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
   .slice(0, 10);

  return activity;
}

export default async function ForumPage() {
  const [categories, recentActivity] = await Promise.all([
    getCategories(),
    getRecentActivity(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Forum</h1>
        <Search />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="grid gap-6">
            {categories.map((category) => (
              <div key={category.id} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="card-title text-2xl">
                        <Link href={`/forum/${category.slug}`} className="hover:text-primary">
                          {category.name}
                        </Link>
                      </h2>
                      {category.description && (
                        <p className="text-base-content/70 mt-2">{category.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-base-content/70">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{category._count.threads}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <Suspense fallback={<div>Loading recent activity...</div>}>
            <RecentActivity items={recentActivity} />
          </Suspense>
        </div>
      </div>
    </div>
  );
} 