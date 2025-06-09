import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          About SaintsGaming
        </h1>
        <p className="text-muted-foreground">
          Learn more about our community and mission.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Our Story</h2>
          <p className="text-muted-foreground">
            SaintsGaming started as a small group of friends who shared a passion for modded gaming. 
            What began as a casual Minecraft server has grown into a vibrant community of gamers who 
            enjoy exploring modded content together.
          </p>
          <p className="text-muted-foreground">
            Today, we maintain multiple game servers and curate modpacks that enhance the gaming 
            experience while keeping performance in mind. Our community is built on the principles 
            of inclusivity, respect, and a shared love for gaming.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">What We Do</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>• Maintain active game servers with carefully selected mods</li>
            <li>• Create and curate modpacks for various games</li>
            <li>• Build a welcoming community for modded gaming enthusiasts</li>
            <li>• Share knowledge and help others get started with modded gaming</li>
          </ul>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Join Our Community</h2>
          <p className="text-muted-foreground">
            Whether you're new to modded gaming or a seasoned player, there's a place for you in 
            our community. Join us on Discord to connect with other players, get help with mods, 
            and stay updated on server events.
          </p>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/community">Join Discord</Link>
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