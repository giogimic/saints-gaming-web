import { NextResponse } from 'next/server';
import type { Member } from '@/types/community';

// This would typically come from a database
const members: Member[] = [
  {
    id: '1',
    name: 'John Doe',
    role: 'Admin',
    avatar: '/avatars/john.jpg',
    status: 'Online',
    games: ['CS2', 'Minecraft'],
    joinDate: '2023-01-15',
    discordId: '123456789',
    bio: 'Founder of Saints Gaming',
  },
  {
    id: '2',
    name: 'Jane Smith',
    role: 'Moderator',
    avatar: '/avatars/jane.jpg',
    status: 'Offline',
    games: ['Rust', 'CS2'],
    joinDate: '2023-02-20',
    discordId: '987654321',
    bio: 'Community Manager',
  },
];

export async function GET() {
  try {
    return NextResponse.json(members);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
} 