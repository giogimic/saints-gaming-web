"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { UserRole } from "@/lib/permissions";
import { Loader2, Edit2, Users, Calendar, Clock, Gamepad2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEditMode } from "@/components/admin-widget";
import Link from "next/link";

interface EditableContent {
  id: string;
  content: string;
  type: 'text';
}

export default function HomePage() {
  const { data: session } = useSession();
  const isEditMode = useEditMode();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageId, setPageId] = useState<string | null>(null);
  const [pageContent, setPageContent] = useState<any>(null);

  // All editable content
  const [editableContent, setEditableContent] = useState<Record<string, EditableContent>>({
    heroTitle: { id: 'heroTitle', content: 'Welcome to Saints Gaming', type: 'text' },
    heroSubtitle: { id: 'heroSubtitle', content: 'Your ultimate gaming community', type: 'text' },
    joinServers: { id: 'joinServers', content: 'Join Our Servers', type: 'text' },
    joinCommunity: { id: 'joinCommunity', content: 'Join Community', type: 'text' },
    welcomeMessage: { id: 'welcomeMessage', content: 'Welcome to Saints Gaming!', type: 'text' },
    ourServers: { id: 'ourServers', content: 'Our Servers', type: 'text' },
    arkTitle: { id: 'arkTitle', content: 'ARK: Survival Ascended', type: 'text' },
    arkDesc: { id: 'arkDesc', content: 'Join our ARK: Survival Ascended server for an epic survival experience!', type: 'text' },
    arkStatus: { id: 'arkStatus', content: 'Online', type: 'text' },
    arkPlayers: { id: 'arkPlayers', content: '24/50', type: 'text' },
    arkVersion: { id: 'arkVersion', content: 'v1.0', type: 'text' },
    arkIP: { id: 'arkIP', content: 'ark.saintsgaming.com', type: 'text' },
    arkJoin: { id: 'arkJoin', content: 'Join Server', type: 'text' },
    mcTitle: { id: 'mcTitle', content: 'Minecraft', type: 'text' },
    mcDesc: { id: 'mcDesc', content: 'Explore our Minecraft server with custom modpacks and unique features!', type: 'text' },
    mcStatus: { id: 'mcStatus', content: 'Online', type: 'text' },
    mcPlayers: { id: 'mcPlayers', content: '15/30', type: 'text' },
    mcVersion: { id: 'mcVersion', content: '1.20.1', type: 'text' },
    mcIP: { id: 'mcIP', content: 'mc.saintsgaming.com', type: 'text' },
    mcJoin: { id: 'mcJoin', content: 'Join Server', type: 'text' },
    whyChoose: { id: 'whyChoose', content: 'Why Choose Saints Gaming?', type: 'text' },
    feature1Title: { id: 'feature1Title', content: 'Active Community', type: 'text' },
    feature1Desc: { id: 'feature1Desc', content: 'Join our vibrant community of gamers and make new friends!', type: 'text' },
    feature2Title: { id: 'feature2Title', content: 'Regular Events', type: 'text' },
    feature2Desc: { id: 'feature2Desc', content: 'Participate in weekly events and win amazing prizes!', type: 'text' },
    feature3Title: { id: 'feature3Title', content: '24/7 Support', type: 'text' },
    feature3Desc: { id: 'feature3Desc', content: 'Our staff is always here to help you with any issues!', type: 'text' },
  });

  const canEdit = session?.user?.role && [UserRole.ADMIN, UserRole.MODERATOR].includes(session.user.role);

  useEffect(() => {
    const fetchPageContent = async () => {
      try {
        const response = await fetch("/api/pages?slug=home");
        if (!response.ok) {
          throw new Error("Failed to fetch page content");
        }
        const data = await response.json();
        setPageContent(data);
        
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

    fetchPageContent();
  }, []);

  const handleContentEdit = (id: string, newContent: string) => {
    setEditableContent(prev => ({
      ...prev,
      [id]: { ...prev[id], content: newContent }
    }));
  };

  const handleSaveAll = async () => {
    if (!pageId) {
      toast({
        title: "Error",
        description: "Page ID not found",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert editableContent to a simple object
      const content = Object.entries(editableContent).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: value.content
      }), {});

      const response = await fetch("/api/pages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: pageId,
          content,
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
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const { data: session } = useSession();
    const isEditMode = useEditMode();
    const canEdit = session?.user?.role && [UserRole.ADMIN, UserRole.MODERATOR].includes(session.user.role);

    useEffect(() => {
      if (editableContent[id]) {
        setText(editableContent[id].content);
      }
    }, [editableContent, id]);

    const handleSave = async () => {
      if (!pageId) return;
      
      setIsSaving(true);
      try {
        const updatedContent = { ...editableContent, [id]: { ...editableContent[id], content: text } };
        setEditableContent(updatedContent);

        const response = await fetch("/api/pages", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: pageId,
            content: Object.entries(updatedContent).reduce((acc, [key, value]) => ({
              ...acc,
              [key]: value.content
            }), {}),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save changes");
        }

        setIsEditing(false);
      } catch (error) {
        console.error("Error saving changes:", error);
        toast({
          title: "Error",
          description: "Failed to save changes",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    };

    if (!canEdit || !isEditMode) {
      return <span className={className}>{text}</span>;
    }

    if (isEditing) {
      return (
        <div className="relative inline-flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className={`${className} bg-background border rounded px-2 py-1`}
            onBlur={() => !isSaving && setIsEditing(false)}
            autoFocus
          />
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-2 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      );
    }

    return (
      <span
        className={`${className} cursor-pointer hover:bg-accent/10 rounded px-1`}
        onClick={() => setIsEditing(true)}
      >
        {text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/50 to-background">
      {/* Hero Section */}
      <section className="relative w-full bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground py-20 mb-12 shadow-lg overflow-hidden">
        <div className="container mx-auto px-4 flex flex-col items-center text-center relative z-10">
          <Gamepad2 className="h-16 w-16 mb-6 text-primary-foreground/90" />
          <EditableText id="heroTitle" className="text-5xl font-extrabold tracking-tight mb-4 drop-shadow-lg" />
          <EditableText id="heroSubtitle" className="text-xl font-medium opacity-90 mb-8 max-w-2xl mx-auto" />
          <div className="flex gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/servers">
                <EditableText id="joinServers" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-primary-foreground/10 hover:bg-primary-foreground/20" asChild>
              <Link href="/community">
                <EditableText id="joinCommunity" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/60 to-primary/40 z-0" />
      </section>

      <div className="container mx-auto px-4 pb-16">
        {/* Welcome Message */}
        <section className="mb-12">
          <Card className="bg-card border-0 shadow-lg rounded-xl p-6">
            <EditableText id="welcomeMessage" className="text-2xl font-semibold text-card-foreground" />
          </Card>
        </section>

        {/* Our Servers */}
        <section className="mb-16">
          <Card className="bg-card border-0 shadow-lg rounded-xl p-6">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-card-foreground">
                <EditableText id="ourServers" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* ARK Server */}
                <Card className="bg-card border shadow-md rounded-xl p-6">
                  <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-card-foreground">
                      <EditableText id="arkTitle" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EditableText id="arkDesc" className="text-card-foreground/80 mb-6" />
                    <div className="flex flex-wrap gap-4 mb-6 text-sm">
                      <span className="text-green-500 font-semibold"><EditableText id="arkStatus" /></span>
                      <span className="text-card-foreground/70"><EditableText id="arkPlayers" /></span>
                      <span className="text-card-foreground/70"><EditableText id="arkVersion" /></span>
                      <span className="text-card-foreground/70"><EditableText id="arkIP" /></span>
                    </div>
                    <Button className="w-full" asChild>
                      <Link href="/servers/ark">
                        <EditableText id="arkJoin" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
                {/* Minecraft Server */}
                <Card className="bg-card border shadow-md rounded-xl p-6">
                  <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-card-foreground">
                      <EditableText id="mcTitle" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EditableText id="mcDesc" className="text-card-foreground/80 mb-6" />
                    <div className="flex flex-wrap gap-4 mb-6 text-sm">
                      <span className="text-green-500 font-semibold"><EditableText id="mcStatus" /></span>
                      <span className="text-card-foreground/70"><EditableText id="mcPlayers" /></span>
                      <span className="text-card-foreground/70"><EditableText id="mcVersion" /></span>
                      <span className="text-card-foreground/70"><EditableText id="mcIP" /></span>
                    </div>
                    <Button className="w-full" asChild>
                      <Link href="/servers/minecraft">
                        <EditableText id="mcJoin" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Why Choose Section */}
        <section className="mb-16">
          <Card className="bg-card border-0 shadow-lg rounded-xl p-6">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-card-foreground">
                <EditableText id="whyChoose" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center text-center p-6 bg-card border rounded-xl shadow-sm">
                  <Users className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-3 text-card-foreground">
                    <EditableText id="feature1Title" />
                  </h3>
                  <p className="text-card-foreground/80">
                    <EditableText id="feature1Desc" />
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-6 bg-card border rounded-xl shadow-sm">
                  <Calendar className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-3 text-card-foreground">
                    <EditableText id="feature2Title" />
                  </h3>
                  <p className="text-card-foreground/80">
                    <EditableText id="feature2Desc" />
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-6 bg-card border rounded-xl shadow-sm">
                  <Clock className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-3 text-card-foreground">
                    <EditableText id="feature3Title" />
                  </h3>
                  <p className="text-card-foreground/80">
                    <EditableText id="feature3Desc" />
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {isEditMode && canEdit && (
          <div className="fixed bottom-24 right-4 z-50">
            <Button onClick={handleSaveAll} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}