"use client";

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { hasPermission } from '@/lib/permissions';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit2, Trash2, Pin } from 'lucide-react';
import { PostForm } from '@/components/forum/post-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
  isPinned: boolean;
  votes: Array<{
    id: string;
    userId: string;
    value: number;
  }>;
}

export default function CategoryPage({
  params,
}: {
  params: { categoryId: string };
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [voteLoading, setVoteLoading] = useState<string | null>(null);

  const canManagePosts = session?.user && hasPermission(session.user.role, 'manage:posts');
  const canCreatePost = session?.user && hasPermission(session.user.role, 'create:post');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryRes, postsRes] = await Promise.all([
          fetch(`/api/categories/${params.categoryId}`),
          fetch(`/api/posts?categoryId=${params.categoryId}`)
        ]);

        if (!categoryRes.ok || !postsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [categoryData, postsData] = await Promise.all([
          categoryRes.json(),
          postsRes.json()
        ]);

        setCategory(categoryData);
        setPosts(postsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.categoryId]);

  const handleVote = async (post: Post, value: 1 | -1) => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    setVoteLoading(post.id);
    try {
      const response = await fetch(`/api/posts/${post.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value }),
      });

      if (!response.ok) {
        throw new Error('Failed to vote');
      }

      const updatedPost = await response.json();
      setPosts(posts.map(p => p.id === post.id ? updatedPost : p));
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setVoteLoading(null);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Category not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{category.name}</h1>
          {category.description && (
            <p className="text-muted-foreground mt-2">{category.description}</p>
          )}
        </div>
        {canCreatePost && (
          <PostForm categoryId={category.id}>
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </PostForm>
        )}
      </div>

      <div className="grid gap-6">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>
                  Posted by {post.authorName} on{' '}
                  {new Date(post.createdAt).toLocaleDateString()}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {post.isPinned && <Pin className="text-yellow-500" />}
                {canManagePosts && (
                  <>
                    <PostForm post={post}>
                      <Button variant="ghost" size="icon">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </PostForm>
                    <form action={`/api/posts/${post.id}`} method="DELETE">
                      <Button variant="ghost" size="icon" type="submit">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">{post.content}</div>
            </CardContent>
            <CardFooter className="flex gap-4 items-center">
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handleVote(post, 1)}
                  disabled={voteLoading === post.id}
                  title="Upvote"
                >
                  <ArrowUp />
                </Button>
                <span className="font-semibold w-8 text-center">
                  {post.votes.reduce((sum, v) => sum + v.value, 0)}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handleVote(post, -1)}
                  disabled={voteLoading === post.id}
                  title="Downvote"
                >
                  <ArrowDown />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 