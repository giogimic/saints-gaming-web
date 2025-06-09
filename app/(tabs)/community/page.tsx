'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Users, MessageSquare, Trophy, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import type { Member, Event } from '@/types/community';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from "next/navigation";
import { User } from "@/lib/types";
import md5 from "md5";

export default function CommunityPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, eventsRes] = await Promise.all([
          fetch('/api/community/members'),
          fetch('/api/community/events'),
        ]);

        if (!membersRes.ok || !eventsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [membersData, eventsData] = await Promise.all([
          membersRes.json(),
          eventsRes.json(),
        ]);

        setMembers(membersData);
        setEvents(eventsData);
      } catch (err) {
        setError('Failed to load community data');
        toast({
          title: 'Error',
          description: 'Failed to load community data. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/user');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.games.some(game => game.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">{error}</h2>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Community</h1>
          <p className="text-muted-foreground mt-1">
            Connect with fellow gamers and join our events
          </p>
        </div>
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full md:w-[300px]"
          />
        </div>
      </div>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList>
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-2" />
            Members
          </TabsTrigger>
          <TabsTrigger value="events">
            <Calendar className="h-4 w-4 mr-2" />
            Events
          </TabsTrigger>
          <TabsTrigger value="discord">
            <MessageSquare className="h-4 w-4 mr-2" />
            Discord
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => {
              const gravatarUrl = `https://www.gravatar.com/avatar/${md5(user.email)}?d=identicon&s=200`;
              return (
                <Card key={user.id}>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <img src={gravatarUrl} alt={user.name} className="w-16 h-16 rounded-full" />
                      <div>
                        <CardTitle>{user.name}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{user.bio || "No bio provided."}</p>
                    {user.gamingUrls && (
                      <div className="space-y-2">
                        {user.gamingUrls.steam && (
                          <a href={user.gamingUrls.steam} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline block">
                            Steam Profile
                          </a>
                        )}
                        {user.gamingUrls.discord && (
                          <a href={user.gamingUrls.discord} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline block">
                            Discord
                          </a>
                        )}
                        {user.gamingUrls.twitch && (
                          <a href={user.gamingUrls.twitch} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline block">
                            Twitch
                          </a>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Link href={`/profile/${user.id}`} className="w-full">
                      <Button variant="outline" className="w-full">View Profile</Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription>
                    {new Date(event.date).toLocaleDateString()} at {event.time}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {event.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{event.participants}/{event.maxParticipants} participants</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      <span>{event.prize} prize pool</span>
                    </div>
                  </div>
                  {event.rules && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Rules:</h4>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        {event.rules.map((rule, index) => (
                          <li key={index}>{rule}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link href={`/events/${event.id}`}>Register Now</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="discord" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Join Our Discord</CardTitle>
              <CardDescription>
                Connect with our community on Discord
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Join our Discord server to chat with other members, get updates about events,
                and participate in community discussions.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <a href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || 'https://discord.gg/saintsgaming'} target="_blank" rel="noopener noreferrer">
                  Join Discord
                </a>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 