"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { EditModeToggle } from "@/components/edit-mode-toggle";
import { usePageContent } from "@/app/hooks/usePageContent";

interface Button {
  text: string;
  href: string;
}

interface HomeContent {
  title: string;
  subtitle: string;
  headerImage: string;
  buttons: Button[];
  features: {
    title: string;
    description: string;
    icon: string;
  }[];
  news: {
    title: string;
    content: string;
    date: string;
  }[];
  stats: {
    players: string;
    servers: string;
    modpacks: string;
  };
}

const defaultContent: HomeContent = {
  title: "Welcome to Saints Gaming",
  subtitle: "Your ultimate destination for modded gaming experiences",
  headerImage: "/imgs/header.jpg",
  buttons: [
    {
      text: "Join Our Servers",
      href: "/servers",
    },
    {
      text: "Explore Modpacks",
      href: "/modpacks",
    },
  ],
  features: [
    {
      title: "Custom Modpacks",
      description: "Exclusively curated modpacks for the best gaming experience",
      icon: "🎮"
    },
    {
      title: "Active Community",
      description: "Join thousands of players in our vibrant community",
      icon: "👥"
    },
    {
      title: "24/7 Support",
      description: "Our dedicated team is always here to help",
      icon: "🛟"
    }
  ],
  news: [
    {
      title: "New Modpack Release",
      content: "Check out our latest modpack featuring the newest Minecraft updates!",
      date: "2024-03-20"
    },
    {
      title: "Server Maintenance",
      content: "Scheduled maintenance completed successfully",
      date: "2024-03-19"
    }
  ],
  stats: {
    players: "10,000+",
    servers: "15+",
    modpacks: "20+"
  }
};

export default function HomePage() {
  const {
    content,
    isLoading,
    isEditMode,
    canEdit,
    handleSave,
  } = usePageContent({
    pageId: "home",
    defaultContent,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Ensure content has all required fields
  const safeContent: HomeContent = {
    ...defaultContent,
    ...content,
    buttons: content?.buttons || defaultContent.buttons,
    features: content?.features || defaultContent.features,
    news: content?.news || defaultContent.news,
    stats: content?.stats || defaultContent.stats,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {canEdit && <EditModeToggle />}
      
      <div className="space-y-8">
        <Card className="relative overflow-hidden">
          <div className="relative h-[400px] w-full">
            <Image
              src={safeContent.headerImage}
              alt="Header"
              fill
              className="object-cover"
              priority
            />
          </div>
          <CardHeader className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white">
            <CardTitle className="text-4xl font-bold">
              {isEditMode && canEdit ? (
                <Input
                  value={safeContent.title}
                  onChange={(e) => handleSave("title", e.target.value)}
                  className="text-4xl font-bold bg-transparent text-white border-white/20"
                />
              ) : (
                safeContent.title
              )}
            </CardTitle>
            <CardDescription className="text-xl mt-2 text-white/90">
              {isEditMode && canEdit ? (
                <Input
                  value={safeContent.subtitle}
                  onChange={(e) => handleSave("subtitle", e.target.value)}
                  className="text-xl bg-transparent text-white border-white/20"
                />
              ) : (
                safeContent.subtitle
              )}
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="flex justify-center gap-4">
          {safeContent.buttons.map((button: Button, index: number) => (
            <Link key={index} href={button.href}>
              <Button size="lg" className="text-lg">
                {button.text}
              </Button>
            </Link>
          ))}
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {safeContent.features.map((feature, index) => (
            <Card key={index} className="p-6">
              <CardHeader>
                <div className="text-4xl mb-4">{feature.icon}</div>
                <CardTitle>
                  {isEditMode && canEdit ? (
                    <Input
                      value={feature.title}
                      onChange={(e) => {
                        const newFeatures = [...safeContent.features];
                        newFeatures[index] = { ...feature, title: e.target.value };
                        handleSave("features", newFeatures);
                      }}
                      className="text-xl font-bold"
                    />
                  ) : (
                    feature.title
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditMode && canEdit ? (
                  <Input
                    value={feature.description}
                    onChange={(e) => {
                      const newFeatures = [...safeContent.features];
                      newFeatures[index] = { ...feature, description: e.target.value };
                      handleSave("features", newFeatures);
                    }}
                    className="text-gray-600"
                  />
                ) : (
                  <p className="text-gray-600">{feature.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* News Section */}
        <Card>
          <CardHeader>
            <CardTitle>Latest Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {safeContent.news.map((item, index) => (
                <div key={index} className="border-b pb-4 last:border-0">
                  {isEditMode && canEdit ? (
                    <>
                      <Input
                        value={item.title}
                        onChange={(e) => {
                          const newNews = [...safeContent.news];
                          newNews[index] = { ...item, title: e.target.value };
                          handleSave("news", newNews);
                        }}
                        className="text-xl font-bold mb-2"
                      />
                      <Input
                        value={item.content}
                        onChange={(e) => {
                          const newNews = [...safeContent.news];
                          newNews[index] = { ...item, content: e.target.value };
                          handleSave("news", newNews);
                        }}
                        className="text-gray-600 mb-2"
                      />
                      <Input
                        value={item.date}
                        onChange={(e) => {
                          const newNews = [...safeContent.news];
                          newNews[index] = { ...item, date: e.target.value };
                          handleSave("news", newNews);
                        }}
                        className="text-sm text-gray-500"
                      />
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold">{item.title}</h3>
                      <p className="text-gray-600">{item.content}</p>
                      <p className="text-sm text-gray-500">{item.date}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Section */}
        <Card>
          <CardHeader>
            <CardTitle>Community Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <h3 className="text-2xl font-bold">
                  {isEditMode && canEdit ? (
                    <Input
                      value={safeContent.stats.players}
                      onChange={(e) => handleSave("stats", { ...safeContent.stats, players: e.target.value })}
                      className="text-center"
                    />
                  ) : (
                    safeContent.stats.players
                  )}
                </h3>
                <p className="text-gray-600">Active Players</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold">
                  {isEditMode && canEdit ? (
                    <Input
                      value={safeContent.stats.servers}
                      onChange={(e) => handleSave("stats", { ...safeContent.stats, servers: e.target.value })}
                      className="text-center"
                    />
                  ) : (
                    safeContent.stats.servers
                  )}
                </h3>
                <p className="text-gray-600">Active Servers</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold">
                  {isEditMode && canEdit ? (
                    <Input
                      value={safeContent.stats.modpacks}
                      onChange={(e) => handleSave("stats", { ...safeContent.stats, modpacks: e.target.value })}
                      className="text-center"
                    />
                  ) : (
                    safeContent.stats.modpacks
                  )}
                </h3>
                <p className="text-gray-600">Modpacks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}