"use client";

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect, Suspense } from 'react';
import { hasPermission } from '@/lib/permissions';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit2, Trash2, Pin, Lock } from 'lucide-react';
import { ThreadForm } from '@/components/forum/thread-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Eye } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import prisma from '@/lib/prisma';
import { ThreadList } from '@/components/forum/thread-list';
import { notFound } from 'next/navigation';
import { NewThreadButton } from '@/components/forum/new-thread-button';

interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
}

interface Thread {
  id: string;
  title: string;
  content: string;
  slug: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  categoryId: string;
  isPinned: boolean;
  isLocked: boolean;
  isHidden: boolean;
  viewCount: number;
  lastPostAt: Date;
  _count?: {
    posts: number;
  };
  tags?: Array<{
    id: string;
    name: string;
    slug: string;
    color?: string;
    icon?: string;
  }>;
}

interface CategoryPageProps {
  params: {
    categorySlug: string;
  };
  searchParams: {
    page?: string;
    sort?: string;
  };
}

async function getCategory(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      _count: {
        select: {
          threads: true,
        },
      },
    },
  });

  if (!category) {
    return null;
  }

  return category;
}

async function getThreads(categoryId: string, page = 1, sort = 'latest') {
  const limit = 10;
  const skip = (page - 1) * limit;

  const [threads, total] = await Promise.all([
    prisma.thread.findMany({
      where: { categoryId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            posts: true,
          },
        },
      },
      orderBy: [
        { isPinned: 'desc' },
        sort === 'latest' ? { updatedAt: 'desc' } :
        sort === 'created' ? { createdAt: 'desc' } :
        { posts: { _count: 'desc' } },
      ],
      skip,
      take: limit,
    }),
    prisma.thread.count({ where: { categoryId } }),
  ]);

  return {
    threads: threads.map(thread => ({
      id: thread.id,
      title: thread.title,
      slug: thread.slug,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      isPinned: thread.isPinned,
      isLocked: thread.isLocked,
      author: {
        username: thread.author.name || 'Anonymous',
      },
      _count: {
        posts: thread._count.posts,
      },
      tags: [], // TODO: Add tags support
    })),
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      current: page,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [category, setCategory] = useState<Category | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  const canManageThreads = session?.user && hasPermission(session.user.role, 'manage:content');
  const canCreateThread = session?.user && hasPermission(session.user.role, 'create:post');

  const page = parseInt(searchParams.page || '1');
  const sort = searchParams.sort || 'latest';

  useEffect(() => {
    async function fetchCategory() {
      try {
        const response = await fetch(`/api/forum/categories/by-slug/${params.categorySlug}`);
        if (!response.ok) {
          throw new Error('Failed to fetch category');
        }
        const data = await response.json();
        setCategory(data);
      } catch (error) {
        console.error('Error fetching category:', error);
      }
    }

    async function fetchThreads() {
      try {
        const response = await fetch(`/api/forum/threads?categoryId=${category?.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch threads');
        }
        const data = await response.json();
        setThreads(data.threads);
      } catch (error) {
        console.error('Error fetching threads:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategory();
    if (category?.id) {
      fetchThreads();
    }
  }, [params.categorySlug, category?.id]);

  const handlePinThread = async (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/forum/threads/${threadId}/pin`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to pin thread');
      }

      const updatedThread = await response.json();
      setThreads((prevThreads) =>
        prevThreads.map((thread) =>
          thread.id === threadId ? { ...thread, isPinned: updatedThread.isPinned } : thread
        )
      );
      toast.success(updatedThread.isPinned ? 'Thread pinned' : 'Thread unpinned');
    } catch (error) {
      console.error('Error pinning thread:', error);
      toast.error('Failed to pin thread');
    }
  };

  const handleLockThread = async (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/forum/threads/${threadId}/lock`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to lock thread');
      }

      const updatedThread = await response.json();
      setThreads((prevThreads) =>
        prevThreads.map((thread) =>
          thread.id === threadId ? { ...thread, isLocked: updatedThread.isLocked } : thread
        )
      );
      toast.success(updatedThread.isLocked ? 'Thread locked' : 'Thread unlocked');
    } catch (error) {
      console.error('Error locking thread:', error);
      toast.error('Failed to lock thread');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Category not found</h1>
          <p className="text-muted-foreground mb-8">The category you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/forum')}>
            Return to Forum
          </Button>
        </div>
      </div>
    );
  }

  const { threads: prismaThreads, pagination } = await getThreads(category.id, page, sort);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{category.name}</h1>
          {category.description && (
            <p className="text-muted-foreground mt-2">{category.description}</p>
          )}
        </div>
        <NewThreadButton categoryId={category.id} />
      </div>

      <Suspense fallback={<div>Loading threads...</div>}>
        <ThreadList
          threads={prismaThreads}
          currentPage={pagination.current}
          totalPages={pagination.pages}
          categorySlug={params.categorySlug}
          sortBy={sort}
        />
      </Suspense>
    </div>
  );
} 