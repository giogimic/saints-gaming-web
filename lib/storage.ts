import { User, ForumPost, ForumReply, ForumCategory, AuthSession, CookieConsent, PageContent, UserRole } from './types';
import { compare, hash } from 'bcryptjs';
import { prisma } from './db';

// In-memory storage for development
const storage = {
  users: [] as User[],
  posts: [] as ForumPost[],
  categories: [] as ForumCategory[],
  replies: [] as ForumReply[],
  settings: {} as Record<string, any>,
  sessions: [] as AuthSession[],
  cookieConsents: [] as CookieConsent[],
  pages: [] as PageContent[],
};

// User operations
export async function getUsers(): Promise<User[]> {
  return prisma.user.findMany();
}

export async function getUser(id: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  return user;
}

export async function createUser(user: User): Promise<void> {
  storage.users.push(user);
}

export async function saveUser(user: User): Promise<void> {
  await prisma.user.upsert({
    where: { id: user.id },
    update: user,
    create: user,
  });
}

export async function updateUser(id: string, updates: Partial<User>): Promise<void> {
  const index = storage.users.findIndex(user => user.id === id);
  if (index !== -1) {
    storage.users[index] = { ...storage.users[index], ...updates };
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return storage.users.find(u => u.email === email) || null;
}

export async function getUserById(id: string): Promise<User | null> {
  return storage.users.find(u => u.id === id) || null;
}

export async function updateUserVerification(id: string, verified: boolean): Promise<User | null> {
  const user = await getUserById(id);
  if (!user) return null;

  const updatedUser = {
    ...user,
    emailVerified: verified,
    verificationToken: verified ? undefined : user.verificationToken,
    updatedAt: new Date().toISOString(),
  };

  return saveUser(updatedUser);
}

export async function updateUserPassword(id: string, password: string): Promise<User | null> {
  const user = await getUserById(id);
  if (!user) return null;

  const updatedUser = {
    ...user,
    password,
    updatedAt: new Date().toISOString(),
  };

  return saveUser(updatedUser);
}

export async function deleteUser(id: string): Promise<boolean> {
  const initialLength = storage.users.length;
  storage.users = storage.users.filter(u => u.id !== id);
  return storage.users.length !== initialLength;
}

export async function updateUserRole(id: string, role: UserRole): Promise<User | null> {
  const user = await getUserById(id);
  if (!user) return null;

  const updatedUser = {
    ...user,
    role,
    updatedAt: new Date().toISOString(),
  };

  return saveUser(updatedUser);
}

// Forum operations
export async function getPosts(): Promise<ForumPost[]> {
  const posts = await getData<ForumPost[]>('posts') || [];
  return posts;
}

export async function getPostById(id: string): Promise<ForumPost | null> {
  const posts = await getPosts();
  return posts.find(post => post.id === id) || null;
}

export async function savePost(post: ForumPost): Promise<ForumPost> {
  const posts = await getPosts();
  const existingIndex = posts.findIndex(p => p.id === post.id);
  
  if (existingIndex >= 0) {
    posts[existingIndex] = post;
  } else {
    posts.push(post);
  }
  
  await saveData('posts', posts);
  return post;
}

export async function updatePost(id: string, updates: Partial<ForumPost>): Promise<ForumPost> {
  const post = await getPostById(id);
  if (!post) {
    throw new Error('Post not found');
  }
  
  const updatedPost = { ...post, ...updates };
  return savePost(updatedPost);
}

export async function deletePost(id: string): Promise<boolean> {
  const posts = await getPosts();
  const filteredPosts = posts.filter(post => post.id !== id);
  
  if (filteredPosts.length === posts.length) {
    return false;
  }
  
  await saveData('posts', filteredPosts);
  return true;
}

export async function getReplies(postId: string): Promise<ForumReply[]> {
  return storage.replies.filter(reply => reply.postId === postId);
}

export async function saveReply(reply: ForumReply): Promise<ForumReply> {
  const existingIndex = storage.replies.findIndex(r => r.id === reply.id);
  if (existingIndex >= 0) {
    storage.replies[existingIndex] = reply;
  } else {
    storage.replies.push(reply);
  }
  return reply;
}

// Category operations
export async function getCategories(): Promise<ForumCategory[]> {
  return storage.categories;
}

export async function getCategory(id: string): Promise<ForumCategory | null> {
  return storage.categories.find(category => category.id === id) || null;
}

export async function createCategory(category: ForumCategory): Promise<void> {
  storage.categories.push(category);
}

export async function updateCategory(id: string, updates: Partial<ForumCategory>): Promise<void> {
  const index = storage.categories.findIndex(category => category.id === id);
  if (index !== -1) {
    storage.categories[index] = { ...storage.categories[index], ...updates };
  }
}

export async function saveCategory(category: ForumCategory): Promise<void> {
  const categories = await getCategories();
  const index = categories.findIndex(c => c.id === category.id);
  if (index === -1) {
    categories.push(category);
  } else {
    categories[index] = category;
  }
  storage.categories = categories;
}

// Session operations
export async function getSessions(): Promise<AuthSession[]> {
  const sessions = await prisma.session.findMany();
  return sessions.map(session => ({
    id: session.id,
    userId: session.userId,
    expiresAt: session.expires.toISOString(),
    provider: 'database',
  }));
}

export async function createSession(session: AuthSession): Promise<void> {
  storage.sessions.push(session);
}

export async function saveSession(session: AuthSession): Promise<void> {
  await prisma.session.create({
    data: {
      id: session.id,
      userId: session.userId,
      expires: new Date(session.expiresAt),
      sessionToken: session.id,
    },
  });
}

export async function deleteSession(id: string): Promise<void> {
  storage.sessions = storage.sessions.filter(session => session.id !== id);
}

// Cookie consent operations
export async function getCookieConsents(): Promise<CookieConsent[]> {
  return storage.cookieConsents;
}

export async function getCookieConsent(id: string): Promise<CookieConsent | null> {
  return storage.cookieConsents.find(consent => consent.id === id) || null;
}

export async function saveCookieConsent(consent: CookieConsent): Promise<void> {
  const index = storage.cookieConsents.findIndex(c => c.id === consent.id);
  if (index >= 0) {
    storage.cookieConsents[index] = consent;
  } else {
    storage.cookieConsents.push(consent);
  }
}

// Page operations
export async function getPage(path: string): Promise<PageContent | null> {
  return storage.pages.find(page => page.path === path) || null;
}

export async function updatePage(path: string, updates: Partial<PageContent>): Promise<void> {
  const index = storage.pages.findIndex(page => page.path === path);
  if (index !== -1) {
    storage.pages[index] = { ...storage.pages[index], ...updates };
  }
}

// Data Storage Utilities
async function getData<T>(key: keyof typeof storage): Promise<T | null> {
  try {
    return storage[key] as T;
  } catch (error) {
    console.error(`Error getting data for key ${key}:`, error);
    return null;
  }
}

async function saveData<T>(key: keyof typeof storage, data: T): Promise<void> {
  try {
    storage[key] = data as any;
  } catch (error) {
    console.error(`Error saving data for key ${key}:`, error);
    throw error;
  }
} 