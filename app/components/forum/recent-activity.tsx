import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Clock, User } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'thread' | 'post';
  title: string;
  content: string;
  createdAt: Date;
  author: {
    username: string;
  };
  category: {
    slug: string;
  };
  thread?: {
    slug: string;
  };
}

interface RecentActivityProps {
  items: ActivityItem[];
}

export function RecentActivity({ items }: RecentActivityProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Recent Activity</h2>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="card-body p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link
                    href={
                      item.type === 'thread'
                        ? `/forum/${item.category.slug}/${item.thread?.slug}`
                        : `/forum/${item.category.slug}/${item.thread?.slug}#post-${item.id}`
                    }
                    className="hover:text-primary"
                  >
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                  </Link>
                  <div className="flex items-center gap-4 mt-2 text-sm text-base-content/70">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{item.author.username}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{item.type === 'thread' ? 'New Thread' : 'New Post'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDistanceToNow(item.createdAt, { addSuffix: true })}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-base-content/70 line-clamp-2">{item.content}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 