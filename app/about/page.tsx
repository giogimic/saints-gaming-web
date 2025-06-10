"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { UserRole } from "@/lib/permissions";
import { Loader2, Edit2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { useEditMode } from "@/components/admin-widget";
import { EditableText } from "@/app/components/editable-text";

interface EditableContent {
  id: string;
  content: string;
  type: 'text' | 'image';
}

export default function AboutPage() {
  const { data: session } = useSession();
  const isEditMode = useEditMode();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageId, setPageId] = useState<string | null>(null);

  // All editable content
  const [editableContent, setEditableContent] = useState<Record<string, EditableContent>>({
    heroTitle: { id: 'heroTitle', content: 'About Saints Gaming', type: 'text' },
    heroSubtitle: { id: 'heroSubtitle', content: 'Your Ultimate Gaming Community', type: 'text' },
    welcomeMessage: { id: 'welcomeMessage', content: 'Welcome to Saints Gaming, your ultimate gaming community!', type: 'text' },
    missionTitle: { id: 'missionTitle', content: 'Our Mission', type: 'text' },
    missionContent: { id: 'missionContent', content: 'To create an inclusive and engaging gaming environment where players can connect, compete, and create lasting friendships.', type: 'text' },
    serverTitle: { id: 'serverTitle', content: 'Our Servers', type: 'text' },
    serverDescription: { id: 'serverDescription', content: 'Join our thriving community across multiple game servers:', type: 'text' },
    arkTitle: { id: 'arkTitle', content: 'ARK: Survival Ascended', type: 'text' },
    arkDescription: { id: 'arkDescription', content: 'Experience the ultimate survival adventure in our ARK server.', type: 'text' },
    minecraftTitle: { id: 'minecraftTitle', content: 'Minecraft', type: 'text' },
    minecraftDescription: { id: 'minecraftDescription', content: 'Build, explore, and survive in our Minecraft world.', type: 'text' },
  });

  const canEdit = session?.user?.role && [UserRole.ADMIN, UserRole.MODERATOR].includes(session.user.role);

  useEffect(() => {
    fetchPageContent();
  }, []);

  const fetchPageContent = async () => {
    try {
      const response = await fetch("/api/pages?slug=about");
      if (!response.ok) throw new Error("Failed to fetch page content");
      const data = await response.json();
      
      // Store the page ID for updates
      setPageId(data.id);
      
      // Parse the content if it's a string
      const content = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
      
      // Update editableContent with fetched data
      setEditableContent(prev => ({
        ...prev,
        ...Object.entries(content).reduce((acc, [key, value]) => ({
          ...acc,
          [key]: { id: key, content: value as string, type: 'text' }
        }), {})
      }));
    } catch (error) {
      console.error("Error fetching page content:", error);
      toast({
        title: "Error",
        description: "Failed to load page content",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentEdit = async (id: string, newContent: string) => {
    if (!pageId) return;

    // Update local state
    setEditableContent(prev => ({
      ...prev,
      [id]: { ...prev[id], content: newContent }
    }));

    // Save to database
    try {
      const response = await fetch("/api/pages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: pageId,
          content: {
            [id]: newContent
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save changes");
      }

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
    <div className="min-h-screen bg-gradient-to-br from-muted/50 to-background py-0">
      {/* Hero Section */}
      <section className="relative w-full bg-gradient-to-r from-blue-900 via-blue-700 to-blue-600 text-white py-16 mb-12 shadow-lg overflow-hidden">
        <div className="container mx-auto px-4 flex flex-col items-center text-center relative z-10">
          <EditableText
            value={editableContent.heroTitle.content}
            onSave={(value) => handleContentEdit('heroTitle', value)}
            className="text-5xl font-extrabold tracking-tight mb-2 drop-shadow-lg"
          />
          <EditableText
            value={editableContent.heroSubtitle.content}
            onSave={(value) => handleContentEdit('heroSubtitle', value)}
            className="text-xl text-blue-100 mb-8 max-w-2xl"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 to-blue-600/40 z-0" />
      </section>

      <div className="container mx-auto px-4 pb-16">
        {/* Welcome Message */}
        <section className="mb-10">
          <Card className="bg-white/90 border-0 shadow-lg rounded-xl p-6">
            <EditableText
              value={editableContent.welcomeMessage.content}
              onSave={(value) => handleContentEdit('welcomeMessage', value)}
              className="text-xl font-semibold text-gray-800"
            />
          </Card>
        </section>

        {/* Mission Statement */}
        <section className="mb-12">
          <Card className="bg-white/90 border-0 shadow-lg rounded-xl p-6">
            <CardHeader>
              <CardTitle>
                <EditableText
                  value={editableContent.missionTitle.content}
                  onSave={(value) => handleContentEdit('missionTitle', value)}
                  className="text-2xl font-bold text-blue-800"
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EditableText
                value={editableContent.missionContent.content}
                onSave={(value) => handleContentEdit('missionContent', value)}
                className="text-lg text-gray-700"
              />
            </CardContent>
          </Card>
        </section>

        {/* Server Details */}
        <section className="mb-12">
          <Card className="bg-white/90 border-0 shadow-lg rounded-xl p-6">
            <CardHeader>
              <CardTitle>
                <EditableText
                  value={editableContent.serverTitle.content}
                  onSave={(value) => handleContentEdit('serverTitle', value)}
                  className="text-2xl font-bold text-blue-800"
                />
              </CardTitle>
              <CardDescription>
                <EditableText
                  value={editableContent.serverDescription.content}
                  onSave={(value) => handleContentEdit('serverDescription', value)}
                  className="text-lg text-gray-700"
                />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ARK Server */}
                <Card className="bg-white border border-gray-200 rounded-lg p-4">
                  <CardHeader>
                    <CardTitle>
                      <EditableText
                        value={editableContent.arkTitle.content}
                        onSave={(value) => handleContentEdit('arkTitle', value)}
                        className="text-xl font-semibold text-blue-800"
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EditableText
                      value={editableContent.arkDescription.content}
                      onSave={(value) => handleContentEdit('arkDescription', value)}
                      className="text-gray-700"
                    />
                    <Button className="mt-4" asChild>
                      <Link href="/servers/ark">Learn More</Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Minecraft Server */}
                <Card className="bg-white border border-gray-200 rounded-lg p-4">
                  <CardHeader>
                    <CardTitle>
                      <EditableText
                        value={editableContent.minecraftTitle.content}
                        onSave={(value) => handleContentEdit('minecraftTitle', value)}
                        className="text-xl font-semibold text-blue-800"
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EditableText
                      value={editableContent.minecraftDescription.content}
                      onSave={(value) => handleContentEdit('minecraftDescription', value)}
                      className="text-gray-700"
                    />
                    <Button className="mt-4" asChild>
                      <Link href="/servers/minecraft">Learn More</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white border-0 shadow-lg rounded-xl p-8">
            <CardHeader>
              <CardTitle className="text-3xl font-bold mb-4">Join Our Community Today!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg mb-6">Experience the best gaming community with Saints Gaming.</p>
              <div className="flex justify-center gap-4">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/servers">Join Our Servers</Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20" asChild>
                  <Link href="/community">Join Community</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
} 