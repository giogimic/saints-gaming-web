import { Suspense } from 'react';
import { ThreadDetail } from '@/app/components/forum/thread-detail';
import { notFound } from 'next/navigation';

interface ThreadPageProps {
  params: {
    categorySlug: string;
    threadSlug: string;
  };
}

interface Post {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    image: string | null;
  };
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    author: {
      id: string;
      name: string;
      image: string | null;
    };
  }>;
}

interface Thread {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  isPinned: boolean;
  isLocked: boolean;
  author: {
    id: string;
    name: string;
    image: string | null;
  };
  posts: Post[];
}

async function getThread(categorySlug: string, threadSlug: string): Promise<Thread | null> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/forum/threads/by-slug/${threadSlug}?categorySlug=${categorySlug}`,
    { cache: 'no-store' }
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch thread');
  }

  return response.json();
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
            createdAt: new Date(thread.createdAt),
            isPinned: thread.isPinned,
            isLocked: thread.isLocked,
            author: {
              id: thread.author.id,
              username: thread.author.name || 'Anonymous',
              avatarUrl: thread.author.image || undefined,
            },
            tags: [], // TODO: Add tags support
          }}
          comments={thread.posts.map((post: Post) => ({
            id: post.id,
            content: post.content,
            createdAt: new Date(post.createdAt),
            author: {
              id: post.author.id,
              username: post.author.name || 'Anonymous',
              avatarUrl: post.author.image || undefined,
            },
            likes: 0, // TODO: Add likes support
            replies: post.comments.map((comment) => ({
              id: comment.id,
              content: comment.content,
              createdAt: new Date(comment.createdAt),
              author: {
                id: comment.author.id,
                username: comment.author.name || 'Anonymous',
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