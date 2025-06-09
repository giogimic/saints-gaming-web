export interface Member {
  id: string;
  name: string;
  role: 'Admin' | 'Moderator' | 'Member';
  avatar: string;
  status: 'Online' | 'Offline' | 'Away';
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
  maxParticipants?: number;
  prize: string;
  game: string;
  type: 'Tournament' | 'Contest' | 'Community Event';
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  registrationDeadline?: string;
  rules?: string[];
  discordChannel?: string;
}

export interface CommunityStats {
  totalMembers: number;
  onlineMembers: number;
  activeEvents: number;
  totalEvents: number;
  popularGames: string[];
} 