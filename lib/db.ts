import Database from 'better-sqlite3';
import { User, UserSettings, UserGamingProfile, ForumPost, ForumReply, ForumCategory } from './types';

const db = new Database('saintsgaming.db');

function initDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      emailVerified TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  // User settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_settings (
      userId TEXT PRIMARY KEY,
      theme TEXT NOT NULL,
      notifications BOOLEAN NOT NULL,
      language TEXT NOT NULL,
      timezone TEXT NOT NULL,
      emailNotifications BOOLEAN NOT NULL,
      darkMode BOOLEAN NOT NULL,
      showOnlineStatus BOOLEAN NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // User gaming profile table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_gaming_profiles (
      userId TEXT PRIMARY KEY,
      favoriteGames TEXT NOT NULL,
      gamingSetup TEXT NOT NULL,
      gamingPreferences TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Forum categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS forum_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      "order" INTEGER NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  // Forum posts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS forum_posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      authorId TEXT NOT NULL,
      categoryId TEXT NOT NULL,
      isPinned BOOLEAN DEFAULT FALSE,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (categoryId) REFERENCES forum_categories(id) ON DELETE CASCADE
    )
  `);

  // Forum replies table
  db.exec(`
    CREATE TABLE IF NOT EXISTS forum_replies (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      authorId TEXT NOT NULL,
      postId TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (postId) REFERENCES forum_posts(id) ON DELETE CASCADE
    )
  `);

  // Post votes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS post_votes (
      id TEXT PRIMARY KEY,
      postId TEXT NOT NULL,
      userId TEXT NOT NULL,
      value INTEGER NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (postId) REFERENCES forum_posts(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(postId, userId)
    )
  `);
}

// Initialize database
initDatabase();

// User operations
export function getUsers(): User[] {
  return db.prepare('SELECT * FROM users').all() as User[];
}

export function getUserById(id: string): User | null {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | null;
}

export function getUserByEmail(email: string): User | null {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | null;
}

export function createUser(user: User): User {
  db.prepare(`
    INSERT INTO users (id, email, name, role, emailVerified, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    user.id,
    user.email,
    user.name,
    user.role,
    user.emailVerified,
    user.createdAt,
    user.updatedAt
  );
  return user;
}

export function updateUser(user: User): User {
  db.prepare(`
    UPDATE users
    SET email = ?, name = ?, role = ?, emailVerified = ?, updatedAt = ?
    WHERE id = ?
  `).run(
    user.email,
    user.name,
    user.role,
    user.emailVerified,
    user.updatedAt,
    user.id
  );
  return user;
}

export function deleteUser(id: string): void {
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
}

// User settings operations
export function getUserSettings(userId: string): UserSettings | null {
  return db.prepare('SELECT * FROM user_settings WHERE userId = ?').get(userId) as UserSettings | null;
}

export function updateUserSettings(userId: string, settings: UserSettings): UserSettings {
  db.prepare(`
    INSERT OR REPLACE INTO user_settings (
      userId, theme, notifications, language, timezone,
      emailNotifications, darkMode, showOnlineStatus
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId,
    settings.theme,
    settings.notifications,
    settings.language,
    settings.timezone,
    settings.emailNotifications,
    settings.darkMode,
    settings.showOnlineStatus
  );
  return settings;
}

// User gaming profile operations
export function getUserGamingProfile(userId: string): UserGamingProfile | null {
  return db.prepare('SELECT * FROM user_gaming_profiles WHERE userId = ?').get(userId) as UserGamingProfile | null;
}

export function updateUserGamingProfile(userId: string, profile: UserGamingProfile): UserGamingProfile {
  db.prepare(`
    INSERT OR REPLACE INTO user_gaming_profiles (
      userId, favoriteGames, gamingSetup, gamingPreferences
    )
    VALUES (?, ?, ?, ?)
  `).run(
    userId,
    JSON.stringify(profile.favoriteGames),
    JSON.stringify(profile.gamingSetup),
    JSON.stringify(profile.gamingPreferences)
  );
  return profile;
}

// Forum category operations
export function getForumCategories(categoryId?: string): ForumCategory | ForumCategory[] {
  if (categoryId) {
    return db.prepare('SELECT * FROM forum_categories WHERE id = ?').get(categoryId) as ForumCategory;
  }
  return db.prepare('SELECT * FROM forum_categories ORDER BY "order" ASC').all() as ForumCategory[];
}

export function createForumCategory(category: ForumCategory): ForumCategory {
  db.prepare(`
    INSERT INTO forum_categories (id, name, description, "order", createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    category.id,
    category.name,
    category.description,
    category.order,
    category.createdAt,
    category.updatedAt
  );
  return category;
}

export function updateForumCategory(category: ForumCategory): ForumCategory {
  db.prepare(`
    UPDATE forum_categories
    SET name = ?, description = ?, "order" = ?, updatedAt = ?
    WHERE id = ?
  `).run(
    category.name,
    category.description,
    category.order,
    category.updatedAt,
    category.id
  );
  return category;
}

export function deleteForumCategory(id: string): void {
  db.prepare('DELETE FROM forum_categories WHERE id = ?').run(id);
}

// Forum post operations
export function getForumPosts(postId?: string): ForumPost | ForumPost[] {
  if (postId) {
    return db.prepare('SELECT * FROM forum_posts WHERE id = ?').get(postId) as ForumPost;
  }
  return db.prepare('SELECT * FROM forum_posts ORDER BY isPinned DESC, createdAt DESC').all() as ForumPost[];
}

export function createForumPost(post: ForumPost): ForumPost {
  db.prepare(`
    INSERT INTO forum_posts (id, title, content, authorId, categoryId, isPinned, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    post.id,
    post.title,
    post.content,
    post.authorId,
    post.categoryId,
    post.isPinned,
    post.createdAt,
    post.updatedAt
  );
  return post;
}

export function updateForumPost(post: ForumPost): ForumPost {
  db.prepare(`
    UPDATE forum_posts
    SET title = ?, content = ?, categoryId = ?, isPinned = ?, updatedAt = ?
    WHERE id = ?
  `).run(
    post.title,
    post.content,
    post.categoryId,
    post.isPinned,
    post.updatedAt,
    post.id
  );
  return post;
}

export function deleteForumPost(id: string): void {
  db.prepare('DELETE FROM forum_posts WHERE id = ?').run(id);
}

// Forum reply operations
export function getForumReplies(postId?: string): ForumReply[] {
  if (postId) {
    return db.prepare('SELECT * FROM forum_replies WHERE postId = ? ORDER BY createdAt ASC').all(postId) as ForumReply[];
  }
  return db.prepare('SELECT * FROM forum_replies ORDER BY createdAt ASC').all() as ForumReply[];
}

export function createForumReply(reply: ForumReply): ForumReply {
  db.prepare(`
    INSERT INTO forum_replies (id, content, authorId, postId, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    reply.id,
    reply.content,
    reply.authorId,
    reply.postId,
    reply.createdAt,
    reply.updatedAt
  );
  return reply;
}

export function updateForumReply(reply: ForumReply): ForumReply {
  db.prepare(`
    UPDATE forum_replies
    SET content = ?, updatedAt = ?
    WHERE id = ?
  `).run(
    reply.content,
    reply.updatedAt,
    reply.id
  );
  return reply;
}

export function deleteForumReply(id: string): void {
  db.prepare('DELETE FROM forum_replies WHERE id = ?').run(id);
}

export default db; 