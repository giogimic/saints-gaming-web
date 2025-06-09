'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Users, MessageSquare, Trophy, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const members = [
  {
    id: '1',
    name: 'John Doe',
    role: 'Admin',
    avatar: '/avatars/john.jpg',
    status: 'Online',
    games: ['CS2', 'Minecraft'],
    joinDate: '2023-01-15',
  },
  {
    id: '2',
    name: 'Jane Smith',
    role: 'Moderator',
    avatar: '/avatars/jane.jpg',
    status: 'Offline',
    games: ['Rust', 'CS2'],
    joinDate: '2023-02-20',
  },
  // Add more members as needed
];

const events = [
  {
    id: '1',
    title: 'CS2 Tournament',
    date: '2024-03-15',
    time: '18:00 UTC',
    participants: 32,
    prize: '$1000',
  },
  {
    id: '2',
    title: 'Minecraft Building Contest',
    date: '2024-03-20',
    time: '15:00 UTC',
    participants: 24,
    prize: '$500',
  },
  // Add more events as needed
];

export default function CommunityPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.games.some(game => game.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
            {filteredMembers.map((member) => (
              <Card key={member.id}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <CardTitle>{member.name}</CardTitle>
                      <CardDescription>{member.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className={`w-2 h-2 rounded-full ${
                        member.status === 'Online' ? 'bg-green-500' : 'bg-gray-500'
                      }`} />
                      {member.status}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {member.games.map((game) => (
                        <span
                          key={game}
                          className="px-2 py-1 bg-muted rounded-full text-sm"
                        >
                          {game}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/profile/${member.id}`}>View Profile</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{event.participants} participants</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      <span>{event.prize} prize pool</span>
                    </div>
                  </div>
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
                <a href="https://discord.gg/saintsgaming" target="_blank" rel="noopener noreferrer">
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