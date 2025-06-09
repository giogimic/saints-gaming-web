import { Button } from "@/components/ui/button";

const servers = [
  {
    title: "Minecraft Server",
    game: "Minecraft",
    description: "Our public Minecraft server is configured with the Saints Gaming modpack. Players can install the pack via CurseForge to ensure everyone has the same mods and versions.",
    instructions: "To join, install the Saints Gaming modpack from CurseForge and use the server IP provided in our community.",
  },
  {
    title: "Ark: Survival Ascended Server",
    game: "Ark: Survival Ascended",
    description: "Our Ark server uses the Omega Ascended mod, a massive overhaul that adds procedurally generated creatures, items, and RPG elements for a richer Ark experience.",
    instructions: "To join, enable the Omega mod through Ark's mod menu as described on its CurseForge page.",
  },
];

export default function ServersPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Our Servers
        </h1>
        <p className="text-muted-foreground">
          Join our active gaming servers and play with the SaintsGaming community.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {servers.map((server) => (
          <div
            key={server.title}
            className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm"
          >
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{server.title}</h2>
                <p className="text-sm text-muted-foreground">{server.game}</p>
              </div>
              <p className="text-sm">{server.description}</p>
              <div className="rounded-md bg-muted p-4">
                <h3 className="font-medium">How to Join</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {server.instructions}
                </p>
              </div>
              <Button variant="outline" className="w-full">
                Join Discord for Server Info
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 