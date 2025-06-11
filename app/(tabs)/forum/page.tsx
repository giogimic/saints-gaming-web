"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { hasPermission, UserRole } from '@/lib/permissions';
import { RecentActivity } from "@/components/forum/recent-activity";
import { Suspense } from "react";
import Link from 'next/link';
import { Plus, Settings, Edit2, Trash2, GripVertical } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEditMode } from '@/app/contexts/EditModeContext';
import { toast } from "@/components/ui/use-toast";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableText } from "@/components/editable-text";
import { Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  order: number;
  _count: {
    threads: number;
  };
}

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
  categoryId: string;
  isPinned: boolean;
  isLocked: boolean;
  views: number;
  posts: {
    id: string;
  }[];
}

interface Activity {
  id: string;
  type: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
}

export default function ForumPage() {
  const { data: session } = useSession();
  const { canEdit, isEditMode } = useEditMode();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchData();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/forum/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [threadsRes, activityRes] = await Promise.all([
        fetch('/api/forum/threads'),
        fetch('/api/activity')
      ]);

      if (!threadsRes.ok || !activityRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [threadsData, activityData] = await Promise.all([
        threadsRes.json(),
        activityRes.json()
      ]);

      setThreads(threadsData.threads);
      setRecentActivity(activityData);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load forum data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (id: string, data: Partial<Category>) => {
    try {
      const response = await fetch('/api/forum/categories', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...data }),
      });

      if (!response.ok) {
        throw new Error('Failed to update category');
      }

      const updatedCategory = await response.json();
      setCategories(categories.map(cat => 
        cat.id === updatedCategory.id ? updatedCategory : cat
      ));
      toast({ title: 'Success', description: 'Category updated successfully' });
    } catch (err) {
      console.error('Error updating category:', err);
      toast({ title: 'Error', description: 'Failed to update category', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/forum/categories?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      setCategories(categories.filter(cat => cat.id !== id));
      toast({ title: 'Success', description: 'Category deleted successfully' });
    } catch (err) {
      console.error('Error deleting category:', err);
      toast({ title: 'Error', description: 'Failed to delete category', variant: 'destructive' });
    }
  };

  const handleNewCategory = async () => {
    try {
      const response = await fetch('/api/forum/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Category',
          description: '',
          order: categories.length,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create category');
      }

      const newCategory = await response.json();
      setCategories([...categories, newCategory]);
      toast({ title: 'Success', description: 'Category created successfully' });
    } catch (err) {
      console.error('Error creating category:', err);
      toast({ title: 'Error', description: 'Failed to create category', variant: 'destructive' });
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(categories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately for smooth UI
    setCategories(items);

    // Update order in database
    try {
      const response = await fetch('/api/forum/categories', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: reorderedItem.id,
          order: result.destination.index,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update category order');
      }
    } catch (err) {
      console.error('Error updating category order:', err);
      toast({ title: 'Error', description: 'Failed to update category order', variant: 'destructive' });
      // Revert to original order on error
      fetchCategories();
    }
  };

  if (loading) {
  return (
      <div className="min-h-screen bg-[#272727] text-white">
        <div className="container mx-auto py-8 px-4">
          <h1 className="font-heading text-3xl font-bold mb-6 text-[#50C878]">Forum</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="card-base animate-pulse">
                  <CardHeader className="card-header">
                    <div className="h-6 loading-pulse rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent className="card-content">
                    <div className="h-4 loading-pulse rounded w-full mb-4"></div>
                    <div className="h-4 loading-pulse rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
      </div>
            <div className="space-y-6">
              <Card className="card-base animate-pulse">
                <CardHeader className="card-header">
                  <div className="h-6 loading-pulse rounded w-1/2"></div>
                </CardHeader>
                <CardContent className="card-content">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-4 loading-pulse rounded w-full mb-4"></div>
                  ))}
                </CardContent>
              </Card>
                  </div>
                  </div>
                </div>
              </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#272727] text-white">
        <div className="container mx-auto py-8 px-4">
          <h1 className="font-heading text-3xl font-bold mb-6 text-[#50C878]">Forum</h1>
          <Card className="card-base">
            <CardContent className="card-content">
              <p className="status-error">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const canManageCategories = session?.user && hasPermission(session.user.role as UserRole, 'manage:categories' as UserRole);

  return (
    <main className={isEditMode ? 'edit-mode' : ''}>
      <div className="min-h-screen bg-[#272727] text-white">
        <div className="container mx-auto py-8 px-4">
          <h1 className="font-heading text-3xl font-bold mb-6 text-[#50C878]">Forum</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {threads.map((thread) => (
                <Card key={thread.id} className={`card-base ${isEditMode ? 'edit-mode-hover' : ''}`}>
                  <CardHeader className="card-header">
                    <CardTitle className="text-[#50C878]">
                      {canEdit && isEditMode ? (
                        <EditableText
                          value={thread.title}
                          onSave={async (value) => await handleSave(thread.id, 'title', value)}
                          className="focus-ring"
                        />
                      ) : (
                        thread.title
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="card-content">
                    <p className="text-gray-200 mb-4">{thread.content}</p>
                    <div className="flex justify-between text-sm text-[#9966CC]">
                      <span>Posted by {thread.author.name}</span>
                      <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="space-y-6">
              <Card className="card-base">
                <CardHeader className="card-header">
                  <CardTitle className="text-[#50C878]">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="card-content">
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="border-b border-[#50C878] pb-4">
                        <p className="text-gray-200">{activity.content}</p>
                        <p className="text-sm text-[#9966CC] mt-2">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 