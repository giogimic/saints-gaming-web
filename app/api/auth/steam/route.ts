import { NextResponse } from 'next/server';
import { generateSteamState, validateSteamResponse, fetchSteamProfile } from '@/lib/auth/steam-auth';
import { saveUser } from '@/lib/storage';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const response = Object.fromEntries(searchParams.entries());
    
    // Validate the OpenID response
    const steamId = validateSteamResponse(response);
    
    // Fetch the Steam profile
    const profile = await fetchSteamProfile(steamId);
    
    // Save the user
    await saveUser({
      id: steamId,
      name: profile.personaname,
      email: null,
      image: profile.avatarfull,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Redirect to the home page with a success message
    return NextResponse.redirect(new URL('/?auth=success', request.url));
  } catch (error) {
    console.error('Steam authentication error:', error);
    return NextResponse.redirect(new URL('/auth/error?error=SteamAuthFailed', request.url));
  }
} 