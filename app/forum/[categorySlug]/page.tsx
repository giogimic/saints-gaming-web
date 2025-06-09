import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { ThreadList } from '@/components/forum/thread-list';
import { notFound } from 'next/navigation';

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
  return await prisma.category.findUnique({
    where: { slug },
  });
}

async function getThreads(categoryId: string, page: number, sortBy: string) {
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const orderBy = {
    latest: { updatedAt: 'desc' },
    created: { createdAt: 'desc' },
    replies: { posts: { _count: 'desc' } },
  }[sortBy] || { updatedAt: 'desc' };

  const [threads, total] = await Promise.all([
    prisma.thread.findMany({
      where: { categoryId },
      orderBy,
      skip,
      take: pageSize,
      include: {
        author: {
          select: {
            username: true,
          },
        },
        _count: {
          select: { posts: true },
        },
      },
    }),
    prisma.thread.count({
      where: { categoryId },
    }),
  ]);

  return {
    threads,
    totalPages: Math.ceil(total / pageSize),
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const category = await getCategory(params.categorySlug);
  
  if (!category) {
    notFound();
  }

  const page = Number(searchParams.page) || 1;
  const sortBy = searchParams.sort || 'latest';
  
  const { threads, totalPages } = await getThreads(category.id, page, sortBy);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">{category.name}</h1>
      </div>

      <Suspense fallback={<div>Loading threads...</div>}>
        <ThreadList
          threads={threads}
          currentPage={page}
          totalPages={totalPages}
          categorySlug={params.categorySlug}
          sortBy={sortBy}
        />
      </Suspense>
    </div>
  );
} 