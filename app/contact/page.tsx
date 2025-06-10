"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { UserRole } from "@/lib/permissions";
import { Loader2, Mail, MessageSquare, Users, Send, Phone, MapPin, Edit2, Save, X, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEditMode } from "@/components/admin-widget";

interface EditableContent {
  id: string;
  content: string;
  type: 'text' | 'image';
}

export default function ContactPage() {
  const { data: session } = useSession();
  const isEditMode = useEditMode();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // All editable content
  const [editableContent, setEditableContent] = useState<Record<string, EditableContent>>({
    heroTitle: { id: 'heroTitle', content: 'Contact Us', type: 'text' },
    heroSubtitle: { id: 'heroSubtitle', content: "We're here to help! Reach out to the Saints Gaming team with your questions, feedback, or support needs.", type: 'text' },
    welcomeMessage: { id: 'welcomeMessage', content: 'Welcome to the Contact page of Saints Gaming!', type: 'text' },
    formTitle: { id: 'formTitle', content: 'Send us a Message', type: 'text' },
    formDescription: { id: 'formDescription', content: "Have a question or feedback? We'd love to hear from you!", type: 'text' },
    email: { id: 'email', content: 'support@saintsgaming.com', type: 'text' },
    phone: { id: 'phone', content: '(555) 123-4567', type: 'text' },
    location: { id: 'location', content: 'Online Community', type: 'text' },
    discord: { id: 'discord', content: 'Join our Discord server', type: 'text' },
    community: { id: 'community', content: 'Visit our forum', type: 'text' },
  });

  // Contact form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const canEdit = session?.user?.role && [UserRole.ADMIN, UserRole.MODERATOR].includes(session.user.role);

  useEffect(() => {
    fetchPageContent();
  }, []);

  const fetchPageContent = async () => {
    try {
      const response = await fetch("/api/pages?slug=contact");
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
          id: "contact",
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to send message");

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      toast({
        title: "Success",
        description: "Your message has been sent successfully!",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
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
          <div className="flex items-center justify-center mb-4">
            <Mail className="h-12 w-12 text-white drop-shadow-lg" />
          </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 rounded-2xl bg-white/95">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Send className="h-6 w-6" />
                  <EditableText id="formTitle" />
                </CardTitle>
                <CardDescription>
                  <EditableText id="formDescription" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <Input
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Subject</label>
                    <Input
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      placeholder="What's this about?"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Message</label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Your message..."
                      required
                      className="min-h-[150px]"
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-2 rounded-lg shadow">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="bg-white/95 border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Mail className="h-5 w-5" /> Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-700" />
                  <div>
                    <p className="font-medium">Email</p>
                    <EditableText id="email" className="text-sm text-muted-foreground" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-blue-700" />
                  <div>
                    <p className="font-medium">Discord</p>
                    <EditableText id="discord" className="text-sm text-muted-foreground" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-700" />
                  <div>
                    <p className="font-medium">Community</p>
                    <EditableText id="community" className="text-sm text-muted-foreground" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-blue-700" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <EditableText id="phone" className="text-sm text-muted-foreground" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-blue-700" />
                  <div>
                    <p className="font-medium">Location</p>
                    <EditableText id="location" className="text-sm text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Users className="h-5 w-5" /> Support Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monday - Friday</span>
                    <span>9:00 AM - 5:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Saturday</span>
                    <span>10:00 AM - 4:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sunday</span>
                    <span>Closed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 