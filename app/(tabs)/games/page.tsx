"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { EditModeToggle } from "@/components/edit-mode-toggle";
import { useEditMode } from "@/app/contexts/EditModeContext";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface Game {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  status: "active" | "coming-soon";
  features: string[];
  modpack?: {
    name: string;
    url: string;
  };
}

interface GamesContent {
  title: string;
  subtitle: string;
  games: Game[];
}

const defaultContent: GamesContent = {
  title: "Our Games",
  subtitle: "Modded multiplayer experiences for every player",
  games: [
    {
      id: "1",
      title: "ARK: Survival Ascended",
      description: "Join our Omega modded server for an enhanced PvE experience with quality-of-life improvements and expanded content.",
      imageUrl: "/imgs/saintsgamingmc.jpg",
      status: "active",
      features: [
        "Omega Mod Collection",
        "Enhanced PvE Experience",
        "Quality of Life Mods",
        "Active Community"
      ]
    },
    {
      id: "2",
      title: "Minecraft",
      description: "Experience our custom modpacks featuring Cobblemon, enhanced combat, and immersive portals in a multiplayer environment.",
      imageUrl: "/imgs/dimensionalcobblemon.jpg",
      status: "active",
      features: [
        "Custom Modpacks",
        "Cobblemon Integration",
        "Enhanced Combat",
        "Multiplayer Focus"
      ],
      modpack: {
        name: "SaintsGaming Modpack",
        url: "/modpacks"
      }
    },
    {
      id: "3",
      title: "Stardew Valley",
      description: "Transform your farm with our Holy Crop! modpack, featuring automation, cosmetics, and new features for an enhanced farming experience.",
      imageUrl: "/imgs/holycrop.png",
      status: "active",
      features: [
        "Automation Systems",
        "Visual Enhancements",
        "New Features",
        "Co-op Support"
      ],
      modpack: {
        name: "Holy Crop!",
        url: "/modpacks"
      }
    }
  ]
};

export default function GamesPage() {
  const { isEditMode, canEdit } = useEditMode();
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState<GamesContent>(defaultContent);
  const [pageId, setPageId] = useState<string | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await fetch("/api/content/games");
      if (!response.ok) throw new Error("Failed to fetch content");
      const data = await response.json();
      
      setPageId(data.id);
      const parsedContent = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
      
      // Ensure the content structure is valid
      const safeContent: GamesContent = {
        title: parsedContent.title || defaultContent.title,
        subtitle: parsedContent.subtitle || defaultContent.subtitle,
        games: Array.isArray(parsedContent.games) 
          ? parsedContent.games.map((game: any) => ({
              id: game.id || String(Math.random()),
              title: game.title || '',
              description: game.description || '',
              imageUrl: game.imageUrl || '',
              status: game.status || 'active',
              features: Array.isArray(game.features) ? game.features : [],
              modpack: game.modpack || undefined
            }))
          : defaultContent.games
      };
      
      setContent(safeContent);
    } catch (error) {
      console.error("Error fetching content:", error);
      toast({
        title: "Error",
        description: "Failed to load content. Using default content.",
        variant: "destructive",
      });
      setContent(defaultContent);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (field: keyof GamesContent, value: string) => {
    if (!pageId) return;

    const updatedContent = {
      ...content,
      [field]: value,
    };

    setContent(updatedContent);

    try {
      const response = await fetch("/api/content/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: pageId,
          content: JSON.stringify(updatedContent),
        }),
      });

      if (!response.ok) throw new Error("Failed to save changes");

      toast({
        title: "Success",
        description: "Changes saved successfully",
      });
    } catch (error) {
      console.error("Error saving changes:", error);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    }
  };

  const handleGameUpdate = async (index: number, field: keyof Game, value: string | string[]) => {
    if (!pageId) return;

    const updatedContent = {
      ...content,
      games: content.games.map((game, i) =>
        i === index ? { ...game, [field]: value } : game
      ),
    };

    setContent(updatedContent);

    try {
      const response = await fetch("/api/content/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: pageId,
          content: JSON.stringify(updatedContent),
        }),
      });

      if (!response.ok) throw new Error("Failed to save changes");

      toast({
        title: "Success",
        description: "Changes saved successfully",
      });
    } catch (error) {
      console.error("Error saving changes:", error);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {content.games.map((game, index) => (
            <Card key={game.id}>
              <CardHeader>
                <div className="relative w-full h-[200px] rounded-lg overflow-hidden">
                  {game.imageUrl ? (
                    <Image
                      src={game.imageUrl}
                      alt={game.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">No image available</span>
                    </div>
                  )}
                </div>
                <CardTitle className="mt-4">
                  {isEditMode && canEdit ? (
                    <Input
                      value={game.title}
                      onChange={(e) => handleGameUpdate(index, "title", e.target.value)}
                    />
                  ) : (
                    game.title
                  )}
                </CardTitle>
                <CardDescription>
                  {isEditMode && canEdit ? (
                    <Textarea
                      value={game.description}
                      onChange={(e) => handleGameUpdate(index, "description", e.target.value)}
                    />
                  ) : (
                    game.description
                  )}
                </CardDescription>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(game.features) && game.features.map((feature, featureIndex) => (
                    <Badge key={featureIndex} variant="secondary">
                      {feature}
                    </Badge>
                  ))}
                </div>
                {game.modpack && (
                  <Button asChild className="mt-4">
                    <Link href={game.modpack.url}>
                      View {game.modpack.name}
                    </Link>
                  </Button>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 