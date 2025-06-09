import { UserRole } from '@/lib/permissions';

export interface Member {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  status: 'Online' | 'Offline' | 'Away' | 'Busy';
  games: string[];
  joinDate: string;
  discordId?: string;
  steamId?: string;
  bio?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  participants: number;
  maxParticipants: number;
  prize: string;
  game: string;
  type: 'Tournament' | 'Contest' | 'Casual' | 'Other';
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  registrationDeadline: string;
  rules?: string[];
  discordChannel?: string;
} 