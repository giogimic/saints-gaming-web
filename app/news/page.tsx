"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/rich-text-editor";
import { toast } from "@/components/ui/use-toast";
import { UserRole } from "@/lib/permissions";
import { Loader2 } from "lucide-react";

interface NewsPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export default function NewsPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canEdit = session?.user?.role && [UserRole.ADMIN, UserRole.MODERATOR].includes(session.user.role);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/news");
      if (!response.ok) throw new Error("Failed to fetch posts");
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to load news posts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPost = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, published: true }),
      });

      if (!response.ok) throw new Error("Failed to create post");

      const newPost = await response.json();
      setPosts([newPost, ...posts]);
      setTitle("");
      setContent("");
      toast.success("News post added successfully");
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create news post",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPost = async (post: NewsPost) => {
    setTitle(post.title);
    setContent(post.content);
    setIsEditing(true);
    setEditingId(post.id);
  };

  const handleUpdatePost = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/news", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, title, content }),
      });

      if (!response.ok) throw new Error("Failed to update post");

      const updatedPost = await response.json();
      setPosts(posts.map(post => post.id === editingId ? updatedPost : post));
      setTitle("");
      setContent("");
      setIsEditing(false);
      setEditingId(null);
      toast.success("News post updated successfully");
    } catch (error) {
      console.error("Error updating post:", error);
      toast({
        title: "Error",
        description: "Failed to update news post",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await fetch(`/api/news?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete post");

      setPosts(posts.filter(post => post.id !== id));
      toast.success("News post deleted successfully");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete news post",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">News</h1>

      {canEdit && (
        <div className="mb-8 p-6 bg-card rounded-lg border">
          <h2 className="text-2xl font-semibold mb-4">
            {isEditing ? "Edit News Post" : "Add News Post"}
          </h2>
          <div className="space-y-4">
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Write your news post here..."
            />
            <div className="flex gap-2">
              <Button
                onClick={isEditing ? handleUpdatePost : handleAddPost}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  isEditing ? "Update Post" : "Add Post"
                )}
              </Button>
              {isEditing && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setTitle("");
                    setContent("");
                    setIsEditing(false);
                    setEditingId(null);
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {posts.map((post) => (
          <article
            key={post.id}
            className="p-6 bg-card rounded-lg border"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
                <p className="text-muted-foreground">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
              {canEdit && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditPost(post)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeletePost(post.id)}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
            <div
              className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>
        ))}
      </div>
    </div>
  );
} 