import { hash } from 'bcryptjs';
import { saveUser } from '../lib/storage';
import { v4 as uuidv4 } from 'uuid';

async function createAdminUser() {
  try {
    const hashedPassword = await hash('12345', 10);

    const adminUser = {
      id: uuidv4(),
      name: 'Admin',
      email: 'admin@saintsgaming.com',
      password: hashedPassword,
      role: 'admin' as const,
      emailVerified: true,
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