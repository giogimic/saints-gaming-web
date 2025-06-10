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
      
      // Update editable content with fetched data
      setEditableContent(prev => ({
        ...prev,
        welcomeMessage: { ...prev.welcomeMessage, content: data.content },
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

  const handleContentEdit = (id: string, newContent: string) => {
    setEditableContent(prev => ({
      ...prev,
      [id]: { ...prev[id], content: newContent }
    }));
  };

  const handleSaveAll = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/pages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "about",
          content: editableContent,
        }),
      });

      if (!response.ok) throw new Error("Failed to update page content");

      toast({
        title: "Success",
        description: "Page content updated successfully",
      });
    } catch (error) {
      console.error("Error updating page content:", error);
      toast({
        title: "Error",
        description: "Failed to update page content",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const EditableText = ({ id, className = "" }: { id: string; className?: string }) => {
    const content = editableContent[id];
    if (!content) return null;

    return isEditMode ? (
      <div className="relative group">
        <Input
          value={content.content}
          onChange={(e) => handleContentEdit(id, e.target.value)}
          className={`${className} pr-10`}
        />
        <Edit2 className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
    ) : (
      <p className={className}>{content.content}</p>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/50 to-background py-0">
      {/* Hero Section */}
      <section className="relative w-full bg-gradient-to-r from-blue-900 via-blue-700 to-blue-600 text-white py-16 mb-12 shadow-lg overflow-hidden">
        <div className="container mx-auto px-4 flex flex-col items-center text-center relative z-10">
          <EditableText
            id="heroTitle"
            className="text-5xl font-extrabold tracking-tight mb-2 drop-shadow-lg"
          />
          <EditableText
            id="heroSubtitle"
            className="text-lg font-medium opacity-90 mb-4 max-w-2xl mx-auto"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 to-blue-600/40 z-0" />
      </section>

      <div className="container mx-auto px-4 pb-16">
        {/* Welcome Message */}
        <section className="mb-10">
          <Card className="bg-white/90 border-0 shadow-lg rounded-xl p-6">
            <EditableText
              id="welcomeMessage"
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
                  id="missionTitle"
                  className="text-2xl font-bold text-blue-800"
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EditableText
                id="missionContent"
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
                  id="serverTitle"
                  className="text-2xl font-bold text-blue-800"
                />
              </CardTitle>
              <CardDescription>
                <EditableText
                  id="serverDescription"
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
                        id="arkTitle"
                        className="text-xl font-semibold text-blue-800"
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EditableText
                      id="arkDescription"
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
                        id="minecraftTitle"
                        className="text-xl font-semibold text-blue-800"
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EditableText
                      id="minecraftDescription"
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
              <CardTitle className="text-2xl font-bold">Join Our Community</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg mb-6">
                Ready to start your adventure? Join our community today!
              </p>
              <div className="flex justify-center gap-4">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/servers">View Servers</Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20" asChild>
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
} 