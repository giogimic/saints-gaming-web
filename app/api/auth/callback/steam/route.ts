import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/permissions";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const openidParams = Object.fromEntries(searchParams.entries());

    // Verify the OpenID response
    if (openidParams["openid.mode"] !== "id_res") {
      return new NextResponse("Invalid OpenID response", { status: 400 });
    }

    // Extract the Steam ID from the claimed_id
    const claimedId = openidParams["openid.claimed_id"];
    const steamId = claimedId.split("/").pop();

    if (!steamId) {
      return new NextResponse("Invalid Steam ID", { status: 400 });
    }

    // Get user details from Steam API
    const response = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steamId}`
    );
    const data = await response.json();
    const player = data.response.players[0];

    if (!player) {
      return new NextResponse("Player not found", { status: 404 });
    }

    // Find or create user
    const user = await prisma.user.upsert({
      where: { steamId },
      update: {
        name: player.personaname,
        image: player.avatarfull,
        lastLogin: new Date(),
      },
      create: {
        steamId,
        name: player.personaname,
        image: player.avatarfull,
        role: "member" as UserRole,
      },
    });

    // Create session
    const session = await prisma.session.create({
      data: {
        sessionToken: crypto.randomUUID(),
        userId: user.id,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Redirect to home page with session token
    const redirectUrl = new URL("/", request.url);
    redirectUrl.searchParams.set("session", session.sessionToken);

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("[STEAM_CALLBACK]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 