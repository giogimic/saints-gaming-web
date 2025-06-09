import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface RecentActivityProps {
  recentThreads: Array<{
    id: string;
    title: string;
    slug: string;
    content: string;
    createdAt: Date;
    author: {
      id: string;
      name: string | null;
    };
    category: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
  recentPosts: Array<{
    id: string;
    content: string;
    createdAt: Date;
    author: {
      id: string;
      name: string | null;
    };
    thread: {
      id: string;
      title: string;
      slug: string;
      category: {
        id: string;
        name: string;
        slug: string;
      };
    };
  }>;
}

export function RecentActivity({ recentThreads, recentPosts }: RecentActivityProps) {
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

  return (
    <div className="space-y-4">
      {activity.map((item) => (
        <div key={item.id} className="border-b pb-4 last:border-0">
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <Link
                href={`/forum/${item.category.slug}/${item.thread.slug}`}
                className="text-sm font-medium hover:text-blue-600 truncate"
              >
                {item.title}
              </Link>
              <p className="text-sm text-gray-500 truncate">
                {item.content}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <span>
                  {item.author.name || 'Anonymous'} in{' '}
                  <Link
                    href={`/forum/${item.category.slug}`}
                    className="hover:text-blue-600"
                  >
                    {item.category.name}
                  </Link>
                </span>
                <span>•</span>
                <span>{formatDistanceToNow(item.createdAt, { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 