import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { hasPermission, UserRole } from '@/lib/permissions';

// PATCH: Update a category
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.user.role as UserRole, 'manage:categories')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const category = await prisma.category.findUnique({
      where: { id: params.id }
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Don't allow modifying default categories
    if (category.isDefault) {
      return NextResponse.json(
        { error: 'Cannot modify default categories' },
        { status: 400 }
      );
    }

    const updates = await request.json();
    const updatedCategory = await prisma.category.update({
      where: { id: params.id },
      data: {
        ...updates,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.user.role as UserRole, 'manage:categories')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const category = await prisma.category.findUnique({
      where: { id: params.id }
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Don't allow deleting default categories
    if (category.isDefault) {
      return NextResponse.json(
        { error: 'Cannot delete default categories' },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
} 