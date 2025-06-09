import { MessageSquare, Clock, User, Tag } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Thread {
  id: string;
  title: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    username: string;
  };
  _count: {
    posts: number;
  };
  tags: string[];
}

interface ThreadListProps {
  threads: Thread[];
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

      <div className="space-y-2">
        {threads.map((thread) => (
          <div key={thread.id} className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="card-body p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link href={`/forum/${categorySlug}/${thread.slug}`} className="hover:text-primary">
                    <h3 className="text-lg font-semibold">{thread.title}</h3>
                  </Link>
                  <div className="flex items-center gap-4 mt-2 text-sm text-base-content/70">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{thread.author.username}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{thread._count.posts}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDistanceToNow(thread.updatedAt, { addSuffix: true })}</span>
                    </div>
                  </div>
                  {thread.tags.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {thread.tags.map((tag) => (
                        <span key={tag} className="badge badge-sm">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
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