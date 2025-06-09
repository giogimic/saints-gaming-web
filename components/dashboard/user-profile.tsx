import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { User } from "@prisma/client";
import { cn } from "@/lib/utils";

interface UserProfileProps {
  user: User & {
    threads: Array<{
      id: string;
      title: string;
      slug: string;
      category: {
        name: string;
        slug: string;
      };
    }>;
    posts: Array<{
      id: string;
      content: string;
      thread: {
        title: string;
        slug: string;
        category: {
          name: string;
          slug: string;
        };
      };
    }>;
    comments: Array<{
      id: string;
      content: string;
      post: {
        thread: {
          title: string;
          slug: string;
          category: {
            name: string;
            slug: string;
          };
        };
      };
    }>;
  };
  stats: {
    totalThreads: number;
    totalPosts: number;
    totalComments: number;
    joinDate: Date;
    lastActive: Date;
  };
}

export function UserProfile({ user, stats }: UserProfileProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.image || undefined} alt={user.name || ""} />
              <AvatarFallback>
                {user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{user.name}</h3>
              <div className={cn(badgeVariants({ variant: "secondary" }), "mt-1")}>
                {user.role}
              </div>
              <p className="text-sm text-muted-foreground">
                Joined {formatDistanceToNow(stats.joinDate)} ago
              </p>
            </div>
          </div>
          {user.bio && (
            <p className="text-sm text-muted-foreground">{user.bio}</p>
          )}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{stats.totalThreads}</div>
              <div className="text-xs text-muted-foreground">Threads</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.totalPosts}</div>
              <div className="text-xs text-muted-foreground">Posts</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.totalComments}</div>
              <div className="text-xs text-muted-foreground">Comments</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user.threads.map((thread) => (
            <div key={thread.id} className="flex items-start gap-2">
              <div className="flex-1">
                <Link
                  href={`/forum/${thread.category.slug}/${thread.slug}`}
                  className="text-sm font-medium hover:underline"
                >
                  {thread.title}
                </Link>
                <p className="text-xs text-muted-foreground">
                  in {thread.category.name}
                </p>
              </div>
            </div>
          ))}
          {user.posts.map((post) => (
            <div key={post.id} className="flex items-start gap-2">
              <div className="flex-1">
                <Link
                  href={`/forum/${post.thread.category.slug}/${post.thread.slug}`}
                  className="text-sm font-medium hover:underline"
                >
                  {post.thread.title}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {post.content.substring(0, 100)}
                  {post.content.length > 100 ? "..." : ""}
                </p>
              </div>
            </div>
          ))}
          {user.comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-2">
              <div className="flex-1">
                <Link
                  href={`/forum/${comment.post.thread.category.slug}/${comment.post.thread.slug}`}
                  className="text-sm font-medium hover:underline"
                >
                  {comment.post.thread.title}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {comment.content.substring(0, 100)}
                  {comment.content.length > 100 ? "..." : ""}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
} 