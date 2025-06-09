import { NextResponse } from 'next/server';
import { getUsers } from '@/lib/db';
import type { Member } from '@/types/community';

export async function GET() {
  try {
    const users = await getUsers();
    const members: Member[] = users.map(user => ({
      id: user.id,
      name: user.name,
      role: user.role,
      avatar: `https://www.gravatar.com/avatar/${user.email}?d=identicon&s=200`,
      status: 'Offline', // TODO: Implement real-time status tracking
      games: user.gamingUrls ? Object.keys(user.gamingUrls).filter(key => user.gamingUrls[key]) : [],
      joinDate: user.createdAt,
      discordId: user.gamingUrls?.discord,
      steamId: user.gamingUrls?.steam,
      bio: user.bio
    }));

    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}