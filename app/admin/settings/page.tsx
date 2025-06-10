"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { UserRole } from "@/lib/permissions";

const settingsSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  siteDescription: z.string().optional(),
  logo: z.string().url("Must be a valid URL").optional(),
  theme: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
    accent: z.string().optional(),
  }).optional(),
  social: z.object({
    discord: z.string().url("Must be a valid URL").optional(),
    twitter: z.string().url("Must be a valid URL").optional(),
    youtube: z.string().url("Must be a valid URL").optional(),
  }).optional(),
  servers: z.array(z.object({
    name: z.string(),
    address: z.string(),
    port: z.number(),
    type: z.string(),
  })).optional(),
  features: z.object({
    enableBlog: z.boolean().optional(),
    enableEvents: z.boolean().optional(),
    enableGallery: z.boolean().optional(),
  }).optional(),
  maintenance: z.object({
    enabled: z.boolean().optional(),
    message: z.string().optional(),
  }).optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function AdminSettings() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<SettingsFormData | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  });
  const [siteName, setSiteName] = useState("Saints Gaming");
  const [siteDescription, setSiteDescription] = useState("Welcome to Saints Gaming!");
  const [isEditing, setIsEditing] = useState(false);
  const [tempSiteName, setTempSiteName] = useState(siteName);
  const [tempSiteDescription, setTempSiteDescription] = useState(siteDescription);

  const canEdit = session?.user?.role && [UserRole.ADMIN, UserRole.MODERATOR].includes(session.user.role);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        if (!response.ok) throw new Error("Failed to fetch settings");
        const data = await response.json();
        setSettings(data);
        reset(data);
        setSiteName(data.siteName);
        setSiteDescription(data.siteDescription);
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [reset]);

  const onSubmit = async (data: SettingsFormData) => {
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update settings");

      toast.success("Settings updated successfully");
      router.refresh();
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTempSiteName(siteName);
    setTempSiteDescription(siteDescription);
  };

  const handleSave = () => {
    setSiteName(tempSiteName);
    setSiteDescription(tempSiteDescription);
    setIsEditing(false);
    toast({
      title: "Success",
      description: "Site settings updated successfully",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempSiteName(siteName);
    setTempSiteDescription(siteDescription);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Failed to load settings</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Admin Settings</h1>
      <div className="mb-8">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Site Name</label>
              <Input
                value={tempSiteName}
                onChange={(e) => setTempSiteName(e.target.value)}
                placeholder="Enter site name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Site Description</label>
              <Input
                value={tempSiteDescription}
                onChange={(e) => setTempSiteDescription(e.target.value)}
                placeholder="Enter site description"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave}>Save</Button>
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Site Name</label>
              <p className="text-xl">{siteName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Site Description</label>
              <p className="text-xl">{siteDescription}</p>
            </div>
            {canEdit && (
              <Button variant="ghost" size="sm" onClick={handleEdit}>
                Edit
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 