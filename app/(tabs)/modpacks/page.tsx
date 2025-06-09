'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Gamepad2, Download, Info } from "lucide-react";

export default function ModpacksPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Our Modpacks</h1>
        <p className="text-xl text-muted-foreground">
          Custom modpacks designed for the best gaming experience
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
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                <span className="text-sm">NeoForge Required</span>
              </div>
              <p className="text-sm text-muted-foreground">
                A fully loaded modpack for multiplayer Minecraft with over 400 mods. Features seamless dimension travel with Immersive Portals, enhanced movement with Parcool, and modern combat systems. Includes advanced storage networks, tech trees, world generation, and performance tuning.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex gap-4">
            <Button asChild variant="outline" className="flex-1">
              <a href="https://www.curseforge.com/minecraft/modpacks/saints-gaming" target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4 mr-2" />
                Download
              </a>
            </Button>
            <Button asChild className="flex-1">
              <a href="/servers" target="_blank" rel="noopener noreferrer">
                Join Server
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
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                <span className="text-sm">NeoForge Required</span>
              </div>
              <p className="text-sm text-muted-foreground">
                A Pokémon-style adventure pack with full Cobblemon integration, magic, and dimensional exploration. Includes Immersive Portals, Parcool, Blue Skies, Twilight Forest, and world-expanding systems. Balanced for performance with enhanced visuals, combat AI upgrades, and multiplayer syncing tools.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex gap-4">
            <Button asChild variant="outline" className="flex-1">
              <a href="https://www.curseforge.com/minecraft/modpacks/dimensional-cobblemon" target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4 mr-2" />
                Download
              </a>
            </Button>
            <Button asChild className="flex-1">
              <a href="/servers" target="_blank" rel="noopener noreferrer">
                Join Server
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
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                <span className="text-sm">SMAPI Required</span>
              </div>
              <p className="text-sm text-muted-foreground">
                A curated Stardew Valley overhaul focused on farming, automation, NPC depth, and visual improvements. Adds over 100 mods for crafting, storage, cooking, seasonal aesthetics, and farming systems. Balanced for long save files and multiplayer sync.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex gap-4">
            <Button asChild variant="outline" className="flex-1">
              <a href="https://www.curseforge.com/stardewvalley/modpacks/holy-crop" target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4 mr-2" />
                Download
              </a>
            </Button>
            <Button asChild className="flex-1">
              <a href="/servers" target="_blank" rel="noopener noreferrer">
                Join Server
              </a>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
        <p className="text-muted-foreground mb-6">
          Join our Discord community for modpack support, installation help, and to connect with other players
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