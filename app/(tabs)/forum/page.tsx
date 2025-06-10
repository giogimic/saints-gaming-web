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
import { useEditMode } from "@/components/admin-widget";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableText } from "@/app/components/editable-text";

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

export default function ForumPage() {
  const { data: session } = useSession();
  const isEditMode = useEditMode();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
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
      toast('Category updated successfully');
    } catch (err) {
      console.error('Error updating category:', err);
      toast('Failed to update category', { style: { color: 'red' } });
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
      toast('Category deleted successfully');
    } catch (err) {
      console.error('Error deleting category:', err);
      toast('Failed to delete category', { style: { color: 'red' } });
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
      toast('Category created successfully');
    } catch (err) {
      console.error('Error creating category:', err);
      toast('Failed to create category', { style: { color: 'red' } });
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
      toast('Failed to update category order', { style: { color: 'red' } });
      // Revert to original order on error
      fetchCategories();
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const canManageCategories = session?.user && hasPermission(session.user.role as UserRole, 'manage:categories' as UserRole);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Forum</h1>
        <div className="flex gap-2">
          {canManageCategories && isEditMode && (
            <Button onClick={handleNewCategory} variant="default">
              <Plus className="w-4 h-4 mr-1" /> New Category
            </Button>
          )}
          {canManageCategories && (
            <Link href="/admin/categories">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-1" /> Manage Categories
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Forum Categories</h1>
            {isEditMode && canManageCategories && (
              <Button
                onClick={handleNewCategory}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Category
              </Button>
            )}
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="categories">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {categories.map((category, index) => (
                    <Draggable
                      key={category.id}
                      draggableId={category.id}
                      index={index}
                      isDragDisabled={!isEditMode}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="relative"
                        >
                          <Card className="bg-gray-800 border-gray-700">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <div className="flex items-center space-x-2">
                                {isEditMode && (
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-grab"
                                  >
                                    <GripVertical className="h-5 w-5 text-gray-400" />
                                  </div>
                                )}
                                <EditableText
                                  value={category.name}
                                  onSave={(value) => handleSave(category.id, { name: value })}
                                  className="text-xl font-semibold"
                                  disabled={!isEditMode}
                                />
                              </div>
                              {isEditMode && canManageCategories && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(category.id)}
                                  className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </CardHeader>
                            <CardContent>
                              <EditableText
                                value={category.description}
                                onSave={(value) => handleSave(category.id, { description: value })}
                                className="text-gray-400"
                                disabled={!isEditMode}
                              />
                              <p className="text-sm text-gray-500 mt-2">
                                {category._count.threads} threads
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <Suspense fallback={<div>Loading recent activity...</div>}>
              <RecentActivity />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
} 