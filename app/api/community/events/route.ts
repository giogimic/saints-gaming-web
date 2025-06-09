import { NextResponse } from 'next/server';
import type { Event } from '@/types/community';

// This would typically come from a database
const events: Event[] = [
  {
    id: '1',
    title: 'CS2 Tournament',
    description: 'Join our monthly CS2 tournament with a $1000 prize pool!',
    date: '2024-03-15',
    time: '18:00 UTC',
    participants: 32,
    maxParticipants: 64,
    prize: '$1000',
    game: 'CS2',
    type: 'Tournament',
    status: 'Upcoming',
    registrationDeadline: '2024-03-14',
    rules: [
      'Teams of 5 players',
      'Single elimination bracket',
      'Standard competitive rules',
    ],
    discordChannel: 'cs2-tournament',
  },
  {
    id: '2',
    title: 'Minecraft Building Contest',
    description: 'Show off your building skills in our monthly contest!',
    date: '2024-03-20',
    time: '15:00 UTC',
    participants: 24,
    maxParticipants: 50,
    prize: '$500',
    game: 'Minecraft',
    type: 'Contest',
    status: 'Upcoming',
    registrationDeadline: '2024-03-19',
    rules: [
      'Build in creative mode',
      'Theme: Medieval Castle',
      'Time limit: 3 hours',
    ],
    discordChannel: 'minecraft-contest',
  },
];

export async function GET() {
  try {
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
} 