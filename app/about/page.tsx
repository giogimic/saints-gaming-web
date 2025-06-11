"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EditModeToggle } from "@/components/edit-mode-toggle";
import { useEditMode } from "@/app/contexts/EditModeContext";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface Section {
  id: string;
  title: string;
  content: string;
  features?: string[];
}

interface AboutContent {
  title: string;
  subtitle: string;
  sections: Section[];
}

const defaultContent: AboutContent = {
  title: "About SaintsGaming",
  subtitle: "Your Premier Destination for Modded Multiplayer Gaming",
  sections: [
    {
      id: "1",
      title: "Our Mission",
      content: "At SaintsGaming, we're dedicated to crafting exceptional modded multiplayer experiences that go beyond the ordinary. Our focus is on creating immersive, stable, and engaging environments where players can enjoy their favorite games with carefully curated mods that enhance gameplay without compromising performance.",
      features: [
        "Curated Mod Collections",
        "Performance-Optimized Servers",
        "Active Community Management",
        "Regular Content Updates"
      ]
    },
    {
      id: "2",
      title: "Our Servers",
      content: "Experience gaming at its finest with our premium modded servers. Our ARK: Survival Ascended server features the Omega mod collection, offering an enhanced survival experience with new creatures, items, and mechanics. Our Minecraft server runs the custom SaintsGaming modpack, boasting over 400 carefully selected mods that transform the game into an epic adventure with Cobblemon integration.",
      features: [
        "ARK: Survival Ascended — Omega Modded Experience",
        "Minecraft — 400+ Mods with Cobblemon",
        "High-Performance Hardware",
        "Automated Backups",
        "24/7 Active Moderation"
      ]
    },
    {
      id: "3",
      title: "Our Modpacks",
      content: "Discover our carefully crafted modpacks, each designed for a unique gaming experience. The SaintsGaming Modpack transforms Minecraft into an epic adventure with new dimensions, creatures, and mechanics. Dimensional Cobblemon brings the Pokémon experience to Minecraft with custom regions and features. Holy Crop! revolutionizes Stardew Valley with new crops, mechanics, and automation options.",
      features: [
        "SaintsGaming Modpack — Epic Minecraft Adventure",
        "Dimensional Cobblemon — Pokémon in Minecraft",
        "Holy Crop! — Stardew Valley Enhanced",
        "Monthly Content Updates",
        "CurseForge Integration"
      ]
    },
    {
      id: "4",
      title: "Join Our Community",
      content: "Become part of our thriving gaming community! Our Discord server is the heart of SaintsGaming, where players connect, share experiences, and get instant support. Join us for regular community events, modpack assistance, and stay updated on server maintenance and new features. Your feedback shapes our future updates and improvements.",
      features: [
        "Active Discord Community",
        "Weekly Community Events",
        "Expert Modpack Support",
        "Real-time Server Updates",
        "Community-Driven Development"
      ]
    }
  ]
};

// Helper function to ensure string values
const ensureString = (value: any): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    if ('content' in value) return String(value.content);
    if ('title' in value) return String(value.title);
    return JSON.stringify(value);
  }
  return String(value);
};

export default function AboutPage() {
  const { isEditMode, canEdit } = useEditMode();
  const { toast } = useToast();
  const [content, setContent] = useState<AboutContent>(defaultContent);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetch('/api/content/about');
        if (response.ok) {
          const data = await response.json();
          if (data.content) {
            try {
              const parsedContent = JSON.parse(data.content);
              // Ensure all fields are strings
              const safeContent = {
                title: ensureString(parsedContent.title || defaultContent.title),
                subtitle: ensureString(parsedContent.subtitle || defaultContent.subtitle),
                sections: Array.isArray(parsedContent.sections) 
                  ? parsedContent.sections.map((section: any) => ({
                      id: ensureString(section.id),
                      title: ensureString(section.title),
                      content: ensureString(section.content),
                      features: Array.isArray(section.features) 
                        ? section.features.map(ensureString)
                        : []
                    }))
                  : defaultContent.sections
              };
              setContent(safeContent);
            } catch (error) {
              console.error('Error parsing content:', error);
              setContent(defaultContent);
            }
          }
        }
      } catch (error) {
        console.error('Error loading content:', error);
        setContent(defaultContent);
      } finally {
        setIsLoading(false);
      }
    };
    loadContent();
  }, []);

  const saveContent = async () => {
    try {
      const response = await fetch('/api/content/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageId: 'about',
          content: JSON.stringify(content),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save content');
      }

      toast({
        title: "Success",
        description: "Content saved successfully",
      });
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "Error",
        description: "Failed to save content",
        variant: "destructive",
      });
    }
  };

  const handleSave = (field: keyof AboutContent, value: string) => {
    setContent((prevContent: AboutContent) => ({
      ...prevContent,
      [field]: ensureString(value),
    }));
    saveContent();
  };

  const handleSectionUpdate = (sectionId: string, field: keyof Section, value: string | string[]) => {
    setContent((prevContent: AboutContent) => ({
      ...prevContent,
      sections: prevContent.sections.map((section) =>
        section.id === sectionId 
          ? { 
              ...section, 
              [field]: Array.isArray(value) 
                ? value.map(ensureString)
                : ensureString(value)
            } 
          : section
      ),
    }));
    saveContent();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="h-6 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>
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
                  value={ensureString(content.title)}
                  onChange={(e) => handleSave("title", e.target.value)}
                  className="text-4xl font-bold"
                />
              ) : (
                ensureString(content.title)
              )}
            </CardTitle>
            <CardDescription className="text-xl mt-2">
              {isEditMode && canEdit ? (
                <Input
                  value={ensureString(content.subtitle)}
                  onChange={(e) => handleSave("subtitle", e.target.value)}
                  className="text-xl"
                />
              ) : (
                ensureString(content.subtitle)
              )}
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 gap-6">
          {content.sections.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle>
                  {isEditMode && canEdit ? (
                    <Input
                      value={ensureString(section.title)}
                      onChange={(e) => handleSectionUpdate(section.id, "title", e.target.value)}
                    />
                  ) : (
                    ensureString(section.title)
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isEditMode && canEdit ? (
                    <Textarea
                      value={ensureString(section.content)}
                      onChange={(e) => handleSectionUpdate(section.id, "content", e.target.value)}
                    />
                  ) : (
                    <p className="text-muted-foreground">{ensureString(section.content)}</p>
                  )}
                  {section.features && (
                    <div className="flex flex-wrap gap-2">
                      {section.features.map((feature, index) => (
                        <Badge key={index} variant="secondary">
                          {ensureString(feature)}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 