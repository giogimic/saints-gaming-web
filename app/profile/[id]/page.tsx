'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { User, UserGamingProfile, UserSettings } from "@/lib/types";
import { hasPermission } from "@/lib/permissions";
import md5 from "md5";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const defaultGamingProfile: UserGamingProfile = {
  favoriteGames: [],
  gamingSetup: {
    pc: {
      cpu: "",
      gpu: ""
    }
  },
  gamingPreferences: {
    favoriteGenres: [],
    playStyle: [],
    multiplayer: false,
    competitive: false
  }
};

const defaultSettings: UserSettings = {
  theme: "system",
  notifications: true,
  language: "en",
  timezone: "UTC",
  emailNotifications: true,
  darkMode: false,
  showOnlineStatus: true
};

export default function ProfilePage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    fetchUser();
  }, [params.id]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/user/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch user");
      const data = await response.json();
      // Initialize default values if not present
      setUser({
        ...data,
        gamingProfile: data.gamingProfile || defaultGamingProfile,
        settings: data.settings || defaultSettings
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to load user profile", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!session || !user) return;
    try {
      const response = await fetch(`/api/user/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      if (!response.ok) throw new Error("Failed to update profile");
      toast({ title: "Success", description: "Profile updated successfully" });
      setIsEditing(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    }
  };

  const updateGamingProfile = (updates: Partial<UserGamingProfile>) => {
    if (!user) return;
    const currentProfile = user.gamingProfile || defaultGamingProfile;
    setUser({
      ...user,
      gamingProfile: {
        ...currentProfile,
        ...updates,
        gamingPreferences: {
          ...currentProfile.gamingPreferences,
          ...(updates.gamingPreferences || {})
        }
      }
    });
  };

  const updateSettings = (updates: Partial<UserSettings>) => {
    if (!user) return;
    const currentSettings = user.settings || defaultSettings;
    setUser({
      ...user,
      settings: {
        ...currentSettings,
        ...updates
      }
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  const gravatarUrl = `https://www.gravatar.com/avatar/${md5(user.email)}?d=identicon&s=200`;
  const canEdit = session && (session.user.id === user.id || hasPermission(session.user.role, "manage:users"));
  const gamingProfile = user.gamingProfile || defaultGamingProfile;
  const settings = user.settings || defaultSettings;

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <img src={gravatarUrl} alt={user.name} className="w-20 h-20 rounded-full" />
            <div>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="gaming">Gaming Profile</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={user.bio || ""}
                      onChange={(e) => setUser({ ...user, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="steam">Steam ID</Label>
                    <Input
                      id="steam"
                      value={user.steamId || ""}
                      onChange={(e) => setUser({ ...user, steamId: e.target.value })}
                      placeholder="Steam ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="discord">Discord ID</Label>
                    <Input
                      id="discord"
                      value={user.discordId || ""}
                      onChange={(e) => setUser({ ...user, discordId: e.target.value })}
                      placeholder="Discord ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitch">Twitch Username</Label>
                    <Input
                      id="twitch"
                      value={user.twitchId || ""}
                      onChange={(e) => setUser({ ...user, twitchId: e.target.value })}
                      placeholder="Twitch Username"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave}>Save</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">{user.bio || "No bio provided."}</p>
                  <div className="space-y-2">
                    {user.steamId && (
                      <a href={`https://steamcommunity.com/profiles/${user.steamId}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline block">
                        Steam Profile
                      </a>
                    )}
                    {user.discordId && (
                      <a href={`https://discord.com/users/${user.discordId}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline block">
                        Discord Profile
                      </a>
                    )}
                    {user.twitchId && (
                      <a href={`https://twitch.tv/${user.twitchId}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline block">
                        Twitch Channel
                      </a>
                    )}
                  </div>
                  {canEdit && (
                    <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="gaming">
              {isEditing ? (
                <div className="space-y-6">
                  <div>
                    <Label>Favorite Games</Label>
                    <Textarea
                      value={gamingProfile.favoriteGames.join(", ")}
                      onChange={(e) => updateGamingProfile({
                        favoriteGames: e.target.value.split(",").map(g => g.trim()).filter(Boolean)
                      })}
                      placeholder="Enter your favorite games, separated by commas"
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Gaming Setup</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>CPU</Label>
                        <Input
                          value={gamingProfile.gamingSetup.pc?.cpu || ""}
                          onChange={(e) => updateGamingProfile({
                            gamingSetup: {
                              ...gamingProfile.gamingSetup,
                              pc: {
                                cpu: e.target.value,
                                gpu: gamingProfile.gamingSetup.pc?.gpu || ""
                              }
                            }
                          })}
                          placeholder="CPU Model"
                        />
                      </div>
                      <div>
                        <Label>GPU</Label>
                        <Input
                          value={gamingProfile.gamingSetup.pc?.gpu || ""}
                          onChange={(e) => updateGamingProfile({
                            gamingSetup: {
                              ...gamingProfile.gamingSetup,
                              pc: {
                                cpu: gamingProfile.gamingSetup.pc?.cpu || "",
                                gpu: e.target.value
                              }
                            }
                          })}
                          placeholder="GPU Model"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Gaming Preferences</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Favorite Genres</Label>
                        <Textarea
                          value={gamingProfile.gamingPreferences.favoriteGenres.join(", ")}
                          onChange={(e) => updateGamingProfile({
                            gamingPreferences: {
                              ...gamingProfile.gamingPreferences,
                              favoriteGenres: e.target.value.split(",").map(g => g.trim()).filter(Boolean)
                            }
                          })}
                          placeholder="Enter your favorite genres, separated by commas"
                        />
                      </div>
                      <div>
                        <Label>Play Style</Label>
                        <Textarea
                          value={gamingProfile.gamingPreferences.playStyle.join(", ")}
                          onChange={(e) => updateGamingProfile({
                            gamingPreferences: {
                              ...gamingProfile.gamingPreferences,
                              playStyle: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                            }
                          })}
                          placeholder="Enter your play styles, separated by commas"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={gamingProfile.gamingPreferences.multiplayer}
                          onCheckedChange={(checked) => updateGamingProfile({
                            gamingPreferences: {
                              ...gamingProfile.gamingPreferences,
                              multiplayer: checked
                            }
                          })}
                        />
                        <Label>Multiplayer</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={gamingProfile.gamingPreferences.competitive}
                          onCheckedChange={(checked) => updateGamingProfile({
                            gamingPreferences: {
                              ...gamingProfile.gamingPreferences,
                              competitive: checked
                            }
                          })}
                        />
                        <Label>Competitive</Label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSave}>Save</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Favorite Games</h3>
                    <div className="flex flex-wrap gap-2">
                      {gamingProfile.favoriteGames.map((game, index) => (
                        <span key={index} className="px-2 py-1 bg-muted rounded-full text-sm">
                          {game}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Gaming Setup</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {gamingProfile.gamingSetup.pc && (
                        <>
                          <div>
                            <Label>CPU</Label>
                            <p>{gamingProfile.gamingSetup.pc.cpu}</p>
                          </div>
                          <div>
                            <Label>GPU</Label>
                            <p>{gamingProfile.gamingSetup.pc.gpu}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Gaming Preferences</h3>
                    <div className="space-y-2">
                      <div>
                        <Label>Favorite Genres</Label>
                        <div className="flex flex-wrap gap-2">
                          {gamingProfile.gamingPreferences.favoriteGenres.map((genre, index) => (
                            <span key={index} className="px-2 py-1 bg-muted rounded-full text-sm">
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label>Play Style</Label>
                        <div className="flex flex-wrap gap-2">
                          {gamingProfile.gamingPreferences.playStyle.map((style, index) => (
                            <span key={index} className="px-2 py-1 bg-muted rounded-full text-sm">
                              {style}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch checked={gamingProfile.gamingPreferences.multiplayer} disabled />
                          <Label>Multiplayer</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={gamingProfile.gamingPreferences.competitive} disabled />
                          <Label>Competitive</Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {canEdit && (
                    <Button onClick={() => setIsEditing(true)}>Edit Gaming Profile</Button>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label>Theme</Label>
                    <Select
                      value={settings.theme}
                      onValueChange={(value: "light" | "dark" | "system") => updateSettings({ theme: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={settings.notifications}
                      onCheckedChange={(checked) => updateSettings({ notifications: checked })}
                    />
                    <Label>Enable Notifications</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => updateSettings({ emailNotifications: checked })}
                    />
                    <Label>Email Notifications</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={settings.showOnlineStatus}
                      onCheckedChange={(checked) => updateSettings({ showOnlineStatus: checked })}
                    />
                    <Label>Show Online Status</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSave}>Save</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label>Theme</Label>
                    <p>{settings.theme}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch checked={settings.notifications} disabled />
                    <Label>Enable Notifications</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch checked={settings.emailNotifications} disabled />
                    <Label>Email Notifications</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch checked={settings.showOnlineStatus} disabled />
                    <Label>Show Online Status</Label>
                  </div>

                  {canEdit && (
                    <Button onClick={() => setIsEditing(true)}>Edit Settings</Button>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 