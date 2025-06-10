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
import { Search, Plus, Pin, Trash2, Edit, Edit2, Eye, Settings } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PageEditor } from '@/components/page-editor';
import { BlockEditor } from '@/components/block-editor';
import { RevisionHistory } from '@/components/revision-history';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  description: string | null;
  template: string | null;
}

interface Block {
  id: string;
  title: string;
  content: string;
  type: string;
  order: number;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  settings: any;
}

const BLOCK_TYPES = [
  { value: 'text', label: 'Text Block' },
  { value: 'image', label: 'Image Block' },
  { value: 'video', label: 'Video Block' },
  { value: 'carousel', label: 'Carousel' },
  { value: 'grid', label: 'Grid Layout' },
  { value: 'cta', label: 'Call to Action' },
  { value: 'testimonial', label: 'Testimonial' },
  { value: 'pricing', label: 'Pricing Table' },
];

export default function ContentManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [pages, setPages] = useState<Page[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [showRevisions, setShowRevisions] = useState(false);
  const [isPageDialogOpen, setIsPageDialogOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    template: '',
    isPublished: false,
  });
  const [blockFormData, setBlockFormData] = useState({
    type: '',
    title: '',
    content: {},
    settings: {},
    isPublished: false,
  });

  const canEdit = session?.user?.role && [UserRole.ADMIN, UserRole.MODERATOR].includes(session.user.role);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.role !== UserRole.ADMIN) {
      router.push('/dashboard');
    } else {
      fetchContent();
      if (canEdit) {
        fetchPages();
        fetchBlocks();
      }
    }
  }, [session, status, router, canEdit]);

  const fetchContent = async () => {
    try {
      const [postsRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/forum/threads'),
        fetch('/api/admin/forum/categories')
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

  const fetchPages = async () => {
    try {
      const res = await fetch('/api/admin/content/pages');
      if (!res.ok) throw new Error('Failed to fetch pages');
      const data = await res.json();
      setPages(data);
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch pages',
        variant: 'destructive',
      });
    }
  };

  const fetchBlocks = async () => {
    try {
      const res = await fetch('/api/admin/content/blocks');
      if (!res.ok) throw new Error('Failed to fetch blocks');
      const data = await res.json();
      setBlocks(data);
    } catch (error) {
      console.error('Error fetching blocks:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch blocks',
        variant: 'destructive',
      });
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

  const handleSavePage = async (data: Omit<Page, 'id'>) => {
    try {
      const res = await fetch('/api/admin/content/pages', {
        method: selectedPage ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedPage ? { ...data, id: selectedPage.id } : data),
      });
      if (!res.ok) throw new Error('Failed to save page');
      await fetchPages();
      setSelectedPage(null);
    } catch (error) {
      console.error('Error saving page:', error);
      toast({
        title: 'Error',
        description: 'Failed to save page',
        variant: 'destructive',
      });
    }
  };

  const handleSaveBlock = async (data: Omit<Block, 'id'>) => {
    try {
      const res = await fetch('/api/admin/content/blocks', {
        method: selectedBlock ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedBlock ? { ...data, id: selectedBlock.id } : data),
      });
      if (!res.ok) throw new Error('Failed to save block');
      await fetchBlocks();
      setSelectedBlock(null);
    } catch (error) {
      console.error('Error saving block:', error);
      toast({
        title: 'Error',
        description: 'Failed to save block',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePage = async (id: string) => {
    try {
      const res = await fetch('/api/admin/content/pages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete page');
      await fetchPages();
    } catch (error) {
      console.error('Error deleting page:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete page',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteBlock = async (id: string) => {
    try {
      const res = await fetch('/api/admin/content/blocks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete block');
      await fetchBlocks();
    } catch (error) {
      console.error('Error deleting block:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete block',
        variant: 'destructive',
      });
    }
  };

  const handlePageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = selectedPage
        ? `/api/admin/content/pages/${selectedPage.id}`
        : '/api/admin/content/pages';
      
      const response = await fetch(url, {
        method: selectedPage ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save page');

      await fetchPages();
      setIsPageDialogOpen(false);
      setSelectedPage(null);
      setFormData({
        title: '',
        slug: '',
        description: '',
        template: '',
        isPublished: false,
      });
      
      toast({
        title: 'Success',
        description: `Page ${selectedPage ? 'updated' : 'created'} successfully`,
      });
    } catch (error) {
      console.error('Error saving page:', error);
      toast({
        title: 'Error',
        description: 'Failed to save page',
        variant: 'destructive',
      });
    }
  };

  const handleBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPage) return;

    try {
      const url = selectedBlock
        ? `/api/admin/content/blocks/${selectedBlock.id}`
        : '/api/admin/content/blocks';
      
      const response = await fetch(url, {
        method: selectedBlock ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...blockFormData,
          pageId: selectedPage.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to save block');

      await fetchBlocks(selectedPage.id);
      setIsBlockDialogOpen(false);
      setSelectedBlock(null);
      setBlockFormData({
        type: '',
        title: '',
        content: {},
        settings: {},
        isPublished: false,
      });
      
      toast({
        title: 'Success',
        description: `Block ${selectedBlock ? 'updated' : 'created'} successfully`,
      });
    } catch (error) {
      console.error('Error saving block:', error);
      toast({
        title: 'Error',
        description: 'Failed to save block',
        variant: 'destructive',
      });
    }
  };

  const handlePageEdit = (page: Page) => {
    setSelectedPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      description: page.description || '',
      template: page.template || '',
      isPublished: page.isPublished,
    });
    setIsPageDialogOpen(true);
  };

  const handleBlockEdit = (block: Block) => {
    setSelectedBlock(block);
    setBlockFormData({
      type: block.type,
      title: block.title || '',
      content: block.content,
      settings: block.settings || {},
      isPublished: block.isPublished,
    });
    setIsBlockDialogOpen(true);
  };

  const handlePageDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      const response = await fetch(`/api/admin/content/pages/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete page');

      await fetchPages();
      toast({
        title: 'Success',
        description: 'Page deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting page:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete page',
        variant: 'destructive',
      });
    }
  };

  const handleBlockDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this block?')) return;

    try {
      const response = await fetch(`/api/admin/content/blocks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete block');

      if (selectedPage) {
        await fetchBlocks(selectedPage.id);
      }
      toast({
        title: 'Success',
        description: 'Block deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting block:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete block',
        variant: 'destructive',
      });
    }
  };

  const handlePageSelect = (page: Page) => {
    setSelectedPage(page);
    fetchBlocks(page.id);
  };

  if (!canEdit) {
    return <div>Access denied</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Content Management</h1>
        <div className="flex gap-2">
          <Dialog open={isPageDialogOpen} onOpenChange={setIsPageDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setSelectedPage(null);
                setFormData({
                  title: '',
                  slug: '',
                  description: '',
                  template: '',
                  isPublished: false,
                });
              }}>
                <Plus className="w-4 h-4 mr-2" />
                New Page
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedPage ? 'Edit Page' : 'New Page'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handlePageSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template">Template</Label>
                  <Input
                    id="template"
                    value={formData.template}
                    onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublished"
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                  />
                  <Label htmlFor="isPublished">Published</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsPageDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {selectedPage ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Pages</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow
                  key={page.id}
                  className={selectedPage?.id === page.id ? 'bg-muted' : ''}
                  onClick={() => handlePageSelect(page)}
                >
                  <TableCell>{page.title}</TableCell>
                  <TableCell>{page.slug}</TableCell>
                  <TableCell>
                    {page.isPublished ? 'Published' : 'Draft'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePageEdit(page);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePageDelete(page.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/${page.slug}`);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {selectedPage && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Blocks for {selectedPage.title}
              </h2>
              <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setSelectedBlock(null);
                    setBlockFormData({
                      type: '',
                      title: '',
                      content: {},
                      settings: {},
                      isPublished: false,
                    });
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Block
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {selectedBlock ? 'Edit Block' : 'New Block'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleBlockSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="blockType">Type</Label>
                      <Select
                        value={blockFormData.type}
                        onValueChange={(value) => setBlockFormData({ ...blockFormData, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select block type" />
                        </SelectTrigger>
                        <SelectContent>
                          {BLOCK_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="blockTitle">Title</Label>
                      <Input
                        id="blockTitle"
                        value={blockFormData.title}
                        onChange={(e) => setBlockFormData({ ...blockFormData, title: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="blockIsPublished"
                        checked={blockFormData.isPublished}
                        onCheckedChange={(checked) => setBlockFormData({ ...blockFormData, isPublished: checked })}
                      />
                      <Label htmlFor="blockIsPublished">Published</Label>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsBlockDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        {selectedBlock ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blocks.map((block) => (
                  <TableRow key={block.id}>
                    <TableCell>{block.type}</TableCell>
                    <TableCell>{block.title}</TableCell>
                    <TableCell>
                      {block.isPublished ? 'Published' : 'Draft'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleBlockEdit(block)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleBlockDelete(block.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            // TODO: Implement block preview
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
} 