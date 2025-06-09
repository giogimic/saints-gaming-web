"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { hasPermission } from "@/lib/permissions";

interface SocialLink {
  platform: string;
  url: string;
}

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    socialLinks: [] as SocialLink[]
  });

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || "",
      }));

      // Fetch user profile data including social links
      fetch("/api/user/profile")
        .then(res => res.json())
        .then(data => {
          if (data.socialLinks) {
            setFormData(prev => ({
              ...prev,
              socialLinks: data.socialLinks
            }));
          }
        })
        .catch(error => {
          console.error("Error fetching profile:", error);
          toast({
            title: "Error",
            description: "Failed to load profile data",
            variant: "destructive"
          });
        });
    }
  }, [session]);

  if (!session) {
    router.push("/auth/signin");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      await update();
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addSocialLink = () => {
    setFormData(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: "", url: "" }]
    }));
  };

  const removeSocialLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }));
  };

  const updateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your account settings and preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
              />
            </div>

            {/* Social Links Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Social Links</Label>
                <Button type="button" variant="outline" onClick={addSocialLink} disabled={loading}>
                  Add Social Link
                </Button>
              </div>
              {formData.socialLinks.map((link, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label>Platform</Label>
                    <Input
                      value={link.platform}
                      onChange={(e) => updateSocialLink(index, "platform", e.target.value)}
                      placeholder="e.g., Twitter, Discord, Steam"
                      disabled={loading}
                    />
                  </div>
                  <div className="flex-1">
                    <Label>URL</Label>
                    <Input
                      value={link.url}
                      onChange={(e) => updateSocialLink(index, "url", e.target.value)}
                      placeholder="https://..."
                      disabled={loading}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeSocialLink(index)}
                    disabled={loading}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                disabled={loading}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Role: {session.user.role}
          </div>
          {session.user.steamId && (
            <div className="text-sm text-muted-foreground">
              Steam ID: {session.user.steamId}
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 