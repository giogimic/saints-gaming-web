import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { ThreadDetail } from '@/components/forum/thread-detail';
import { notFound } from 'next/navigation';

interface ThreadPageProps {
  params: {
    categorySlug: string;
    threadSlug: string;
  };
}

async function getThread(categorySlug: string, threadSlug: string) {
  const thread = await prisma.thread.findFirst({
    where: {
      slug: threadSlug,
      category: {
        slug: categorySlug,
      },
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          image: true,
        },
      },
      posts: {
        include: {
          author: {
            select: {
              id: true,
              username: true,
              image: true,
            },
          },
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  image: true,
                },
              },
            },
            orderBy: {
              createdAt: 'asc',
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
    return null;
  }

  // Increment view count
  await prisma.thread.update({
    where: { id: thread.id },
    data: { viewCount: { increment: 1 } },
  });

  return thread;
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const thread = await getThread(params.categorySlug, params.threadSlug);

  if (!thread) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading thread...</div>}>
        <ThreadDetail
          thread={{
            id: thread.id,
            title: thread.title,
            content: thread.content,
            createdAt: thread.createdAt,
            author: {
              id: thread.author.id,
              username: thread.author.username || 'Anonymous',
              avatarUrl: thread.author.image || undefined,
            },
            tags: [], // TODO: Add tags support
          }}
          comments={thread.posts.map((post) => ({
            id: post.id,
            content: post.content,
            createdAt: post.createdAt,
            author: {
              id: post.author.id,
              username: post.author.username || 'Anonymous',
              avatarUrl: post.author.image || undefined,
            },
            likes: 0, // TODO: Add likes support
            replies: post.comments.map((comment) => ({
              id: comment.id,
              content: comment.content,
              createdAt: comment.createdAt,
              author: {
                id: comment.author.id,
                username: comment.author.username || 'Anonymous',
                avatarUrl: comment.author.image || undefined,
              },
              likes: 0,
              replies: [],
            })),
          }))}
        />
      </Suspense>
    </div>
  );
} 