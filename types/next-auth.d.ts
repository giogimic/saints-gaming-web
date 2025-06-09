import { UserRole } from '@/lib/types';
import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    steamId?: string;
  }

  interface Session {
    user: User & {
      id: string;
      role: UserRole;
      steamId?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    steamId?: string;
  }
}

declare module 'next-auth/providers/steam' {
  interface Profile {
    steamid: string;
    personaname: string;
    avatarfull: string;
  }
} 