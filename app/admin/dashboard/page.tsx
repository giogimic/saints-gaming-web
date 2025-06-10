import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, Newspaper, MessageSquare, Settings } from "lucide-react";
import Link from "next/link";

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

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/admin/content/new">
              <Plus className="h-4 w-4 mr-2" />
              New Page
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
          <TabsTrigger value="forum">Forum</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Pages</h3>
              </div>
              <p className="text-2xl font-bold">{recentPages.length}</p>
              <p className="text-sm text-muted-foreground">Total pages</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Newspaper className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">News</h3>
              </div>
              <p className="text-2xl font-bold">{recentNews.length}</p>
              <p className="text-sm text-muted-foreground">Total news posts</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Forum</h3>
              </div>
              <p className="text-2xl font-bold">{recentThreads.length}</p>
              <p className="text-sm text-muted-foreground">Total threads</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Recent Pages</h3>
              <div className="space-y-4">
                {recentPages.map((page) => (
                  <div key={page.id} className="flex items-center justify-between">
                    <div>
                      <Link
                        href={`/admin/content/${page.id}`}
                        className="font-medium hover:underline"
                      >
                        {page.title}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        Last updated: {new Date(page.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/content/${page.id}`}>Edit</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-4">Recent News</h3>
              <div className="space-y-4">
                {recentNews.map((news) => (
                  <div key={news.id} className="flex items-center justify-between">
                    <div>
                      <Link
                        href={`/admin/news/${news.id}`}
                        className="font-medium hover:underline"
                      >
                        {news.title}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        By {news.author.name} •{" "}
                        {new Date(news.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/news/${news.id}`}>Edit</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pages">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">All Pages</h3>
              <Button asChild>
                <Link href="/admin/content/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Page
                </Link>
              </Button>
            </div>
            <div className="space-y-4">
              {recentPages.map((page) => (
                <div key={page.id} className="flex items-center justify-between">
                  <div>
                    <Link
                      href={`/admin/content/${page.id}`}
                      className="font-medium hover:underline"
                    >
                      {page.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      Created by {page.createdBy.name} •{" "}
                      {new Date(page.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/content/${page.id}`}>Edit</Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/${page.slug}`} target="_blank">
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="news">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">All News</h3>
              <Button asChild>
                <Link href="/admin/news/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Post
                </Link>
              </Button>
            </div>
            <div className="space-y-4">
              {recentNews.map((news) => (
                <div key={news.id} className="flex items-center justify-between">
                  <div>
                    <Link
                      href={`/admin/news/${news.id}`}
                      className="font-medium hover:underline"
                    >
                      {news.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      By {news.author.name} •{" "}
                      {new Date(news.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/news/${news.id}`}>Edit</Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/news/${news.id}`} target="_blank">
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="forum">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Forum Management</h3>
              <Button asChild>
                <Link href="/admin/forum/categories">
                  <Plus className="h-4 w-4 mr-2" />
                  Manage Categories
                </Link>
              </Button>
            </div>
            <div className="space-y-4">
              {recentThreads.map((thread) => (
                <div key={thread.id} className="flex items-center justify-between">
                  <div>
                    <Link
                      href={`/admin/forum/threads/${thread.id}`}
                      className="font-medium hover:underline"
                    >
                      {thread.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      In {thread.category.name} • By {thread.author.name} •{" "}
                      {new Date(thread.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/forum/threads/${thread.id}`}>Manage</Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/forum/${thread.category.slug}/${thread.slug}`} target="_blank">
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 