"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, SteamStats } from "@/lib/types";
import { Edit, Link as LinkIcon, Gamepad2, Trophy, Clock, Users } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [steamStats, setSteamStats] = useState<SteamStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user) {
      fetchUserData();
    }
  }, [session, status, router]);

  const fetchUserData = async () => {
    try {
      const [userRes, steamRes] = await Promise.all([
        fetch('/api/users/me'),
        fetch('/api/users/me/steam-stats')
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
      }

      if (steamRes.ok) {
        const steamData = await steamRes.json();
        setSteamStats(steamData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatar || ''} alt={user.name} />
                <AvatarFallback>{user.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{user.name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user.bio && (
                <p className="text-sm text-muted-foreground">{user.bio}</p>
              )}
              {user.socialLinks && user.socialLinks.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Social Links</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.socialLinks.map((link, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        asChild
                        className="gap-2"
                      >
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          <LinkIcon className="h-4 w-4" />
                          {link.platform}
                        </a>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              <Button asChild variant="outline" className="w-full">
                <Link href="/settings">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-6">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-6">
              {/* Steam Stats */}
              {steamStats && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gamepad2 className="h-5 w-5" />
                      Steam Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <div>
                          <p className="text-sm font-medium">Achievements</p>
                          <p className="text-2xl font-bold">{steamStats.achievements}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">Playtime</p>
                          <p className="text-2xl font-bold">{steamStats.playtime} hrs</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">Friends</p>
                          <p className="text-2xl font-bold">{steamStats.friends}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Add recent activity items here */}
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Activity History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Add activity history here */}
                    <p className="text-sm text-muted-foreground">No activity history</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/settings/profile">Edit Profile</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/settings/security">Security Settings</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/settings/notifications">Notification Preferences</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 