import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

// Initialize the database connection
const sqlite = new Database(process.env.DATABASE_URL.replace('file:', ''));
const db = drizzle(sqlite, { schema });

// Export the database instance
export { db };

// Export the schema
export * from './schema'; 