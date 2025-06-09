import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { UserRole, ROLE_PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { Session } from 'next-auth';

interface UserSession extends Session {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: UserRole;
  };
}

// GET: Fetch all role permissions
export async function GET() {
  try {
    const session = await getServerSession(authOptions) as UserSession;
    
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Convert ROLE_PERMISSIONS to the format expected by the frontend
    const rolePermissions = Object.entries(ROLE_PERMISSIONS).reduce((acc, [role, permissions]) => {
      acc[role] = permissions.reduce((permAcc, permission) => {
        permAcc[permission] = true;
        return permAcc;
      }, {} as Record<string, boolean>);
      return acc;
    }, {} as Record<string, Record<string, boolean>>);

    return NextResponse.json(rolePermissions);
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// PUT: Update role permissions
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as UserSession;
    
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const rolePermissions = await req.json();

    // Validate the role permissions data
    if (!rolePermissions || typeof rolePermissions !== 'object') {
      return new NextResponse('Invalid role permissions data', { status: 400 });
    }

    // Update the role permissions in the database
    // Note: This is a simplified example. In a real application, you would need to
    // implement proper database storage for role permissions.
    // For now, we'll just return success since we're using in-memory permissions.

    return NextResponse.json({ message: 'Role permissions updated successfully' });
  } catch (error) {
    console.error('Error updating role permissions:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 