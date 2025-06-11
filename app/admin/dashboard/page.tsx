"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, MessageSquare, Eye, Flag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Thread {
  id: string;
  title: string;
  author: {
    id: string;
    name: string;
  };
  createdAt: string;
  _count: {
    posts: number;
  };
  views: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Report {
  id: string;
  type: string;
  content: string;
  createdAt: string;
  status: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalThreads: 0,
    totalPosts: 0,
    totalViews: 0,
  });
  const [recentThreads, setRecentThreads] = useState<Thread[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentReports, setRecentReports] = useState<Report[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    } else {
      fetchDashboardData();
    }
  }, [status, session]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, threadsRes, usersRes, reportsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/threads'),
        fetch('/api/admin/users'),
        fetch('/api/admin/reports'),
      ]);

      if (!statsRes.ok || !threadsRes.ok || !usersRes.ok || !reportsRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [statsData, threadsData, usersData, reportsData] = await Promise.all([
        statsRes.json(),
        threadsRes.json(),
        usersRes.json(),
        reportsRes.json(),
      ]);

      setStats(statsData);
      setRecentThreads(threadsData);
      setRecentUsers(usersData);
      setRecentReports(reportsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Threads</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalThreads}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Threads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentThreads.map((thread) => (
                <div key={thread.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{thread.title}</div>
                    <div className="text-sm text-muted-foreground">
                      by {thread.author.name} • {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {thread._count.posts} {thread._count.posts === 1 ? 'post' : 'posts'} • {thread.views} views
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {user.email} • {user.role}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{report.type}</div>
                    <div className="text-sm text-muted-foreground">
                      {report.content}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {report.status} • {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 