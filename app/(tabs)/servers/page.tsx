"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { EditModeToggle } from "@/components/edit-mode-toggle";
import { usePageContent } from "@/app/hooks/usePageContent";

interface Server {
  id: string;
  title: string;
  description: string;
  maxPlayers: number;
  mods: string[];
  imageUrl: string;
  status: "online" | "offline" | "maintenance";
  connectionInfo: string;
}

interface ServersContent {
  title: string;
  subtitle: string;
  servers: Server[];
}

const defaultContent: ServersContent = {
  title: "Our Servers",
  subtitle: "Join our modded multiplayer experiences",
  servers: [
    {
      id: "1",
      title: "ARK: Survival Ascended — Omega Modded Server",
      description: "PvE server running Ark Omega (Hexen) and 20+ structural/content/QOL mods",
      maxPlayers: 70,
      mods: [
        "Death Inventory Keeper",
        "Dino Storage",
        "Auto Doors",
        "Creature Finder"
      ],
      imageUrl: "/imgs/ark.jpg",
      status: "online",
      connectionInfo: "Search for 'Saints' in the in-game server browser to join. Direct connection is not available for modded servers."
    },
    {
      id: "2",
      title: "Minecraft — SaintsGaming Modpack",
      description: "MC Version: 1.21.1, NeoForge, 400+ mods including Cobblemon, Better Combat, Immersive Portals, and Parkour",
      maxPlayers: 100,
      mods: [
        "Cobblemon",
        "Better Combat",
        "Immersive Portals",
        "Parkour"
      ],
      imageUrl: "/imgs/minecraft.jpg",
      status: "online",
      connectionInfo: "Join through the server button in the main menu after installing the modpack from CurseForge."
    }
  ]
};

export default function ServersPage() {
  const {
    content,
    isLoading,
    isEditMode,
    canEdit,
    handleSave,
    handleNestedSave,
  } = usePageContent({
    pageId: "servers",
    defaultContent,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {canEdit && <EditModeToggle />}
      
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-4xl font-bold">
              {isEditMode && canEdit ? (
                <Input
                  value={content.title}
                  onChange={(e) => handleSave("title", e.target.value)}
                  className="text-4xl font-bold"
                />
              ) : (
                content.title
              )}
            </CardTitle>
            <CardDescription className="text-xl mt-2">
              {isEditMode && canEdit ? (
                <Input
                  value={content.subtitle}
                  onChange={(e) => handleSave("subtitle", e.target.value)}
                  className="text-xl"
                />
              ) : (
                content.subtitle
              )}
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {content.servers.map((server: Server) => (
            <Card key={server.id} className="overflow-hidden">
              <div className="relative h-48 w-full">
                <Image
                  src={server.imageUrl}
                  alt={server.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Badge
                    variant={server.status === "online" ? "default" : "destructive"}
                    className="bg-primary/90"
                  >
                    {server.status}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle>
                  {isEditMode && canEdit ? (
                    <Input
                      value={server.title}
                      onChange={(e) => handleNestedSave("servers", server.id, "title", e.target.value)}
                    />
                  ) : (
                    server.title
                  )}
                </CardTitle>
                <CardDescription>
                  {isEditMode && canEdit ? (
                    <Input
                      value={server.description}
                      onChange={(e) => handleNestedSave("servers", server.id, "description", e.target.value)}
                    />
                  ) : (
                    server.description
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Mods:</h4>
                    <div className="flex flex-wrap gap-2">
                      {server.mods.map((mod: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {isEditMode && canEdit ? (
                            <Input
                              value={mod}
                              onChange={(e) => {
                                const newMods = [...server.mods];
                                newMods[index] = e.target.value;
                                handleNestedSave("servers", server.id, "mods", newMods);
                              }}
                              className="h-6 px-2"
                            />
                          ) : (
                            mod
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      Max Players: {server.maxPlayers}
                    </Badge>
                    {isEditMode && canEdit && (
                      <Input
                        type="number"
                        value={server.maxPlayers}
                        onChange={(e) => handleNestedSave("servers", server.id, "maxPlayers", parseInt(e.target.value))}
                        className="w-24"
                      />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isEditMode && canEdit ? (
                      <Input
                        value={server.connectionInfo}
                        onChange={(e) => handleNestedSave("servers", server.id, "connectionInfo", e.target.value)}
                      />
                    ) : (
                      server.connectionInfo
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 