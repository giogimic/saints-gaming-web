import { BasePage, BasePageProps } from './base-page';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Server, Users, Settings } from 'lucide-react';
import { ContentBlock } from '@prisma/client';

interface ServerBlockSettings {
  badges: string[];
  game: string;
  description: string;
  maxPlayers: number;
  mods: string;
  instructions: string;
  discordUrl: string;
  serverUrl: string;
}

function isServerBlockSettings(settings: any): settings is ServerBlockSettings {
  return (
    settings &&
    Array.isArray(settings.badges) &&
    typeof settings.game === 'string' &&
    typeof settings.description === 'string' &&
    typeof settings.maxPlayers === 'number' &&
    typeof settings.mods === 'string' &&
    typeof settings.instructions === 'string' &&
    typeof settings.discordUrl === 'string' &&
    typeof settings.serverUrl === 'string'
  );
}

export function ServersPage({ page }: BasePageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{page.title}</h1>
        {page.description && (
          <p className="text-xl text-muted-foreground">{page.description}</p>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {page.blocks.map((block) => {
          const settings = block.settings as unknown;
          if (!isServerBlockSettings(settings)) {
            return null;
          }

          return (
            <Card key={block.id}>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Server className="w-6 h-6" />
                  {settings.badges.map((badge) => (
                    <Badge key={badge} variant={badge === settings.game ? "default" : "secondary"}>
                      {badge}
                    </Badge>
                  ))}
                </div>
                <CardTitle>{block.title}</CardTitle>
                <CardDescription>{settings.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Max Players: {settings.maxPlayers}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Mod: {settings.mods}</span>
                  </div>
                  <div className="rounded-md bg-muted p-4">
                    <h3 className="font-medium">How to Join</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {settings.instructions}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-4">
                <Button asChild variant="outline" className="flex-1">
                  <a href={settings.discordUrl || '#'} target="_blank" rel="noopener noreferrer">
                    Join Discord
                  </a>
                </Button>
                <Button asChild className="flex-1">
                  <a href={settings.serverUrl || '#'} target="_blank" rel="noopener noreferrer">
                    Server Information
                  </a>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
        <p className="text-muted-foreground mb-6">
          Join our Discord community for server status updates, support, and to connect with other players
        </p>
        <Button asChild size="lg">
          <a href="discord://discord.com/channels/your-server-id" target="_blank" rel="noopener noreferrer">
            Join Our Discord
          </a>
        </Button>
      </div>
    </div>
  );
} 