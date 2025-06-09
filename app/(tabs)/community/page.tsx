'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from "next/navigation";
import { User } from "@/lib/types";
import md5 from "md5";
import { Badge } from '@/app/components/ui/badge';

export default function CommunityPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      console.log('Fetched users:', data); // Debug log
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
      toast({
        title: 'Error',
        description: 'Failed to load users. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">{error}</h2>
          <Button onClick={fetchUsers}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Community</h1>
          <p className="text-muted-foreground mt-1">
            Connect with fellow gamers and join our community
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

      {filteredUsers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No users found</p>
        </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => {
              const gravatarUrl = `https://www.gravatar.com/avatar/${md5(user.email)}?d=identicon&s=200`;
              return (
                <Card key={user.id}>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                    <img 
                      src={user.avatar || gravatarUrl} 
                      alt={user.name} 
                      className="w-16 h-16 rounded-full object-cover"
                    />
                      <div>
                      <CardTitle className="flex items-center gap-2">
                        {user.name}
                        <Badge variant={
                          user.role === 'admin' ? 'destructive' :
                          user.role === 'moderator' ? 'default' :
                          'secondary'
                        }>
                          {user.role}
                        </Badge>
                      </CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {user.bio || "No bio provided."}
                  </p>
                      <div className="space-y-2">
                    {user.steamId && (
                      <a 
                        href={`https://steamcommunity.com/profiles/${user.steamId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-500 hover:underline"
                      >
                        <span className="text-[#171a21]">Steam</span>
                        Profile
                          </a>
                        )}
                    {user.discordId && (
                      <a 
                        href={`https://discord.com/users/${user.discordId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-500 hover:underline"
                      >
                        <span className="text-[#5865F2]">Discord</span>
                          </a>
                        )}
                    {user.twitchId && (
                      <a 
                        href={`https://twitch.tv/${user.twitchId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-500 hover:underline"
                      >
                        <span className="text-[#9146FF]">Twitch</span>
                      </a>
                    )}
                    {user.socialLinks?.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-500 hover:underline"
                      >
                        {link.platform}
                          </a>
                    ))}
                      </div>
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
                  )}
    </div>
  );
} 