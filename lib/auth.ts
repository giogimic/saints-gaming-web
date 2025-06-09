import { User, AuthSession, UserRole } from './types';
import { saveUser, saveSession, getUsers, getSessions, getUser } from './storage';
import { randomUUID } from 'crypto';

// Steam authentication
export async function authenticateSteam(steamId: string, profile: any): Promise<User> {
  try {
    const users = await getUsers();
    let user = users.find(u => u.id === steamId);

    if (!user) {
      user = {
        id: steamId,
        name: profile.personaname,
        email: null,
        image: profile.avatarfull,
        role: 'user' as UserRole,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        preferences: {
          theme: 'system',
          notifications: true,
        },
      };
      await saveUser(user);
    } else {
      user.lastLogin = new Date().toISOString();
      user.name = profile.personaname;
      user.image = profile.avatarfull;
      await saveUser(user);
    }

    return user;
  } catch (error) {
    console.error('Error authenticating Steam user:', error);
    throw new Error('Failed to authenticate Steam user');
  }
}

// Discord authentication
export async function authenticateDiscord(discordId: string, profile: any): Promise<User> {
  const users = await getUsers();
  let user = users.find((u: User) => u.discordId === discordId);

  if (!user) {
    user = {
      id: randomUUID(),
      username: profile.username,
      role: 'user',
      avatar: profile.avatar,
      discordId,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      posts: 0,
      reputation: 0,
    };
  } else {
    user.lastLogin = new Date().toISOString();
    user.username = profile.username;
    user.avatar = profile.avatar;
  }

  await saveUser(user);
  return user;
}

// Session management
export async function createSession(userId: string, provider: string): Promise<void> {
  try {
    const users = await getUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    user.lastLogin = new Date().toISOString();
    await saveUser(user);
  } catch (error) {
    console.error('Error creating session:', error);
    throw new Error('Failed to create session');
  }
}

export async function validateSession(sessionId: string): Promise<User | null> {
  const sessions = await getSessions();
  const session = sessions.find((s: AuthSession) => s.id === sessionId);

  if (!session || new Date(session.expiresAt) < new Date()) {
    return null;
  }

  return getUser(session.userId);
}

// Role-based permissions
export function hasPermission(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = {
    owner: 7,
    head_admin: 6,
    admin: 5,
    mod: 4,
    legacy_user: 3,
    trusted_user: 2,
    user: 1,
    guest: 0,
  };

  return roleHierarchy[userRole as keyof typeof roleHierarchy] >= 
         roleHierarchy[requiredRole as keyof typeof roleHierarchy];
} 