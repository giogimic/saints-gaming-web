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

export default function SiteSettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<SettingsFormData | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        if (!response.ok) throw new Error("Failed to fetch settings");
        const data = await response.json();
        setSettings(data);
        reset(data);
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
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Site Settings</h1>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="servers">Servers</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    {...register("siteName")}
                    defaultValue={settings.siteName}
                  />
                  {errors.siteName && (
                    <p className="text-sm text-red-500">{errors.siteName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    {...register("siteDescription")}
                    defaultValue={settings.siteDescription}
                  />
                  {errors.siteDescription && (
                    <p className="text-sm text-red-500">{errors.siteDescription.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo">Logo URL</Label>
                  <Input
                    id="logo"
                    {...register("logo")}
                    defaultValue={settings.logo}
                  />
                  {errors.logo && (
                    <p className="text-sm text-red-500">{errors.logo.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme.primary">Primary Color</Label>
                  <Input
                    id="theme.primary"
                    {...register("theme.primary")}
                    defaultValue={settings.theme?.primary}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="theme.secondary">Secondary Color</Label>
                  <Input
                    id="theme.secondary"
                    {...register("theme.secondary")}
                    defaultValue={settings.theme?.secondary}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="theme.accent">Accent Color</Label>
                  <Input
                    id="theme.accent"
                    {...register("theme.accent")}
                    defaultValue={settings.theme?.accent}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="social.discord">Discord URL</Label>
                  <Input
                    id="social.discord"
                    {...register("social.discord")}
                    defaultValue={settings.social?.discord}
                  />
                  {errors.social?.discord && (
                    <p className="text-sm text-red-500">{errors.social.discord.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="social.twitter">Twitter URL</Label>
                  <Input
                    id="social.twitter"
                    {...register("social.twitter")}
                    defaultValue={settings.social?.twitter}
                  />
                  {errors.social?.twitter && (
                    <p className="text-sm text-red-500">{errors.social.twitter.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="social.youtube">YouTube URL</Label>
                  <Input
                    id="social.youtube"
                    {...register("social.youtube")}
                    defaultValue={settings.social?.youtube}
                  />
                  {errors.social?.youtube && (
                    <p className="text-sm text-red-500">{errors.social.youtube.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="servers">
            <Card>
              <CardHeader>
                <CardTitle>Server Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {settings.servers?.map((server, index) => (
                  <div key={index} className="space-y-4 p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor={`servers.${index}.name`}>Server Name</Label>
                      <Input
                        id={`servers.${index}.name`}
                        {...register(`servers.${index}.name`)}
                        defaultValue={server.name}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`servers.${index}.address`}>Server Address</Label>
                      <Input
                        id={`servers.${index}.address`}
                        {...register(`servers.${index}.address`)}
                        defaultValue={server.address}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`servers.${index}.port`}>Port</Label>
                      <Input
                        type="number"
                        id={`servers.${index}.port`}
                        {...register(`servers.${index}.port`, { valueAsNumber: true })}
                        defaultValue={server.port}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`servers.${index}.type`}>Server Type</Label>
                      <Input
                        id={`servers.${index}.type`}
                        {...register(`servers.${index}.type`)}
                        defaultValue={server.type}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle>Feature Toggles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="features.enableBlog">Enable Blog</Label>
                  <Switch
                    id="features.enableBlog"
                    {...register("features.enableBlog")}
                    defaultChecked={settings.features?.enableBlog}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="features.enableEvents">Enable Events</Label>
                  <Switch
                    id="features.enableEvents"
                    {...register("features.enableEvents")}
                    defaultChecked={settings.features?.enableEvents}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="features.enableGallery">Enable Gallery</Label>
                  <Switch
                    id="features.enableGallery"
                    {...register("features.enableGallery")}
                    defaultChecked={settings.features?.enableGallery}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Mode</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="maintenance.enabled">Enable Maintenance Mode</Label>
                  <Switch
                    id="maintenance.enabled"
                    {...register("maintenance.enabled")}
                    defaultChecked={settings.maintenance?.enabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maintenance.message">Maintenance Message</Label>
                  <Textarea
                    id="maintenance.message"
                    {...register("maintenance.message")}
                    defaultValue={settings.maintenance?.message}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 