"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Post, Category } from "@/lib/types";
import { UserRole } from "@/lib/permissions";
import { Search, Plus, Pin, Trash2, Edit } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function ContentManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.role !== UserRole.ADMIN) {
      router.push('/dashboard');
    } else {
      fetchContent();
    }
  }, [session, status, router]);

  const fetchContent = async () => {
    try {
      const [postsRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/posts'),
        fetch('/api/admin/categories')
      ]);

      if (!postsRes.ok || !categoriesRes.ok) throw new Error('Failed to fetch content');

      const [postsData, categoriesData] = await Promise.all([
        postsRes.json(),
        categoriesRes.json()
      ]);

      setPosts(postsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: "Error",
        description: "Failed to load content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePinPost = async (postId: string, isPinned: boolean) => {
    try {
      const response = await fetch(`/api/admin/posts/${postId}/pin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned }),
      });

      if (!response.ok) throw new Error('Failed to update post');

      setPosts(posts.map(post =>
        post.id === postId ? { ...post, isPinned } : post
      ));

      toast({
        title: "Success",
        description: `Post ${isPinned ? 'pinned' : 'unpinned'} successfully`,
      });
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: "Error",
        description: "Failed to update post",
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete post');

      setPosts(posts.filter(post => post.id !== postId));

      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete category');

      setCategories(categories.filter(category => category.id !== categoryId));

      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Content Management</h1>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/admin/content/categories/new">
              <Plus className="h-4 w-4 mr-2" />
              New Category
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/content/posts/new">
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="posts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>Posts</CardTitle>
              <CardDescription>Manage forum posts</CardDescription>
              <div className="relative mt-4">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{post.title}</h3>
                        {post.isPinned && (
                          <Pin className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        By {post.authorName} • {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePinPost(post.id, !post.isPinned)}
                      >
                        <Pin className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                      >
                        <Link href={`/admin/content/posts/${post.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Manage forum categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                      >
                        <Link href={`/admin/content/categories/${category.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 