import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config();

const prisma = new PrismaClient();

async function migrateToMySQL() {
  try {
    console.log('Starting migration to MariaDB...');

    // 1. Backup existing data
    console.log('Creating backup of existing data...');
    execSync('bun run scripts/backup-db.ts', { stdio: 'inherit' });

    // 2. Reset the database (if needed)
    console.log('Resetting database...');
    execSync('bun run prisma migrate reset --force', { stdio: 'inherit' });

    // 3. Run migrations
    console.log('Running migrations...');
    execSync('bun run prisma migrate deploy', { stdio: 'inherit' });

    // 4. Seed the database
    console.log('Seeding the database...');
    execSync('bun run prisma db seed', { stdio: 'inherit' });

    // 5. Restore data from backup
    console.log('Restoring data from backup...');
    execSync('bun run scripts/restore-to-mysql.ts', { stdio: 'inherit' });

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateToMySQL(); 