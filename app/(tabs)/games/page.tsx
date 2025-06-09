'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Users, Server, Gamepad2 } from 'lucide-react';
import Link from 'next/link';

const games = [
  {
    id: 'csgo',
    name: 'Counter-Strike 2',
    description: 'Join our competitive CS2 servers and tournaments',
    image: '/games/cs2.jpg',
    servers: [
      { name: 'Competitive #1', players: '24/32', map: 'de_dust2' },
      { name: 'Casual #1', players: '18/32', map: 'de_mirage' },
    ],
  },
  {
    id: 'minecraft',
    name: 'Minecraft',
    description: 'Build, explore, and survive in our Minecraft world',
    image: '/games/minecraft.jpg',
    servers: [
      { name: 'Survival', players: '45/100', map: 'World' },
      { name: 'Creative', players: '12/50', map: 'Creative' },
    ],
  },
  {
    id: 'rust',
    name: 'Rust',
    description: 'Survive and thrive in our Rust servers',
    image: '/games/rust.jpg',
    servers: [
      { name: 'Main Server', players: '98/150', map: 'Procedural' },
      { name: 'PVE Server', players: '45/100', map: 'Procedural' },
    ],
  },
];

export default function GamesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGames = games.filter(game =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Our Games</h1>
          <p className="text-muted-foreground mt-1">
            Join our gaming servers and participate in tournaments
          </p>
        </div>
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full md:w-[300px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.map((game) => (
          <Card key={game.id} className="overflow-hidden">
            <div className="aspect-video relative">
              <img
                src={game.image}
                alt={game.name}
                className="object-cover w-full h-full"
              />
            </div>
            <CardHeader>
              <CardTitle>{game.name}</CardTitle>
              <CardDescription>{game.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {game.servers.map((server, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{server.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{server.players}</span>
                      </div>
                      <span>{server.map}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <Link href={`/games/${game.id}`}>
                  <Gamepad2 className="mr-2 h-4 w-4" />
                  Play Now
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredGames.length === 0 && (
        <div className="text-center py-12 bg-muted rounded-lg">
          <p className="text-muted-foreground">No games found.</p>
          {searchQuery && (
            <Button
              variant="link"
              onClick={() => setSearchQuery('')}
              className="mt-2"
            >
              Clear search
            </Button>
          )}
        </div>
      )}
    </div>
  );
} 