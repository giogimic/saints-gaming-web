import { authOptions } from '@/lib/auth-config';
import { getServerSession } from "next-auth";
import { getCategories, getRecentActivity } from "@/lib/api-utils";
import { RecentActivity } from "@/components/forum/recent-activity";
import { Suspense } from "react";
import { hasPermission, UserRole } from '@/lib/permissions';
import Link from 'next/link';
import { Plus, Settings } from 'lucide-react';

export default async function ForumPage() {
  const session = await getServerSession(authOptions);
  const [categories, { recentThreads, recentPosts }] = await Promise.all([
    getCategories(),
    getRecentActivity()
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Forum</h1>
        {session?.user && hasPermission(session.user.role as UserRole, 'manage:categories') && (
          <Link
            href="/admin/categories"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <Settings className="w-4 h-4" />
            Manage Categories
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <Link
                      href={`/forum/${category.slug}`}
                      className="text-xl font-semibold hover:text-blue-600"
                    >
                      {category.name}
                    </Link>
                    {category.description && (
                      <p className="text-gray-600 mt-1">{category.description}</p>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {category._count.threads} threads
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <Suspense fallback={<div>Loading recent activity...</div>}>
              <RecentActivity
                recentThreads={recentThreads}
                recentPosts={recentPosts}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
} 