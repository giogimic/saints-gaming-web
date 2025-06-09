import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Eye } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Thread } from '@prisma/client';

interface ThreadContentProps {
  thread: Thread & {
    author: {
      id: string;
      name: string | null;
      image: string | null;
    };
    category: {
      name: string;
      slug: string;
    };
    _count?: {
      posts: number;
    };
  };
}

export function ThreadContent({ thread }: ThreadContentProps) {
  return (
    <div className="bg-card rounded-lg shadow-sm p-6">
      <div className="flex items-start gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={thread.author.image || undefined} />
          <AvatarFallback>
            {thread.author.name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{thread.title}</h1>
            {thread.isPinned && (
              <Badge variant="secondary">Pinned</Badge>
            )}
            {thread.isLocked && (
              <Badge variant="destructive">Locked</Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Posted by {thread.author.name}</span>
            <span>•</span>
            <span>
              {formatDistanceToNow(new Date(thread.createdAt), {
                addSuffix: true,
              })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {thread._count?.posts || 0} posts
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {thread.viewCount} views
            </span>
          </div>
        </div>
      </div>
      <div className="mt-6 prose prose-sm max-w-none">
        {thread.content}
      </div>
    </div>
  );
} 