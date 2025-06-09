import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { hasPermission, UserRole } from '@/lib/permissions';
import { v4 as uuidv4 } from 'uuid';

// GET: List all categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' }
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST: Create a new category (admin/moderator only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.user.role as UserRole, 'manage:categories')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Get current categories to determine order
    const categories = await prisma.category.findMany({
      orderBy: { order: 'desc' },
      take: 1
    });
    const maxOrder = categories[0]?.order ?? 0;

    const category = await prisma.category.create({
      data: {
        id: uuidv4(),
        name,
        description: description || '',
        order: maxOrder + 1,
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
} 