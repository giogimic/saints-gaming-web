"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { EditModeToggle } from "@/components/edit-mode-toggle";
import { usePageContent } from "@/app/hooks/usePageContent";

interface Modpack {
  id: string;
  title: string;
  description: string;
  type: string;
  imageUrl: string;
  features: string[];
  tags: string[];
  curseForgeUrl: string;
}

interface ModpacksContent {
  title: string;
  subtitle: string;
  modpacks: Modpack[];
}

const defaultContent: ModpacksContent = {
  title: "Our Modpacks",
  subtitle: "Curated modpacks for the best gaming experience",
  modpacks: [
    {
      id: "1",
      title: "SaintsGaming Modpack",
      description: "Our flagship modpack featuring 400+ mods, including Cobblemon integration, enhanced world generation, and quality-of-life improvements.",
      type: "Minecraft",
      imageUrl: "/imgs/saintsgamingmc.jpg",
      features: [
        "400+ Mods",
        "Cobblemon Integration",
        "Enhanced World Gen",
        "QoL Improvements"
      ],
      tags: ["Minecraft", "Cobblemon", "Adventure"],
      curseForgeUrl: "https://www.curseforge.com/minecraft/modpacks/saintsgaming"
    },
    {
      id: "2",
      title: "Dimensional Cobblemon",
      description: "A unique Pokémon-style adventure with dimensional exploration and custom Pokémon mechanics.",
      type: "Minecraft",
      imageUrl: "/imgs/dimensionalcobblemon.jpg",
      features: [
        "Custom Dimensions",
        "Pokémon Mechanics",
        "Adventure Focus",
        "Custom Biomes"
      ],
      tags: ["Minecraft", "Cobblemon", "Adventure"],
      curseForgeUrl: "https://www.curseforge.com/minecraft/modpacks/dimensional-cobblemon"
    },
    {
      id: "3",
      title: "Holy Crop!",
      description: "A comprehensive Stardew Valley modpack focusing on farming automation and visual enhancements.",
      type: "Stardew Valley",
      imageUrl: "/imgs/holycrop.png",
      features: [
        "Farming Automation",
        "Visual Enhancements",
        "New Crops",
        "Quality of Life"
      ],
      tags: ["Stardew Valley", "Farming", "Automation"],
      curseForgeUrl: "https://www.curseforge.com/stardewvalley/modpacks/holy-crop"
    }
  ]
};

export default function ModpacksPage() {
  const {
    content,
    isLoading,
    isEditMode,
    canEdit,
    handleSave,
    handleNestedSave,
  } = usePageContent({
    pageId: "modpacks",
    defaultContent,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {canEdit && <EditModeToggle />}
      
      <div className="space-y-8">
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.modpacks.map((modpack: Modpack) => (
            <Card key={modpack.id} className="overflow-hidden">
              <div className="relative h-48 w-full">
                <Image
                  src={modpack.imageUrl}
                  alt={modpack.title}
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle>
                  {isEditMode && canEdit ? (
                    <Input
                      value={modpack.title}
                      onChange={(e) => handleNestedSave("modpacks", modpack.id, "title", e.target.value)}
                    />
                  ) : (
                    modpack.title
                  )}
                </CardTitle>
                <CardDescription>
                  {isEditMode && canEdit ? (
                    <Input
                      value={modpack.type}
                      onChange={(e) => handleNestedSave("modpacks", modpack.id, "type", e.target.value)}
                    />
                  ) : (
                    modpack.type
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {isEditMode && canEdit ? (
                    <Input
                      value={modpack.description}
                      onChange={(e) => handleNestedSave("modpacks", modpack.id, "description", e.target.value)}
                    />
                  ) : (
                    modpack.description
                  )}
                </p>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Features:</h4>
                    <div className="flex flex-wrap gap-2">
                      {modpack.features.map((feature: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {isEditMode && canEdit ? (
                            <Input
                              value={feature}
                              onChange={(e) => {
                                const newFeatures = [...modpack.features];
                                newFeatures[index] = e.target.value;
                                handleNestedSave("modpacks", modpack.id, "features", newFeatures);
                              }}
                              className="h-6 px-2"
                            />
                          ) : (
                            feature
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Tags:</h4>
                    <div className="flex flex-wrap gap-2">
                      {modpack.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {isEditMode && canEdit ? (
                            <Input
                              value={tag}
                              onChange={(e) => {
                                const newTags = [...modpack.tags];
                                newTags[index] = e.target.value;
                                handleNestedSave("modpacks", modpack.id, "tags", newTags);
                              }}
                              className="h-6 px-2"
                            />
                          ) : (
                            tag
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button asChild className="w-full">
                    <Link href={modpack.curseForgeUrl} target="_blank">
                      Download on CurseForge
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 