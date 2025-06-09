'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface SteamStats {
  steamid: string;
  personaname: string;
  avatarfull: string;
  timecreated: number;
  lastlogoff: number;
  gameextrainfo?: string;
  gameid?: string;
  games: {
    appid: number;
    name: string;
    playtime_forever: number;
    playtime_2weeks?: number;
  }[];
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<SteamStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/steam/stats?steamid=${session.user.id}`)
        .then(res => res.json())
        .then(data => {
          setStats(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching Steam stats:', error);
          setLoading(false);
        });
    }
  }, [session]);

  if (loading) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold mb-4">Error loading Steam stats</h1>
        <Button onClick={() => router.push('/auth/signin')}>
          Sign in with Steam
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex items-center gap-4 mb-8">
        <Image
          src={stats.avatarfull}
          alt={stats.personaname}
          width={80}
          height={80}
          className="w-20 h-20 rounded-full"
        />
        <div>
          <h1 className="text-2xl font-bold">{stats.personaname}</h1>
          <p className="text-muted-foreground">
            Member since {new Date(stats.timecreated * 1000).toLocaleDateString()}
          </p>
        </div>
      </div>

      {stats.gameextrainfo && (
        <div className="mb-8 p-4 bg-muted rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Currently Playing</h2>
          <p>{stats.gameextrainfo}</p>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Games</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stats.games?.slice(0, 6).map(game => (
            <div key={game.appid} className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">{game.name}</h3>
              <p className="text-sm text-muted-foreground">
                {Math.round(game.playtime_forever / 60)} hours played
                {game.playtime_2weeks && (
                  <span>
                    {' '}
                    ({Math.round(game.playtime_2weeks / 60)} hours in last 2 weeks)
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 