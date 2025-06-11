import { PrismaClient } from '@prisma/client';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables
config();

const prisma = new PrismaClient();

async function backupDatabase() {
  try {
    console.log('Starting database backup...');

    // Create backup directory if it doesn't exist
    const backupDir = join(process.cwd(), 'backup');
    if (!existsSync(backupDir)) {
      console.log('Creating backup directory...');
      mkdirSync(backupDir, { recursive: true });
    }

    // Backup Users
    console.log('Backing up users...');
    const users = await prisma.user.findMany();
    writeFileSync(
      join(backupDir, 'users.json'),
      JSON.stringify(users, null, 2)
    );

    // Backup Categories
    console.log('Backing up categories...');
    const categories = await prisma.category.findMany();
    writeFileSync(
      join(backupDir, 'categories.json'),
      JSON.stringify(categories, null, 2)
    );

    // Backup Threads
    console.log('Backing up threads...');
    const threads = await prisma.thread.findMany({
      include: {
        author: true,
        category: true,
      },
    });
    writeFileSync(
      join(backupDir, 'threads.json'),
      JSON.stringify(threads, null, 2)
    );

    // Backup Posts
    console.log('Backing up posts...');
    const posts = await prisma.post.findMany({
      include: {
        author: true,
        thread: true,
      },
    });
    writeFileSync(
      join(backupDir, 'posts.json'),
      JSON.stringify(posts, null, 2)
    );

    // Backup Comments
    console.log('Backing up comments...');
    const comments = await prisma.comment.findMany({
      include: {
        author: true,
        post: true,
      },
    });
    writeFileSync(
      join(backupDir, 'comments.json'),
      JSON.stringify(comments, null, 2)
    );

    // Backup Tags
    console.log('Backing up tags...');
    const tags = await prisma.tag.findMany();
    writeFileSync(
      join(backupDir, 'tags.json'),
      JSON.stringify(tags, null, 2)
    );

    // Backup Social Links
    console.log('Backing up social links...');
    const socialLinks = await prisma.socialLink.findMany();
    writeFileSync(
      join(backupDir, 'social-links.json'),
      JSON.stringify(socialLinks, null, 2)
    );

    console.log('Backup completed successfully!');
  } catch (error) {
    console.error('Backup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

backupDatabase(); 