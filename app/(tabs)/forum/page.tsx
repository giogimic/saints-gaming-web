'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { ForumCategory } from '@/components/forum/forum-category';
import { Button } from '@/components/ui/button';
import { getCategories, saveCategory } from '@/lib/storage';
import { ForumCategory as ForumCategoryType } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function ForumPage() {
  const { data: session, status } = useSession();
  const [categories, setCategories] = useState<ForumCategoryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const loadedCategories = await getCategories();
        setCategories(loadedCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
        toast({
          title: "Error",
          description: "Failed to load forum categories.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleSaveCategory = async (category: ForumCategoryType) => {
    if (!session) {
      toast({
        title: "Error",
        description: "You must be signed in to update categories.",
        variant: "destructive",
      });
      return;
    }

    try {
      await saveCategory(category);
      setCategories(prev => 
        prev.map(cat => cat.id === category.id ? category : cat)
      );
      toast({
        title: "Success",
        description: "Category updated successfully.",
      });
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: "Failed to update category.",
        variant: "destructive",
      });
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Forum</h1>
          <p className="text-muted-foreground mt-1">
            Join the discussion and connect with our community
          </p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full md:w-[300px]"
            />
          </div>
          {session?.user?.role === 'admin' && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Category
            </Button>
          )}
        </div>
      </div>

      {!session && (
        <div className="bg-muted p-6 rounded-lg mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold">Join the Discussion</h2>
              <p className="text-muted-foreground mt-1">
                Sign in to participate in forum discussions and manage categories.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <a href="/auth/signin">Sign In</a>
              </Button>
              <Button asChild>
                <a href="/auth/register">Register</a>
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12 bg-muted rounded-lg">
            <p className="text-muted-foreground">No categories found.</p>
            {searchQuery && (
              <Button
                variant="link"
                onClick={() => setSearchQuery('')}
                className="mt-2"
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          filteredCategories.map((category) => (
            <ForumCategory
              key={category.id}
              category={category}
              onSave={handleSaveCategory}
              isAdmin={session?.user?.role === 'admin'}
            />
          ))
        )}
      </div>
    </div>
  );
} 