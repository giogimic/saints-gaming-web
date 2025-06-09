import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { User, UserSettings, UserGamingProfile, ForumPost, ForumReply, ForumCategory } from './types';

let db: any = null;

async function initDatabase() {
  try {
    db = await open({
      filename: 'saintsgaming.db',
      driver: sqlite3.Database
    });

    // Users table
    await db.exec(`
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
    await db.exec(`
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
    await db.exec(`
      CREATE TABLE IF NOT EXISTS user_gaming_profiles (
        userId TEXT PRIMARY KEY,
        favoriteGames TEXT NOT NULL,
        gamingSetup TEXT NOT NULL,
        gamingPreferences TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Forum categories table
    await db.exec(`
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
    await db.exec(`
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
    await db.exec(`
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
    await db.exec(`
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

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Initialize database
initDatabase().catch(console.error);

// User operations
export async function getUsers(): Promise<User[]> {
  try {
    return await db.all('SELECT * FROM users');
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    return await db.get('SELECT * FROM users WHERE id = ?', id);
  } catch (error) {
    console.error('Error getting user by id:', error);
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    return await db.get('SELECT * FROM users WHERE email = ?', email);
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

export async function createUser(user: User): Promise<User> {
  try {
    await db.run(`
      INSERT INTO users (id, email, name, role, emailVerified, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      user.id,
      user.email,
      user.name,
      user.role,
      user.emailVerified,
      user.createdAt,
      user.updatedAt
    ]);
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function updateUser(user: User): Promise<User> {
  try {
    await db.run(`
      UPDATE users
      SET email = ?, name = ?, role = ?, emailVerified = ?, updatedAt = ?
      WHERE id = ?
    `, [
      user.email,
      user.name,
      user.role,
      user.emailVerified,
      user.updatedAt,
      user.id
    ]);
    return user;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

export async function deleteUser(id: string): Promise<void> {
  try {
    await db.run('DELETE FROM users WHERE id = ?', id);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// User settings operations
export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  try {
    return await db.get('SELECT * FROM user_settings WHERE userId = ?', userId);
  } catch (error) {
    console.error('Error getting user settings:', error);
    return null;
  }
}

export async function updateUserSettings(userId: string, settings: UserSettings): Promise<UserSettings> {
  try {
    await db.run(`
      INSERT OR REPLACE INTO user_settings (
        userId, theme, notifications, language, timezone,
        emailNotifications, darkMode, showOnlineStatus
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId,
      settings.theme,
      settings.notifications,
      settings.language,
      settings.timezone,
      settings.emailNotifications,
      settings.darkMode,
      settings.showOnlineStatus
    ]);
    return settings;
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }
}

// User gaming profile operations
export async function getUserGamingProfile(userId: string): Promise<UserGamingProfile | null> {
  try {
    const profile = await db.get('SELECT * FROM user_gaming_profiles WHERE userId = ?', userId);
    if (profile) {
      return {
        ...profile,
        favoriteGames: JSON.parse(profile.favoriteGames),
        gamingSetup: JSON.parse(profile.gamingSetup),
        gamingPreferences: JSON.parse(profile.gamingPreferences)
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user gaming profile:', error);
    return null;
  }
}

export async function updateUserGamingProfile(userId: string, profile: UserGamingProfile): Promise<UserGamingProfile> {
  try {
    await db.run(`
      INSERT OR REPLACE INTO user_gaming_profiles (
        userId, favoriteGames, gamingSetup, gamingPreferences
      )
      VALUES (?, ?, ?, ?)
    `, [
      userId,
      JSON.stringify(profile.favoriteGames),
      JSON.stringify(profile.gamingSetup),
      JSON.stringify(profile.gamingPreferences)
    ]);
    return profile;
  } catch (error) {
    console.error('Error updating user gaming profile:', error);
    throw error;
  }
}

// Forum category operations
export async function getForumCategories(categoryId?: string): Promise<ForumCategory | ForumCategory[]> {
  try {
    if (categoryId) {
      const category = await db.get('SELECT * FROM forum_categories WHERE id = ?', categoryId);
      return category || [];
    }
    return await db.all('SELECT * FROM forum_categories ORDER BY "order" ASC');
  } catch (error) {
    console.error('Error getting forum categories:', error);
    return categoryId ? [] : [];
  }
}

export async function createForumCategory(category: ForumCategory): Promise<ForumCategory> {
  try {
    await db.run(`
      INSERT INTO forum_categories (id, name, description, "order", createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      category.id,
      category.name,
      category.description,
      category.order,
      category.createdAt,
      category.updatedAt
    ]);
    return category;
  } catch (error) {
    console.error('Error creating forum category:', error);
    throw error;
  }
}

export async function updateForumCategory(category: ForumCategory): Promise<ForumCategory> {
  try {
    await db.run(`
      UPDATE forum_categories
      SET name = ?, description = ?, "order" = ?, updatedAt = ?
      WHERE id = ?
    `, [
      category.name,
      category.description,
      category.order,
      category.updatedAt,
      category.id
    ]);
    return category;
  } catch (error) {
    console.error('Error updating forum category:', error);
    throw error;
  }
}

export async function deleteForumCategory(id: string): Promise<void> {
  try {
    await db.run('DELETE FROM forum_categories WHERE id = ?', id);
  } catch (error) {
    console.error('Error deleting forum category:', error);
    throw error;
  }
}

// Forum post operations
export async function getForumPosts(postId?: string): Promise<ForumPost | ForumPost[]> {
  try {
    if (postId) {
      const post = await db.get('SELECT * FROM forum_posts WHERE id = ?', postId);
      return post || [];
    }
    return await db.all('SELECT * FROM forum_posts ORDER BY isPinned DESC, createdAt DESC');
  } catch (error) {
    console.error('Error getting forum posts:', error);
    return postId ? [] : [];
  }
}

export async function createForumPost(post: ForumPost): Promise<ForumPost> {
  try {
    await db.run(`
      INSERT INTO forum_posts (
        id, title, content, authorId, categoryId, isPinned, createdAt, updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      post.id,
      post.title,
      post.content,
      post.authorId,
      post.categoryId,
      post.isPinned,
      post.createdAt,
      post.updatedAt
    ]);
    return post;
  } catch (error) {
    console.error('Error creating forum post:', error);
    throw error;
  }
}

export async function updateForumPost(post: ForumPost): Promise<ForumPost> {
  try {
    await db.run(`
      UPDATE forum_posts
      SET title = ?, content = ?, categoryId = ?, isPinned = ?, updatedAt = ?
      WHERE id = ?
    `, [
      post.title,
      post.content,
      post.categoryId,
      post.isPinned,
      post.updatedAt,
      post.id
    ]);
    return post;
  } catch (error) {
    console.error('Error updating forum post:', error);
    throw error;
  }
}

export async function deleteForumPost(id: string): Promise<void> {
  try {
    await db.run('DELETE FROM forum_posts WHERE id = ?', id);
  } catch (error) {
    console.error('Error deleting forum post:', error);
    throw error;
  }
}

// Forum reply operations
export async function getForumReplies(postId?: string): Promise<ForumReply[]> {
  try {
    if (postId) {
      return await db.all('SELECT * FROM forum_replies WHERE postId = ? ORDER BY createdAt ASC', postId);
    }
    return await db.all('SELECT * FROM forum_replies ORDER BY createdAt ASC');
  } catch (error) {
    console.error('Error getting forum replies:', error);
    return [];
  }
}

export async function createForumReply(reply: ForumReply): Promise<ForumReply> {
  try {
    await db.run(`
      INSERT INTO forum_replies (id, content, authorId, postId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      reply.id,
      reply.content,
      reply.authorId,
      reply.postId,
      reply.createdAt,
      reply.updatedAt
    ]);
    return reply;
  } catch (error) {
    console.error('Error creating forum reply:', error);
    throw error;
  }
}

export async function updateForumReply(reply: ForumReply): Promise<ForumReply> {
  try {
    await db.run(`
      UPDATE forum_replies
      SET content = ?, updatedAt = ?
      WHERE id = ?
    `, [
      reply.content,
      reply.updatedAt,
      reply.id
    ]);
    return reply;
  } catch (error) {
    console.error('Error updating forum reply:', error);
    throw error;
  }
}

export async function deleteForumReply(id: string): Promise<void> {
  try {
    await db.run('DELETE FROM forum_replies WHERE id = ?', id);
  } catch (error) {
    console.error('Error deleting forum reply:', error);
    throw error;
  }
}

export default db; 