import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-config";
import prisma from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, Newspaper, MessageSquare, Settings } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !hasPermission(session.user.role, "manage:content")) {
    redirect("/");
  }

  // Fetch recent content
  const [recentPages, recentNews, recentThreads] = await Promise.all([
    prisma.page.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: {
        createdBy: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    }),
    prisma.news.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    }),
    prisma.thread.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
        category: true,
      },
    }),
  ]);

  const threads = await prisma.thread.findMany({
    include: {
      author: {
        select: {
          name: true,
          image: true,
        },
      },
      category: true,
      _count: {
        select: {
          posts: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid gap-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Recent Threads</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {threads.map((thread) => (
                <div key={thread.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link
                        href={`/forum/thread/${thread.id}`}
                        className="text-lg font-medium hover:text-primary"
                      >
                        {thread.title}
                      </Link>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Posted by {thread.author.name} in {thread.category.name} •{' '}
                        {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {thread._count.posts} {thread._count.posts === 1 ? 'reply' : 'replies'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 