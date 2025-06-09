import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const steamid = searchParams.get('steamid');

  if (!steamid) {
    return new NextResponse('Steam ID is required', { status: 400 });
  }

  try {
    // Fetch player summary
    const summaryRes = await fetch(
      `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steamid}`
    );
    const summaryData = await summaryRes.json();
    const player = summaryData.response.players[0];

    // Fetch owned games
    const gamesRes = await fetch(
      `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${process.env.STEAM_API_KEY}&steamid=${steamid}&include_appinfo=1&include_played_free_games=1`
    );
    const gamesData = await gamesRes.json();
    const games = gamesData.response.games || [];

    // Sort games by playtime
    games.sort((a: any, b: any) => b.playtime_forever - a.playtime_forever);

    return NextResponse.json({
      ...player,
      games,
    });
  } catch (error) {
    console.error('Error fetching Steam data:', error);
    return new NextResponse('Error fetching Steam data', { status: 500 });
  }
} 