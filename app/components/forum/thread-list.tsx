import { MessageSquare, Clock, User, Tag, Pin, Lock } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Thread } from '@prisma/client';

interface ThreadListProps {
  threads: (Thread & {
    author: {
      name: string | null;
      image: string | null;
    };
    _count: {
      posts: number;
    };
  })[];
  currentPage: number;
  totalPages: number;
  categorySlug: string;
  sortBy?: string;
}

export function ThreadList({ threads, currentPage, totalPages, categorySlug, sortBy = 'latest' }: ThreadListProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Select defaultValue={sortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest Activity</SelectItem>
              <SelectItem value="created">Created Date</SelectItem>
              <SelectItem value="replies">Most Replies</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Link href={`/forum/${categorySlug}/new`}>
          <Button>New Thread</Button>
        </Link>
      </div>

      <div className="space-y-4">
        {threads.map((thread) => (
          <Link
            key={thread.id}
            href={`/forum/thread/${thread.id}`}
            className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {thread.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  Posted by {thread.author.name} • {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
                </p>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {thread._count.posts} {thread._count.posts === 1 ? 'reply' : 'replies'}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={`/forum/${categorySlug}?page=${page}${sortBy ? `&sort=${sortBy}` : ''}`}
            >
              <Button
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
              >
                {page}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 