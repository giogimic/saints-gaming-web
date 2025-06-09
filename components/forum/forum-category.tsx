'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ForumCategory as ForumCategoryType } from '@/lib/types';
import { useSession } from 'next-auth/react';
import { toast } from '@/components/ui/use-toast';
import { MessageSquare, Users, Edit2, Save, X } from 'lucide-react';
import Link from 'next/link';

interface ForumCategoryProps {
  category: ForumCategoryType;
  onSave: (category: ForumCategoryType) => Promise<void>;
  isAdmin: boolean;
}

export function ForumCategory({ category, onSave, isAdmin }: ForumCategoryProps) {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description);

  const handleSave = async () => {
    try {
      if (!session?.user?.id) {
        toast({
          title: "Error",
          description: "You must be signed in to edit categories.",
          variant: "destructive",
        });
        return;
      }

      const updatedCategory: ForumCategoryType = {
        ...category,
        name,
        description,
        updatedAt: new Date().toISOString(),
      };

      await onSave(updatedCategory);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: "Failed to save category.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      {isEditing ? (
        <div className="p-6 space-y-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            className="text-lg font-semibold"
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Category description"
            className="min-h-[100px]"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      ) : (
        <Link href={`/forum/${category.id}`} className="block p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold hover:text-primary transition-colors">
                {category.name}
              </h2>
              <p className="text-muted-foreground">{category.description}</p>
            </div>
            {isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  setIsEditing(true);
                }}
                className="ml-4"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{category.posts?.length || 0} posts</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{category.posts?.length || 0} members</span>
            </div>
            <div>
              Last updated {new Date(category.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </Link>
      )}
    </div>
  );
} 