import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { UserRole } from '@/lib/permissions';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const hashedPassword = await hash('admin123', 10);
    const adminUser = {
      name: 'Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: {
        create: {
          theme: 'system',
          notifications: true,
          language: 'en',
          timezone: 'UTC',
          emailNotifications: true,
          darkMode: false,
          showOnlineStatus: true
        }
      },
      gamingProfile: {
        create: {
          favoriteGames: JSON.stringify([]),
          gamingSetup: JSON.stringify([]),
          gamingPreferences: JSON.stringify([])
        }
      }
    };

    const user = await prisma.user.create({
      data: adminUser,
      include: {
        settings: true,
        gamingProfile: true
      }
    });

    console.log('Admin user created successfully:', user.email);
  } catch (error) {
    console.error('Failed to create admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser(); 