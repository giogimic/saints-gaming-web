"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { hasPermission } from "@/lib/permissions";
import { ForumPost, ForumCategory } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUp, ArrowDown, Pin } from 'lucide-react';

export default function ForumPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({ title: "", content: "", categoryId: "" });
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [voteLoading, setVoteLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/forum/posts");
      if (!response.ok) throw new Error("Failed to fetch posts");
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load forum posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/forum/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    if (!newPost.categoryId) {
      toast({ title: "Error", description: "Please select a category.", variant: "destructive" });
      return;
    }
    try {
      const response = await fetch("/api/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });
      if (!response.ok) throw new Error("Failed to create post");
      await fetchPosts();
      setNewPost({ title: "", content: "", categoryId: "" });
      toast({ title: "Success", description: "Post created successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to create post", variant: "destructive" });
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!session) return;
    try {
      const response = await fetch(`/api/forum/posts/${postId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete post");
      await fetchPosts();
      toast({ title: "Success", description: "Post deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete post", variant: "destructive" });
    }
  };

  const handleEditPost = async (postId: string, updates: Partial<ForumPost>) => {
    if (!session) return;
    try {
      const response = await fetch(`/api/forum/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update post");
      await fetchPosts();
      setEditingPost(null);
      toast({ title: "Success", description: "Post updated successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update post", variant: "destructive" });
    }
  };

  const canEditPost = (post: ForumPost) => {
    if (!session) return false;
    return (
      post.authorId === session.user.id ||
      hasPermission(session.user.role, "manage:posts")
    );
  };

  const canDeletePost = (post: ForumPost) => {
    if (!session) return false;
    return (
      post.authorId === session.user.id ||
      hasPermission(session.user.role, "manage:posts")
    );
  };

  const filteredPosts = posts.filter(post => {
    if (activeCategory && post.categoryId !== activeCategory) return false;
    if (activeTab === "all") return true;
    if (activeTab === "mine" && session?.user?.id === post.authorId) return true;
    if (activeTab === "recent") {
      const postDate = new Date(post.createdAt);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return postDate >= oneWeekAgo;
    }
    return true;
  });

  // Pin/unpin post (admin/mod only)
  const handlePinPost = async (post: ForumPost) => {
    if (!session || !hasPermission(session.user.role, 'manage:posts')) return;
    try {
      await handleEditPost(post.id, { isPinned: !post.isPinned });
      toast({ title: post.isPinned ? 'Post unpinned' : 'Post pinned' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update pin status', variant: 'destructive' });
    }
  };

  // Upvote/downvote logic
  const handleVote = async (post: ForumPost, value: 1 | -1) => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    setVoteLoading(post.id);
    try {
      const existingVote = post.votes?.find(v => v.userId === session.user.id);
      let newVotes = post.votes || [];
      if (existingVote) {
        if (existingVote.value === value) {
          // Remove vote
          newVotes = newVotes.filter(v => v.userId !== session.user.id);
        } else {
          // Change vote
          newVotes = newVotes.map(v => v.userId === session.user.id ? { ...v, value } : v);
        }
      } else {
        newVotes = [...newVotes, { userId: session.user.id, value }];
      }
      await handleEditPost(post.id, { votes: newVotes });
      await fetchPosts();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to vote', variant: 'destructive' });
    } finally {
      setVoteLoading(null);
    }
  };

  // Sort: pinned posts first, then by createdAt desc
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <form onSubmit={handleCreatePost} className="space-y-4">
            <Input
              name="title"
              value={newPost.title}
              onChange={e => setNewPost({ ...newPost, title: e.target.value })}
              placeholder="Post title"
              required
            />
            <Textarea
              name="content"
              value={newPost.content}
              onChange={e => setNewPost({ ...newPost, content: e.target.value })}
              placeholder="Write your post..."
              required
            />
            <select
              name="categoryId"
              value={newPost.categoryId}
              onChange={e => setNewPost({ ...newPost, categoryId: e.target.value })}
              required
              className="w-full border rounded p-2"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <Button type="submit">Create Post</Button>
          </form>
        </div>
        <div className="w-full md:w-64">
          <div className="mb-4">
            <label className="block mb-2 font-semibold">Filter by Category</label>
            <select
              value={activeCategory}
              onChange={e => setActiveCategory(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="all">All Posts</TabsTrigger>
              <TabsTrigger value="mine">My Posts</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      <div className="space-y-4">
        {sortedPosts.map((post) => {
          const voteCount = (post.votes || []).reduce((sum, v) => sum + v.value, 0);
          const userVote = session ? post.votes?.find(v => v.userId === session.user.id)?.value : 0;
          return (
            <Card key={post.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{post.title}</CardTitle>
                  <CardDescription>
                    Posted by {post.authorName} on {new Date(post.createdAt).toLocaleDateString()} in {categories.find(c => c.id === post.categoryId)?.name || 'Unknown'}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {post.isPinned && <Pin className="text-yellow-500" />}
                  {canEditPost(post) && (
                    <Button size="icon" variant="ghost" onClick={() => setEditingPost(post.id)} title="Edit">
                      Edit
                    </Button>
                  )}
                  {canDeletePost(post) && (
                    <Button size="icon" variant="destructive" onClick={() => handleDeletePost(post.id)} title="Delete">
                      Delete
                    </Button>
                  )}
                  {session && hasPermission(session.user.role, 'manage:posts') && (
                    <Button size="icon" variant="outline" onClick={() => handlePinPost(post)}>
                      <Pin className={post.isPinned ? 'text-yellow-500' : ''} />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {editingPost === post.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const title = (form.elements.namedItem("title") as HTMLInputElement).value;
                      const content = (form.elements.namedItem("content") as HTMLTextAreaElement).value;
                      const categoryId = (form.elements.namedItem("categoryId") as HTMLSelectElement).value;
                      handleEditPost(post.id, { title, content, categoryId });
                    }}
                    className="space-y-4"
                  >
                    <Input
                      name="title"
                      defaultValue={post.title}
                      required
                    />
                    <Textarea
                      name="content"
                      defaultValue={post.content}
                      required
                    />
                    <select
                      name="categoryId"
                      defaultValue={post.categoryId}
                      required
                      className="w-full border rounded p-2"
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <Button type="submit">Save</Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditingPost(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div>
                    {post.content}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-4 items-center">
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant={userVote === 1 ? 'default' : 'outline'}
                    onClick={() => handleVote(post, 1)}
                    disabled={voteLoading === post.id}
                    title="Upvote"
                  >
                    <ArrowUp />
                  </Button>
                  <span className="font-semibold w-8 text-center">{voteCount}</span>
                  <Button
                    size="icon"
                    variant={userVote === -1 ? 'default' : 'outline'}
                    onClick={() => handleVote(post, -1)}
                    disabled={voteLoading === post.id}
                    title="Downvote"
                  >
                    <ArrowDown />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
} 