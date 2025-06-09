'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Server, Package } from "lucide-react";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to Saints Gaming</h1>
        <p className="text-xl text-muted-foreground">
          A community-driven gaming experience with custom modpacks and dedicated servers
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Saints Gaming Modpack */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-6 h-6" />
              <Badge variant="default">Minecraft</Badge>
              <Badge variant="secondary">1.21.1</Badge>
            </div>
            <CardTitle>Saints Gaming</CardTitle>
            <CardDescription>400+ mods for exploration and automation</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              A fully loaded modpack for multiplayer Minecraft with over 400 mods. Features seamless dimension travel, enhanced movement, and modern combat systems.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <a href="https://www.curseforge.com/minecraft/modpacks/saints-gaming" target="_blank" rel="noopener noreferrer">
                Download on CurseForge
              </a>
            </Button>
          </CardFooter>
        </Card>

        {/* Dimensional Cobblemon */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-6 h-6" />
              <Badge variant="default">Minecraft</Badge>
              <Badge variant="secondary">1.21.1</Badge>
            </div>
            <CardTitle>Dimensional Cobblemon</CardTitle>
            <CardDescription>Pokémon adventure with magic and exploration</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              A Pokémon-style adventure pack with full Cobblemon integration, magic, and dimensional exploration. Includes Immersive Portals, Blue Skies, and Twilight Forest.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <a href="https://www.curseforge.com/minecraft/modpacks/dimensional-cobblemon" target="_blank" rel="noopener noreferrer">
                Download on CurseForge
              </a>
            </Button>
          </CardFooter>
        </Card>

        {/* Holy Crop! */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Gamepad2 className="w-6 h-6" />
              <Badge variant="default">Stardew Valley</Badge>
              <Badge variant="secondary">SMAPI</Badge>
            </div>
            <CardTitle>Holy Crop!</CardTitle>
            <CardDescription>Farming and automation overhaul</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              A curated Stardew Valley overhaul focused on farming, automation, NPC depth, and visual improvements. Adds over 100 mods for crafting and seasonal aesthetics.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <a href="https://www.curseforge.com/stardewvalley/modpacks/holy-crop" target="_blank" rel="noopener noreferrer">
                Download on CurseForge
              </a>
            </Button>
          </CardFooter>
        </Card>

        {/* ARK Server */}
        <Card className="md:col-span-2 lg:col-span-3">
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
            <p className="text-sm text-muted-foreground">
              Join our dedicated ARK: Survival Ascended server featuring the Omega mod. Experience enhanced gameplay mechanics, new creatures, and improved survival features.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <a href="/servers/ark" target="_blank" rel="noopener noreferrer">
                Server Information
              </a>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
        <p className="text-muted-foreground mb-6">
          Connect with fellow gamers, share your experiences, and get help with modpacks
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild variant="outline">
            <a href="/community">Community</a>
          </Button>
          <Button asChild>
            <a href="/forum">Forum</a>
          </Button>
        </div>
      </div>
    </div>
  );
} 