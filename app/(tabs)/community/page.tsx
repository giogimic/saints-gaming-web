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
      setUsers(data);
    } catch (error) {
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
    (user.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (user.role?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 bg-[var(--background)] min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">{error}</h2>
          <Button onClick={fetchUsers} className="btn-primary">Try Again</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 bg-[var(--background)] min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-[var(--primary)]">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-[var(--background)] min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--primary)] font-heading">Community</h1>
          <p className="text-[var(--text-secondary)] mt-1 font-body">
            Connect with fellow gamers and join our community
          </p>
        </div>
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--accent-light)] h-4 w-4" />
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full md:w-[300px] input-base"
          />
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-[var(--text-muted)]">No users found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => {
            const gravatarUrl = `https://www.gravatar.com/avatar/${md5(user.email || user.id || '')}?d=identicon&s=200`;
            return (
              <Card key={user.id} className="card-base">
                <CardHeader className="card-header">
                  <div className="flex items-center gap-4">
                    <img
                      src={user.avatar || gravatarUrl}
                      alt={user.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-[var(--primary)]"
                    />
                    <div>
                      <CardTitle className="flex items-center gap-2 text-[var(--primary)] font-heading">
                        {user.name}
                        <Badge variant={
                          user.role === 'admin' ? 'destructive' :
                          user.role === 'moderator' ? 'default' :
                          'secondary'
                        }>
                          {user.role}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-[var(--text-secondary)] font-body">{user.email}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="card-content">
                  <p className="text-sm text-[var(--text-muted)] mb-4 font-body">
                    {user.bio || "No bio provided."}
                  </p>
                  <div className="space-y-2">
                    {user.steamId && (
                      <a
                        href={`https://steamcommunity.com/profiles/${user.steamId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-[#50C878] hover:underline"
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
                        className="flex items-center gap-2 text-sm text-[#008080] hover:underline"
                      >
                        <span className="text-[#5865F2]">Discord</span>
                      </a>
                    )}
                    {user.twitchId && (
                      <a
                        href={`https://twitch.tv/${user.twitchId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-[#9932CC] hover:underline"
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
                        className="flex items-center gap-2 text-sm text-[var(--accent)] hover:underline"
                      >
                        {link.platform}
                      </a>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="bg-[var(--primary-dark)]">
                  <Link href={`/profile/${user.id}`} className="w-full">
                    <Button variant="outline" className="btn-primary w-full">View Profile</Button>
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