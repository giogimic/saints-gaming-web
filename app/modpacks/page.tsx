import { Button } from "@/components/ui/button";
import Link from "next/link";

const modpacks = [
  {
    title: "Saints Gaming",
    game: "Minecraft",
    version: "1.21.1 (NeoForge)",
    description: "A fully loaded modpack for multiplayer Minecraft with over 400 mods. Designed for exploration, automation, combat, and multiplayer balance. Features seamless dimension travel with Immersive Portals, enhanced movement with Parcool, and modern combat systems. Includes advanced storage networks, tech trees, world generation, and performance tuning. Ideal for long-term survival and server play.",
    link: "https://www.curseforge.com/minecraft/modpacks/saints-gaming",
  },
  {
    title: "Dimensional Cobblemon",
    game: "Minecraft",
    version: "1.21.1 (NeoForge)",
    description: "A Pokémon-style adventure pack with full Cobblemon integration, magic, and dimensional exploration. Includes Immersive Portals, Parcool, Blue Skies, Twilight Forest, and world-expanding systems. Designed to blend open-world RPG progression with server-based exploration. Balanced for performance with enhanced visuals, combat AI upgrades, and multiplayer syncing tools.",
    link: "https://www.curseforge.com/minecraft/modpacks/dimensional-cobblemon",
  },
  {
    title: "Holy Crop!",
    game: "Stardew Valley",
    version: "SMAPI-compatible",
    description: "A curated Stardew Valley overhaul focused on farming, automation, NPC depth, and visual improvements. Adds over 100 mods for crafting, storage, cooking, seasonal aesthetics, and farming systems. Balanced for long save files and multiplayer sync. Fully compatible with SMAPI and Vortex.",
    link: "https://www.curseforge.com/stardewvalley/modpacks/holy-crop",
  },
];

export default function ModpacksPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Official Modpacks
        </h1>
        <p className="text-muted-foreground">
          Explore our curated collection of modpacks, built by Giogimic for SaintsGaming.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {modpacks.map((modpack) => (
          <div
            key={modpack.title}
            className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm"
          >
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{modpack.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {modpack.game} • {modpack.version}
                </p>
              </div>
              <p className="text-sm">{modpack.description}</p>
              <Button asChild className="w-full">
                <Link href={modpack.link} target="_blank">
                  Download on CurseForge
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 