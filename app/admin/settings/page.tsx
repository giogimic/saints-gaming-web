"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRole } from "@/lib/permissions";
import { Settings, Globe, Shield, MessageSquare, Mail } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface SiteSettings {
  general: {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    allowRegistrations: boolean;
  };
  forum: {
    postsPerPage: number;
    allowGuestViewing: boolean;
    requireEmailVerification: boolean;
    maxAttachmentsPerPost: number;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    requireTwoFactor: boolean;
    allowedFileTypes: string[];
  };
  notifications: {
    emailNotifications: boolean;
    notifyOnNewUser: boolean;
    notifyOnReport: boolean;
    notifyOnMention: boolean;
  };
}

export default function SiteSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.role !== UserRole.ADMIN) {
      router.push('/dashboard');
    } else {
      fetchSettings();
    }
  }, [session, status, router]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    setSaving(true);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Failed to save settings');

      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8">
        <Settings className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Site Settings</h1>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">
            <Globe className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="forum">
            <MessageSquare className="h-4 w-4 mr-2" />
            Forum
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Mail className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic site configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.general.siteName}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, siteName: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Input
                  id="siteDescription"
                  value={settings.general.siteDescription}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, siteDescription: e.target.value }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                <Switch
                  id="maintenanceMode"
                  checked={settings.general.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    general: { ...settings.general, maintenanceMode: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="allowRegistrations">Allow Registrations</Label>
                <Switch
                  id="allowRegistrations"
                  checked={settings.general.allowRegistrations}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    general: { ...settings.general, allowRegistrations: checked }
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forum">
          <Card>
            <CardHeader>
              <CardTitle>Forum Settings</CardTitle>
              <CardDescription>Configure forum behavior and limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="postsPerPage">Posts Per Page</Label>
                <Input
                  id="postsPerPage"
                  type="number"
                  value={settings.forum.postsPerPage}
                  onChange={(e) => setSettings({
                    ...settings,
                    forum: { ...settings.forum, postsPerPage: parseInt(e.target.value) }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="allowGuestViewing">Allow Guest Viewing</Label>
                <Switch
                  id="allowGuestViewing"
                  checked={settings.forum.allowGuestViewing}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    forum: { ...settings.forum, allowGuestViewing: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                <Switch
                  id="requireEmailVerification"
                  checked={settings.forum.requireEmailVerification}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    forum: { ...settings.forum, requireEmailVerification: checked }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAttachmentsPerPost">Max Attachments Per Post</Label>
                <Input
                  id="maxAttachmentsPerPost"
                  type="number"
                  value={settings.forum.maxAttachmentsPerPost}
                  onChange={(e) => setSettings({
                    ...settings,
                    forum: { ...settings.forum, maxAttachmentsPerPost: parseInt(e.target.value) }
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and authentication settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: { ...settings.security, maxLoginAttempts: parseInt(e.target.value) }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="requireTwoFactor">Require Two-Factor Authentication</Label>
                <Switch
                  id="requireTwoFactor"
                  checked={settings.security.requireTwoFactor}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    security: { ...settings.security, requireTwoFactor: checked }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allowedFileTypes">Allowed File Types (comma-separated)</Label>
                <Input
                  id="allowedFileTypes"
                  value={settings.security.allowedFileTypes.join(', ')}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: { ...settings.security, allowedFileTypes: e.target.value.split(',').map(type => type.trim()) }
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure email and system notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailNotifications">Enable Email Notifications</Label>
                <Switch
                  id="emailNotifications"
                  checked={settings.notifications.emailNotifications}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, emailNotifications: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="notifyOnNewUser">Notify on New User Registration</Label>
                <Switch
                  id="notifyOnNewUser"
                  checked={settings.notifications.notifyOnNewUser}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, notifyOnNewUser: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="notifyOnReport">Notify on Content Reports</Label>
                <Switch
                  id="notifyOnReport"
                  checked={settings.notifications.notifyOnReport}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, notifyOnReport: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="notifyOnMention">Notify on Mentions</Label>
                <Switch
                  id="notifyOnMention"
                  checked={settings.notifications.notifyOnMention}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, notifyOnMention: checked }
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button
          onClick={handleSaveSettings}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
} 