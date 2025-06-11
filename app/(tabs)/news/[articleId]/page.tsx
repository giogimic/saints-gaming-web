'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Loader2, ArrowLeft, Calendar, Tag, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface NewsArticle {
  id: string;
  title: string;
  content: string;
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
}

export default function NewsArticlePage() {
  const { articleId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticle();
  }, [articleId]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/news/${articleId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch article');
      }
      const data = await response.json();
      setArticle(data);
    } catch (err) {
      console.error('Error fetching article:', err);
      setError('Failed to load article. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this article?')) {
      return;
    }

    try {
      const response = await fetch(`/api/news/${articleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete article');
      }

      toast({ title: 'Success', description: 'Article deleted successfully' });
      router.push('/news');
    } catch (err) {
      console.error('Error deleting article:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete article. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">{error || 'Article not found'}</h2>
          <Button onClick={() => router.back()} className="btn-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-[var(--text-secondary)] hover:text-[var(--primary)]"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to News
        </Button>
      </div>

      <div className="relative h-96 mb-8">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover rounded-lg"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-white/80" />
              <span className="text-white/80">
                {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-white/80" />
              <span className="text-white/80">{article.category.name}</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">{article.title}</h1>
          <div className="flex items-center gap-4">
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-10 h-10 rounded-full"
            />
            <span className="text-white/80">By {article.author.name}</span>
          </div>
        </div>
      </div>

      <Card className="card-base">
        <CardContent className="card-content">
          <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
        </CardContent>
      </Card>

      {session?.user?.role === 'ADMIN' && (
        <div className="flex items-center gap-4 mt-8">
          <Button asChild className="btn-primary">
            <Link href={`/news/${articleId}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Article
            </Link>
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="btn-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Article
          </Button>
        </div>
      )}
    </div>
  );
} 