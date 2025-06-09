import { User, ForumPost, ForumCategory, AuthSession, CookieConsent, PageContent, UserRole } from './types';

// In-memory storage for development
let storage: {
  users: User[];
  posts: ForumPost[];
  categories: ForumCategory[];
  sessions: AuthSession[];
  cookieConsents: CookieConsent[];
  pages: PageContent[];
} = {
  users: [],
  posts: [],
  categories: [
    {
      id: '1',
      name: 'General Discussion',
      description: 'General topics and discussions',
      order: 1,
      posts: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Game Announcements',
      description: 'Latest news and updates about our games',
      order: 2,
      posts: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Community Events',
      description: 'Information about community events and tournaments',
      order: 3,
      posts: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ],
  sessions: [],
  cookieConsents: [],
  pages: []
};

// User operations
export async function getUsers(): Promise<User[]> {
  return storage.users;
}

export async function getUser(id: string): Promise<User | null> {
  return storage.users.find(user => user.id === id) || null;
}

export async function createUser(user: User): Promise<void> {
  storage.users.push(user);
}

export async function saveUser(user: User): Promise<User> {
  const existingUserIndex = storage.users.findIndex(u => u.id === user.id);
  if (existingUserIndex >= 0) {
    storage.users[existingUserIndex] = { ...storage.users[existingUserIndex], ...user };
    return storage.users[existingUserIndex];
  }
  storage.users.push(user);
  return user;
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
  return storage.posts;
}

export async function getPost(id: string): Promise<ForumPost | null> {
  return storage.posts.find(post => post.id === id) || null;
}

export async function createPost(post: ForumPost): Promise<void> {
  storage.posts.push(post);
}

export async function updatePost(id: string, updates: Partial<ForumPost>): Promise<void> {
  const index = storage.posts.findIndex(post => post.id === id);
  if (index !== -1) {
    storage.posts[index] = { ...storage.posts[index], ...updates };
  }
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
  try {
    const categories = await getCategories();
    const index = categories.findIndex(c => c.id === category.id);
    
    if (index === -1) {
      categories.push(category);
    } else {
      categories[index] = category;
    }
    
    localStorage.setItem('forum_categories', JSON.stringify(categories));
  } catch (error) {
    console.error('Error saving category:', error);
    throw new Error('Failed to save category');
  }
}

// Session operations
export async function getSessions(): Promise<AuthSession[]> {
  return storage.sessions;
}

export async function createSession(session: AuthSession): Promise<void> {
  storage.sessions.push(session);
}

export async function saveSession(session: AuthSession): Promise<void> {
  const index = storage.sessions.findIndex(s => s.id === session.id);
  if (index >= 0) {
    storage.sessions[index] = session;
  } else {
    storage.sessions.push(session);
  }
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