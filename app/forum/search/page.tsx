"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
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
  posts: {
    _count: number;
  };
  views: number;
  isPinned: boolean;
  isLocked: boolean;
}

const sortOptions = {
  newest: { createdAt: 'desc' },
  oldest: { createdAt: 'asc' },
  mostViews: { views: 'desc' },
  mostPosts: { posts: { _count: 'desc' } },
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState('newest');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/forum/search?q=${encodeURIComponent(query)}&sort=${sortBy}`
      );
      if (!response.ok) {
        throw new Error('Failed to search threads');
      }
      const data = await response.json();
      setThreads(data);
    } catch (error) {
      console.error('Error searching threads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      handleSearch();
    }
  }, [query, sortBy]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Search Forum</h1>

        <div className="flex gap-4 mb-8">
          <Input
            type="text"
            placeholder="Search threads..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
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
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
          </div>
        ) : (
          <div className="space-y-4">
            {threads.map((thread) => (
              <Card key={thread.id}>
                <CardHeader>
                  <CardTitle>
                    <Link href={`/forum/thread/${thread.id}`} className="hover:text-[var(--primary)]">
                      {thread.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                    <span>Posted by {thread.author.name}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}</span>
                    <span>•</span>
                    <span>{thread.views} views</span>
                    <span>•</span>
                    <span>{thread.posts._count} posts</span>
                  </div>
                </CardContent>
              </Card>
            ))}

            {!loading && threads.length === 0 && query && (
              <div className="text-center py-8">
                <p className="text-[var(--text-secondary)]">No threads found matching your search.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 