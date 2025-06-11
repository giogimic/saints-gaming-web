import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables
config();

const prisma = new PrismaClient();

async function restoreToMySQL() {
  try {
    console.log('Starting data restoration to MariaDB...');

    // Read backup files
    const users = JSON.parse(readFileSync(join(process.cwd(), 'backup', 'users.json'), 'utf-8'));
    const categories = JSON.parse(readFileSync(join(process.cwd(), 'backup', 'categories.json'), 'utf-8'));
    const threads = JSON.parse(readFileSync(join(process.cwd(), 'backup', 'threads.json'), 'utf-8'));
    const posts = JSON.parse(readFileSync(join(process.cwd(), 'backup', 'posts.json'), 'utf-8'));
    const comments = JSON.parse(readFileSync(join(process.cwd(), 'backup', 'comments.json'), 'utf-8'));
    const tags = JSON.parse(readFileSync(join(process.cwd(), 'backup', 'tags.json'), 'utf-8'));
    const socialLinks = JSON.parse(readFileSync(join(process.cwd(), 'backup', 'social-links.json'), 'utf-8'));

    // Restore in correct order to maintain referential integrity
    console.log('Restoring users...');
    for (const user of users) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {
          ...user,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
          lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
        },
        create: {
          ...user,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
          lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
        },
      });
    }

    console.log('Restoring categories...');
    for (const category of categories) {
      await prisma.category.upsert({
        where: { id: category.id },
        update: {
          ...category,
          createdAt: new Date(category.createdAt),
          updatedAt: new Date(category.updatedAt),
        },
        create: {
          ...category,
          createdAt: new Date(category.createdAt),
          updatedAt: new Date(category.updatedAt),
        },
      });
    }

    console.log('Restoring threads...');
    for (const thread of threads) {
      await prisma.thread.upsert({
        where: { id: thread.id },
        update: {
          ...thread,
          createdAt: new Date(thread.createdAt),
          updatedAt: new Date(thread.updatedAt),
          lastPostAt: new Date(thread.lastPostAt),
        },
        create: {
          ...thread,
          createdAt: new Date(thread.createdAt),
          updatedAt: new Date(thread.updatedAt),
          lastPostAt: new Date(thread.lastPostAt),
        },
      });
    }

    console.log('Restoring posts...');
    for (const post of posts) {
      await prisma.post.upsert({
        where: { id: post.id },
        update: {
          ...post,
          createdAt: new Date(post.createdAt),
          updatedAt: new Date(post.updatedAt),
        },
        create: {
          ...post,
          createdAt: new Date(post.createdAt),
          updatedAt: new Date(post.updatedAt),
        },
      });
    }

    console.log('Restoring comments...');
    for (const comment of comments) {
      await prisma.comment.upsert({
        where: { id: comment.id },
        update: {
          ...comment,
          createdAt: new Date(comment.createdAt),
          updatedAt: new Date(comment.updatedAt),
        },
        create: {
          ...comment,
          createdAt: new Date(comment.createdAt),
          updatedAt: new Date(comment.updatedAt),
        },
      });
    }

    console.log('Restoring tags...');
    for (const tag of tags) {
      await prisma.tag.upsert({
        where: { id: tag.id },
        update: {
          ...tag,
          createdAt: new Date(tag.createdAt),
          updatedAt: new Date(tag.updatedAt),
        },
        create: {
          ...tag,
          createdAt: new Date(tag.createdAt),
          updatedAt: new Date(tag.updatedAt),
        },
      });
    }

    console.log('Restoring social links...');
    for (const socialLink of socialLinks) {
      await prisma.socialLink.upsert({
        where: { id: socialLink.id },
        update: {
          ...socialLink,
          createdAt: new Date(socialLink.createdAt),
          updatedAt: new Date(socialLink.updatedAt),
        },
        create: {
          ...socialLink,
          createdAt: new Date(socialLink.createdAt),
          updatedAt: new Date(socialLink.updatedAt),
        },
      });
    }

    console.log('Data restoration completed successfully!');
  } catch (error) {
    console.error('Data restoration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

restoreToMySQL(); 