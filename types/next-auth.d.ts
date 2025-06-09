import { UserRole } from '@/lib/types';
import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    role: UserRole;
    steamId?: string;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      steamId?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
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