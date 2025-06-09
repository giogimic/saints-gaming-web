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
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCategories } from '@/lib/db';
import Link from 'next/link';
import { PlusCircle, Edit2, Trash2 } from 'lucide-react';
import { CategoryForm } from '@/components/forum/category-form';

export default async function ForumPage() {
  const session = await getServerSession(authOptions);
  const categories = await getCategories();
  const canManageCategories = session?.user && hasPermission(session.user.role, 'manage:categories');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Forum</h1>
        {canManageCategories && (
          <CategoryForm>
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              New Category
            </Button>
          </CategoryForm>
        )}
      </div>

      <div className="grid gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-card rounded-lg border p-6 hover:border-primary/50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <Link
                  href={`/forum/${category.id}`}
                  className="text-xl font-semibold hover:text-primary"
                >
                  {category.name}
                </Link>
                {category.description && (
                  <p className="text-muted-foreground mt-2">
                    {category.description}
                  </p>
                )}
              </div>
              {canManageCategories && !category.isDefault && (
                <div className="flex gap-2">
                  <CategoryForm category={category}>
                    <Button variant="ghost" size="icon">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </CategoryForm>
                  <form
                    action={`/api/categories/${category.id}`}
                    method="DELETE"
                  >
                    <Button variant="ghost" size="icon" type="submit">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 