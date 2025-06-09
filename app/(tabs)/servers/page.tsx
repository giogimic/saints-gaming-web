'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Server, Users, Settings } from "lucide-react";

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
        {/* ARK Server */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Server className="w-6 h-6" />
              <Badge variant="default">ARK: Survival Ascended</Badge>
              <Badge variant="secondary">Modded</Badge>
            </div>
            <CardTitle>Omega Modded Server</CardTitle>
            <CardDescription>Enhanced survival experience with Omega mod</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="text-sm">Max Players: 70</span>
              </div>
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="text-sm">Mod: Omega</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Join our dedicated ARK: Survival Ascended server featuring the Omega mod. Experience enhanced gameplay mechanics, new creatures, and improved survival features.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex gap-4">
            <Button asChild variant="outline" className="flex-1">
              <a href="discord://discord.com/channels/your-server-id" target="_blank" rel="noopener noreferrer">
                Join Discord
              </a>
            </Button>
            <Button asChild className="flex-1">
              <a href="steam://connect/your-server-ip" target="_blank" rel="noopener noreferrer">
                Connect to Server
              </a>
            </Button>
          </CardFooter>
        </Card>

        {/* Minecraft Servers */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Server className="w-6 h-6" />
              <Badge variant="default">Minecraft</Badge>
              <Badge variant="secondary">Modded</Badge>
            </div>
            <CardTitle>Modded Minecraft Servers</CardTitle>
            <CardDescription>Multiple modpacks available</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="text-sm">Max Players: 50</span>
              </div>
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="text-sm">Multiple Modpacks</span>
              </div>
              <p className="text-sm text-muted-foreground">
                We host servers for our custom modpacks: Saints Gaming and Dimensional Cobblemon. Join us for an enhanced Minecraft experience with mods and community features.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex gap-4">
            <Button asChild variant="outline" className="flex-1">
              <a href="discord://discord.com/channels/your-server-id" target="_blank" rel="noopener noreferrer">
                Join Discord
              </a>
            </Button>
            <Button asChild className="flex-1">
              <a href="/modpacks" target="_blank" rel="noopener noreferrer">
                View Modpacks
              </a>
            </Button>
          </CardFooter>
        </Card>
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