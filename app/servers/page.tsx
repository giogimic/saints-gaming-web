"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import Link from "next/link";

interface ServerInfo {
  id: string;
  name: string;
  description: string;
  image: string;
  status: "online" | "offline" | "maintenance";
  players: number;
  maxPlayers: number;
  version: string;
  ip: string;
  type: "ark" | "minecraft";
  features: string[];
  rules: string[];
  modpack?: {
    name: string;
    version: string;
    downloadUrl: string;
  };
}

export default function ServersPage() {
  const [activeTab, setActiveTab] = useState("ark");

  const servers: ServerInfo[] = [
    {
      id: "ark-ascended",
      name: "ARK: Survival Ascended",
      description: "Join our ARK: Survival Ascended server for an epic survival experience!",
      image: "/ark-ascended.jpg",
      status: "online",
      players: 24,
      maxPlayers: 50,
      version: "v1.0",
      ip: "ark.saintsgaming.com",
      type: "ark",
      features: [
        "2x XP and Harvesting",
        "Custom Dino Spawns",
        "Active Admin Team",
        "Regular Events",
        "Discord Integration",
      ],
      rules: [
        "No cheating or exploiting",
        "Be respectful to other players",
        "No griefing or harassment",
        "Follow server guidelines",
      ],
    },
    {
      id: "minecraft",
      name: "Minecraft",
      description: "Explore our Minecraft server with custom modpacks and unique features!",
      image: "/minecraft.jpg",
      status: "online",
      players: 15,
      maxPlayers: 30,
      version: "1.20.1",
      ip: "mc.saintsgaming.com",
      type: "minecraft",
      features: [
        "Custom Modpack",
        "Economy System",
        "Land Protection",
        "Player Shops",
        "Regular Events",
      ],
      rules: [
        "No griefing or stealing",
        "Be respectful to others",
        "No cheating or exploiting",
        "Follow server guidelines",
      ],
      modpack: {
        name: "Saints Gaming Modpack",
        version: "1.0.0",
        downloadUrl: "/modpacks/saints-gaming.zip",
      },
    },
  ];

  const filteredServers = servers.filter((server) => server.type === activeTab);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Our Servers</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList>
          <TabsTrigger value="ark">ARK: Survival Ascended</TabsTrigger>
          <TabsTrigger value="minecraft">Minecraft</TabsTrigger>
        </TabsList>

        {filteredServers.map((server) => (
          <TabsContent key={server.id} value={server.type}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Server Info */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{server.name}</CardTitle>
                        <CardDescription>{server.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            server.status === "online"
                              ? "bg-green-500"
                              : server.status === "maintenance"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                        />
                        <span className="text-sm text-muted-foreground">
                          {server.status.charAt(0).toUpperCase() + server.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="relative h-64 rounded-lg overflow-hidden">
                        <Image
                          src={server.image}
                          alt={server.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Players</p>
                          <p className="text-lg font-medium">
                            {server.players}/{server.maxPlayers}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Version</p>
                          <p className="text-lg font-medium">{server.version}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-muted-foreground">Server IP</p>
                          <p className="text-lg font-medium">{server.ip}</p>
                        </div>
                      </div>
                      <Button className="w-full" asChild>
                        <Link href={`/servers/${server.id}`}>Join Server</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Features */}
                <Card>
                  <CardHeader>
                    <CardTitle>Server Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2">
                      {server.features.map((feature, index) => (
                        <li key={index} className="text-muted-foreground">
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Rules */}
                <Card>
                  <CardHeader>
                    <CardTitle>Server Rules</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2">
                      {server.rules.map((rule, index) => (
                        <li key={index} className="text-muted-foreground">
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Modpack Info (Minecraft only) */}
                {server.type === "minecraft" && server.modpack && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Modpack Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Name</p>
                          <p className="font-medium">{server.modpack.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Version</p>
                          <p className="font-medium">{server.modpack.version}</p>
                        </div>
                        <Button className="w-full" asChild>
                          <Link href={server.modpack.downloadUrl}>Download Modpack</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Quick Links */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Links</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/forum">Server Forum</Link>
                      </Button>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/community">Discord Community</Link>
                      </Button>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/support">Get Support</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
} 