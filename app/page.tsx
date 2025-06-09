import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-12">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Welcome to SaintsGaming.net
        </h1>
        <p className="mx-auto max-w-[700px] text-lg text-muted-foreground sm:text-xl">
          Join our vibrant gaming community and dominate the leaderboards.
        </p>
      </div>
      <div className="flex flex-col gap-4 min-[400px]:flex-row">
        <Link href="/community">
          <Button size="lg" className="h-12 px-8">
            Enter Community Hub
          </Button>
        </Link>
        <Button size="lg" variant="outline" className="h-12 px-8">
          Learn More
        </Button>
      </div>
    </div>
  );
}