import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getUserById, saveUser } from '@/lib/storage';
import { compare, hash } from 'bcryptjs';
import { hasPermission } from '@/lib/permissions';

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, currentPassword, newPassword, confirmPassword } = await req.json();
    const user = await getUserById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updates: any = {};

    // Update name if provided
    if (name && name !== user.name) {
      updates.name = name;
    }

    // Update password if provided
    if (currentPassword && newPassword) {
      if (newPassword !== confirmPassword) {
        return NextResponse.json({ error: 'New passwords do not match' }, { status: 400 });
      }

      if (!user.password) {
        return NextResponse.json({ error: 'No password set for this account' }, { status: 400 });
      }

      const isValid = await compare(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      updates.password = await hash(newPassword, 10);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: 'No changes to update' });
    }

    // Save updates
    await saveUser({
      ...user,
      ...updates,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
} 