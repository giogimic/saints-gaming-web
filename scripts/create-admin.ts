import { saveUser } from '@/lib/storage';
import { hash } from 'bcryptjs';
import { UserRole } from '@/lib/types';

async function createAdminUser() {
  try {
    const hashedPassword = await hash('admin123', 10);
    const adminUser = {
      id: crypto.randomUUID(),
      name: 'Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      emailVerified: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveUser(adminUser);
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Failed to create admin user:', error);
  }
}

createAdminUser(); 