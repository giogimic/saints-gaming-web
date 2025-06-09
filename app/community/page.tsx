import { Button } from "@/components/ui/button";
import Link from "next/link";

const communityFeatures = [
  {
    title: "Discord Server",
    description: "Join our Discord community to chat with other players, get help with mods, and stay updated on server events.",
    icon: "💬",
  },
  {
    title: "Server Events",
    description: "Participate in regular community events, tournaments, and special game nights on our servers.",
    icon: "🎮",
  },
  {
    title: "Mod Support",
    description: "Get help with mod installation, troubleshooting, and recommendations from experienced community members.",
    icon: "🔧",
  },
  {
    title: "Community Projects",
    description: "Collaborate with other players on community builds, modpack development, and server improvements.",
    icon: "👥",
  },
];

export default function CommunityPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Join Our Community
        </h1>
        <p className="text-muted-foreground">
          Connect with fellow gamers and become part of the SaintsGaming family.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {communityFeatures.map((feature) => (
          <div
            key={feature.title}
            className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{feature.icon}</span>
                <h2 className="text-2xl font-bold">{feature.title}</h2>
              </div>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Get Started</h2>
          <p className="text-muted-foreground">
            Ready to join our community? Click the button below to join our Discord server. 
            Once you're in, introduce yourself in the #welcome channel and our community 
            members will help you get started.
          </p>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="https://discord.gg/saintsgaming" target="_blank">
                Join Discord
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/servers">View Servers</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}