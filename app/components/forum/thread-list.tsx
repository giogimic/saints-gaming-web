"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MessageSquare, ThumbsUp, Share2 } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface Thread {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  _count: {
    posts: number;
  };
  views: number;
  isPinned: boolean;
  isLocked: boolean;
}

interface ThreadListProps {
  categoryId?: string;
}

export function ThreadList({ categoryId }: ThreadListProps) {
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchThreads();
  }, [categoryId, sortBy]);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const url = categoryId
        ? `/api/forum/threads?categoryId=${categoryId}&sort=${sortBy}`
        : `/api/forum/threads?sort=${sortBy}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch threads');
      }
      const data = await response.json();
      setThreads(data);
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Threads</h2>
        <div className="flex items-center gap-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="mostViews">Most Views</SelectItem>
              <SelectItem value="mostPosts">Most Posts</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => router.push('/forum/create')}>New Thread</Button>
        </div>
      </div>

      <div className="space-y-4">
        {threads.map((thread) => (
          <Card key={thread.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    <Link href={`/forum/thread/${thread.id}`} className="hover:text-[var(--primary)]">
                      {thread.title}
                    </Link>
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm text-[var(--text-secondary)]">
                    <span>Posted by {thread.author.name}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}</span>
                    <span>•</span>
                    <span>{thread.views} views</span>
                    <span>•</span>
                    <span>{thread._count.posts} {thread._count.posts === 1 ? 'post' : 'posts'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-[var(--text-secondary)]">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Like
                  </Button>
                  <Button variant="ghost" size="sm" className="text-[var(--text-secondary)]">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}

        {!loading && threads.length === 0 && (
          <div className="text-center py-8">
            <p className="text-[var(--text-secondary)]">No threads found.</p>
          </div>
        )}
      </div>
    </div>
  );
} 