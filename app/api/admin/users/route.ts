import { NextRequest, NextResponse } from 'next/server';
import { getUsers, getUserById, updateUser, deleteUser } from '@/lib/db';
import { hasPermission } from '@/lib/permissions';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// GET: List all users (admin only)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !hasPermission(session.user.role, 'manage:users')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const users = await getUsers();
  return NextResponse.json(users);
}

// PATCH: Update user (admin only)
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !hasPermission(session.user.role, 'manage:users')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const { id, updates } = await req.json();
  const user = await getUserById(id);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  await updateUser({ ...user, ...updates, updatedAt: new Date().toISOString() });
  return NextResponse.json({ message: 'User updated' });
}

// DELETE: Delete user (admin only)
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !hasPermission(session.user.role, 'manage:users')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const { id } = await req.json();
  await deleteUser(id);
  return NextResponse.json({ message: 'User deleted' });
} 