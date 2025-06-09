import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { ThreadList } from '@/components/forum/thread-list';
import { Search } from '@/components/forum/search';
import { notFound } from 'next/navigation';

interface SearchPageProps {
  searchParams: {
    q?: string;
    page?: string;
    sort?: string;
  };
}

async function searchThreads(query: string, page: number, sortBy: string) {
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const orderBy = {
    latest: { updatedAt: 'desc' },
    created: { createdAt: 'desc' },
    replies: { posts: { _count: 'desc' } },
  }[sortBy] || { updatedAt: 'desc' };

  const [threads, total] = await Promise.all([
    prisma.thread.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy,
      skip,
      take: pageSize,
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
        _count: {
          select: { posts: true },
        },
      },
    }),
    prisma.thread.count({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
    }),
  ]);

  return {
    threads,
    totalPages: Math.ceil(total / pageSize),
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q;
  const page = Number(searchParams.page) || 1;
  const sortBy = searchParams.sort || 'latest';

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Search Forum</h1>
          <Search />
        </div>
      </div>
    );
  }

  const { threads, totalPages } = await searchThreads(query, page, sortBy);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Search Results</h1>
          <Search />
        </div>

        <Suspense fallback={<div>Loading results...</div>}>
          <ThreadList
            threads={threads}
            currentPage={page}
            totalPages={totalPages}
            categorySlug="search"
            sortBy={sortBy}
          />
        </Suspense>
      </div>
    </div>
  );
} 