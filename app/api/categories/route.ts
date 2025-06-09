import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, requireRole } from '@/lib/api-utils';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  slug: z.string().min(1).max(100),
  order: z.number().optional(),
  isDefault: z.boolean().optional(),
});

const updateCategorySchema = categorySchema.extend({
  id: z.string(),
});

// GET: List all categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(categories);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST: Create a new category (admin/moderator only)
export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(['admin']);
    const data = await req.json();
    const validatedData = categorySchema.parse(data);

    const category = await prisma.category.create({
      data: validatedData,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireRole(['admin']);
    const data = await req.json();
    const { id, ...updateData } = updateCategorySchema.parse(data);

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(category);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireRole(['admin']);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      throw new Error('Category ID is required');
    }

    await prisma.category.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
} 