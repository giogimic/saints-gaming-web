import { NextResponse } from 'next/server';
import { getUsers } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Get all users
    const users = await getUsers();
    
    // If not authenticated, return limited user info
    if (!session) {
      return NextResponse.json(users.map(user => ({
        id: user.id,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        steamId: user.steamId,
        discordId: user.discordId,
        twitchId: user.twitchId,
        socialLinks: user.socialLinks
      })));
    }

    // If authenticated, return full user info
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
} 