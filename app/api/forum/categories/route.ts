import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { ForumCategory } from '@/lib/types';
import { getForumCategories, createForumCategory, updateForumCategory, deleteForumCategory } from '@/lib/db';
import { hasPermission } from '@/lib/permissions';

// GET: List all categories
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('id');

    const categories = await getForumCategories(categoryId || undefined);
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST: Create a new category
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, order } = await request.json();
    if (!name || !description || order === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const category: ForumCategory = {
      id: crypto.randomUUID(),
      name,
      description,
      order,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await createForumCategory(category);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

// PATCH: Update a category
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, name, description, order } = await request.json();
    if (!id || !name || !description || order === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const categories = await getForumCategories(id);
    if (!Array.isArray(categories)) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const category = categories.find(c => c.id === id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const updatedCategory: ForumCategory = {
      ...category,
      name,
      description,
      order,
      updatedAt: new Date().toISOString()
    };

    await updateForumCategory(updatedCategory);
    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE: Delete a category
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing category ID' }, { status: 400 });
    }

    const categories = await getForumCategories(id);
    if (!Array.isArray(categories)) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const category = categories.find(c => c.id === id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    await deleteForumCategory(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
} 