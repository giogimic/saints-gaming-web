"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEditMode } from "@/components/admin-widget";
import { EditableText } from "@/app/components/editable-text";

interface ServerInfo {
  id: string;
  name: string;
  description: string;
  image: string;
  status: "online" | "offline" | "maintenance";
  players: number;
  maxPlayers: number;
  version: string;
  ip: string;
  type: "ark" | "minecraft";
  features: string[];
  rules: string[];
  modpack?: {
    name: string;
    version: string;
    downloadUrl: string;
  };
}

export default function ServersPage() {
  const [activeTab, setActiveTab] = useState("ark");
  const [servers, setServers] = useState<ServerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const isEditMode = useEditMode();
  const canEdit = session?.user?.role === "admin";

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await fetch('/api/servers');
        if (!response.ok) throw new Error('Failed to fetch servers');
        const data = await response.json();
        setServers(data);
      } catch (error) {
        console.error('Error fetching servers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServers();
  }, []);

  const handleSave = async (serverId: string, field: string, value: any) => {
    try {
      const response = await fetch(`/api/servers/${serverId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });

      if (!response.ok) throw new Error('Failed to update server');
      
      setServers(prev => prev.map(server => 
        server.id === serverId ? { ...server, [field]: value } : server
      ));
    } catch (error) {
      console.error('Error updating server:', error);
    }
  };

  const filteredServers = servers.filter((server) => server.type === activeTab);

  if (loading) {
    return <div className="container mx-auto py-8">Loading servers...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Our Servers</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList>
          <TabsTrigger value="ark">ARK: Survival Ascended</TabsTrigger>
          <TabsTrigger value="minecraft">Minecraft</TabsTrigger>
        </TabsList>

        {filteredServers.map((server) => (
          <TabsContent key={server.id} value={server.type}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Server Info */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>
                          {canEdit && isEditMode ? (
                            <EditableText
                              value={server.name}
                              onSave={async (value) => await handleSave(server.id, 'name', value)}
                            />
                          ) : (
                            server.name
                          )}
                        </CardTitle>
                        <CardDescription>
                          {canEdit && isEditMode ? (
                            <EditableText
                              value={server.description}
                              onSave={async (value) => await handleSave(server.id, 'description', value)}
                            />
                          ) : (
                            server.description
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            server.status === "online"
                              ? "bg-green-500"
                              : server.status === "maintenance"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                        />
                        <span className="text-sm text-muted-foreground">
                          {server.status.charAt(0).toUpperCase() + server.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="relative h-64 rounded-lg overflow-hidden">
                        <Image
                          src={server.type === 'ark' ? '/saintsgaming-logo.png' : '/saintsgaming-icon.png'}
                          alt={server.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Players</p>
                          <p className="text-lg font-medium">
                            {server.players}/{server.maxPlayers}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Version</p>
                          <p className="text-lg font-medium">
                            {canEdit && isEditMode ? (
                              <EditableText
                                value={server.version}
                                onSave={async (value) => await handleSave(server.id, 'version', value)}
                              />
                            ) : (
                              server.version
                            )}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-muted-foreground">Server IP</p>
                          <p className="text-lg font-medium">
                            {canEdit && isEditMode ? (
                              <EditableText
                                value={server.ip}
                                onSave={async (value) => await handleSave(server.id, 'ip', value)}
                              />
                            ) : (
                              server.ip
                            )}
                          </p>
                        </div>
                      </div>
                      <Button className="w-full" asChild>
                        <Link href={`/servers/${server.id}`}>Join Server</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Features */}
                <Card>
                  <CardHeader>
                    <CardTitle>Server Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2">
                      {server.features.map((feature, index) => (
                        <li key={index} className="text-muted-foreground">
                          {canEdit && isEditMode ? (
                            <EditableText
                              value={feature}
                              onSave={async (value) => {
                                const newFeatures = [...server.features];
                                newFeatures[index] = value;
                                await handleSave(server.id, 'features', newFeatures);
                              }}
                            />
                          ) : (
                            feature
                          )}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Rules */}
                <Card>
                  <CardHeader>
                    <CardTitle>Server Rules</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2">
                      {server.rules.map((rule, index) => (
                        <li key={index} className="text-muted-foreground">
                          {canEdit && isEditMode ? (
                            <EditableText
                              value={rule}
                              onSave={async (value) => {
                                const newRules = [...server.rules];
                                newRules[index] = value;
                                await handleSave(server.id, 'rules', newRules);
                              }}
                            />
                          ) : (
                            rule
                          )}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Modpack */}
                {server.modpack && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Modpack</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Name</p>
                          <p className="text-lg font-medium">
                            {canEdit && isEditMode ? (
                              <EditableText
                                value={server.modpack.name}
                                onSave={async (value) =>
                                  await handleSave(server.id, 'modpack', {
                                    ...server.modpack,
                                    name: value,
                                  })
                                }
                              />
                            ) : (
                              server.modpack.name
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Version</p>
                          <p className="text-lg font-medium">
                            {canEdit && isEditMode ? (
                              <EditableText
                                value={server.modpack.version}
                                onSave={async (value) =>
                                  await handleSave(server.id, 'modpack', {
                                    ...server.modpack,
                                    version: value,
                                  })
                                }
                              />
                            ) : (
                              server.modpack.version
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Download URL</p>
                          <p className="text-lg font-medium">
                            {canEdit && isEditMode ? (
                              <EditableText
                                value={server.modpack.downloadUrl}
                                onSave={async (value) =>
                                  await handleSave(server.id, 'modpack', {
                                    ...server.modpack,
                                    downloadUrl: value,
                                  })
                                }
                              />
                            ) : (
                              server.modpack.downloadUrl
                            )}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Server Status */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Server Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="text-lg font-medium">
                          {server.status.charAt(0).toUpperCase() + server.status.slice(1)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Players Online</p>
                        <p className="text-lg font-medium">
                          {server.players}/{server.maxPlayers}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Server Type</p>
                        <p className="text-lg font-medium">
                          {server.type.charAt(0).toUpperCase() + server.type.slice(1)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
} 