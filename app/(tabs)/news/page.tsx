'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Plus, Calendar, Tag } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
  featured: boolean;
}

export default function NewsPage() {
  const { data: session } = useSession();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/news');
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      const data = await response.json();
      setArticles(data);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to load news. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredArticle = filteredArticles.find(article => article.featured);
  const recentArticles = filteredArticles.filter(article => !article.featured);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">{error}</h2>
          <Button onClick={fetchNews} className="btn-primary">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[var(--primary)]">News</h1>
        {session?.user?.role === 'ADMIN' && (
          <Button asChild className="btn-primary">
            <Link href="/news/create">
              <Plus className="h-4 w-4 mr-2" />
              Create News
            </Link>
          </Button>
        )}
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]" />
        <Input
          type="text"
          placeholder="Search news..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-[var(--background-secondary)] border-[var(--border)] text-[var(--text-primary)]"
        />
      </div>

      {featuredArticle && (
        <Card className="card-base mb-8">
          <div className="relative h-64">
            <img
              src={featuredArticle.image}
              alt={featuredArticle.title}
              className="w-full h-full object-cover rounded-t-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-4 mb-2">
                <span className="px-3 py-1 bg-[var(--primary)] text-white rounded-full text-sm">
                  Featured
                </span>
                <span className="text-white/80 text-sm">
                  {formatDistanceToNow(new Date(featuredArticle.createdAt), { addSuffix: true })}
                </span>
              </div>
              <Link href={`/news/${featuredArticle.id}`}>
                <h2 className="text-2xl font-bold text-white mb-2 hover:text-[var(--primary)] transition-colors">
                  {featuredArticle.title}
                </h2>
              </Link>
              <p className="text-white/80 line-clamp-2">{featuredArticle.excerpt}</p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recentArticles.map((article) => (
          <Card key={article.id} className="card-base">
            <div className="relative h-48">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover rounded-t-lg"
              />
            </div>
            <CardHeader className="card-header">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-[var(--text-secondary)]" />
                <span className="text-sm text-[var(--text-secondary)]">
                  {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}
                </span>
              </div>
              <Link href={`/news/${article.id}`}>
                <CardTitle className="text-xl font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors">
                  {article.title}
                </CardTitle>
              </Link>
            </CardHeader>
            <CardContent className="card-content">
              <p className="text-[var(--text-secondary)] line-clamp-3">{article.excerpt}</p>
              <div className="flex items-center gap-2 mt-4">
                <Tag className="h-4 w-4 text-[var(--text-secondary)]" />
                <span className="text-sm text-[var(--text-secondary)]">
                  {article.category.name}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-bold text-[var(--text-secondary)] mb-2">
            No news articles found
          </h3>
          <p className="text-[var(--text-secondary)]">
            Try adjusting your search query
          </p>
        </div>
      )}
    </div>
  );
} 