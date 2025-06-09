import { formatDistanceToNow } from 'date-fns';
import { MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Post } from '@prisma/client';

interface PostListProps {
  posts: (Post & {
    author: {
      id: string;
      name: string | null;
      image: string | null;
    };
    comments: Array<{
      id: string;
      content: string;
      createdAt: Date;
      author: {
        id: string;
        name: string | null;
        image: string | null;
      };
    }>;
  })[];
}

export function PostList({ posts }: PostListProps) {
  return (
    <div className="space-y-6 mt-8">
      {posts.map((post) => (
        <div key={post.id} className="bg-card rounded-lg shadow-sm p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.image || undefined} />
              <AvatarFallback>
                {post.author.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{post.author.name}</span>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <div className="prose prose-sm max-w-none">
                {post.content}
              </div>
            </div>
          </div>

          {post.comments.length > 0 && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span>{post.comments.length} comments</span>
              </div>
              {post.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="ml-14 bg-muted/50 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author.image || undefined} />
                      <AvatarFallback>
                        {comment.author.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {comment.author.name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <div className="prose prose-sm max-w-none">
                        {comment.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 