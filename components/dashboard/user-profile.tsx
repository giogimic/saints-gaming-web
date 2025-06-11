'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { User as PrismaUser } from "@prisma/client";
import { cn } from "@/lib/utils";
import { MessageSquare, ThumbsUp, User as UserIcon } from "lucide-react";

interface UserProfileProps {
  user: PrismaUser & {
    threads: Array<{
      id: string;
      title: string;
      createdAt: Date;
      category: {
        name: string;
        slug: string;
      };
    }>;
    posts: Array<{
      id: string;
      content: string;
      createdAt: Date;
      thread: {
        id: string;
        title: string;
        category: {
          name: string;
          slug: string;
        };
      };
    }>;
    comments: Array<{
      id: string;
      content: string;
      createdAt: Date;
      post: {
        id: string;
        thread: {
          id: string;
          title: string;
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
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        {user.image ? (
          <img
            src={user.image}
            alt={user.name || 'User'}
            className="w-16 h-16 rounded-full"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <UserIcon className="w-8 h-8 text-gray-500 dark:text-gray-400" />
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold">{user.name}</h2>
        </div>
      </div>

      <section>
        <h3 className="text-xl font-semibold mb-4">Recent Threads</h3>
        <div className="space-y-4">
          {user.threads.map((thread) => (
            <div
              key={thread.id}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <Link
                href={`/forum/thread/${thread.id}`}
                className="text-lg font-medium hover:text-primary"
              >
                {thread.title}
              </Link>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Posted in {thread.category.name} •{' '}
                {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-4">Recent Posts</h3>
        <div className="space-y-4">
          {user.posts.map((post) => (
            <div
              key={post.id}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <p className="text-gray-900 dark:text-white">{post.content}</p>
              <div className="mt-2 flex items-center gap-4 text-sm">
                <Link
                  href={`/forum/thread/${post.thread.id}`}
                  className="text-primary hover:underline"
                >
                  {post.thread.title}
                </Link>
                <span className="text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-4">Recent Comments</h3>
        <div className="space-y-4">
          {user.comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <p className="text-gray-900 dark:text-white">{comment.content}</p>
              <div className="mt-2 flex items-center gap-4 text-sm">
                <Link
                  href={`/forum/thread/${comment.post.thread.id}`}
                  className="text-primary hover:underline"
                >
                  {comment.post.thread.title}
                </Link>
                <span className="text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
} 