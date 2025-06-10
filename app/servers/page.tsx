import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, Users, Settings } from "lucide-react";

const servers = [
  {
    title: "Minecraft Server",
    game: "Minecraft",
    description: "Our public Minecraft server is configured with the Saints Gaming modpack. Players can install the pack via CurseForge to ensure everyone has the same mods and versions.",
    instructions: "To join, install the Saints Gaming modpack from CurseForge and use the server IP provided in our community.",
    maxPlayers: 50,
    mods: "Multiple Modpacks",
    badges: ["Minecraft", "Modded"],
  },
  {
    title: "Ark: Survival Ascended Server",
    game: "Ark: Survival Ascended",
    description: "Our Ark server uses the Omega Ascended mod, a massive overhaul that adds procedurally generated creatures, items, and RPG elements for a richer Ark experience.",
    instructions: "To join, enable the Omega mod through Ark's mod menu as described on its CurseForge page.",
    maxPlayers: 70,
    mods: "Omega",
    badges: ["ARK: Survival Ascended", "Modded"],
  },
];

export default function ServersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Our Servers</h1>
        <p className="text-xl text-muted-foreground">
          Join our dedicated gaming servers and play with the community
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {servers.map((server) => (
          <Card key={server.title}>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Server className="w-6 h-6" />
                {server.badges.map((badge) => (
                  <Badge key={badge} variant={badge === server.game ? "default" : "secondary"}>
                    {badge}
                  </Badge>
                ))}
              </div>
              <CardTitle>{server.title}</CardTitle>
              <CardDescription>{server.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Max Players: {server.maxPlayers}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Mod: {server.mods}</span>
                </div>
                <div className="rounded-md bg-muted p-4">
                  <h3 className="font-medium">How to Join</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {server.instructions}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-4">
              <Button asChild variant="outline" className="flex-1">
                <a href="discord://discord.com/channels/your-server-id" target="_blank" rel="noopener noreferrer">
                  Join Discord
                </a>
              </Button>
              <Button asChild className="flex-1">
                <a href={`/games/${server.game.toLowerCase().replace(/\s+/g, '-')}`} target="_blank" rel="noopener noreferrer">
                  Server Information
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
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