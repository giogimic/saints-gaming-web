import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { hasPermission, UserRole } from "@/lib/permissions";
import { handleForumError, ForumError } from '@/lib/forum-error-handler';
import slugify from 'slugify';

const categorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  slug: z.string().min(1).max(100).optional(),
  order: z.number().int().min(0).optional(),
});

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            threads: true,
          },
        },
        threads: {
          take: 5,
          orderBy: {
            lastPostAt: 'desc',
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            _count: {
              select: {
                posts: true,
              },
            },
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    return handleForumError(error);
  }
}

export async function POST(request: Request) {
  try {
  const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new ForumError('Unauthorized', 401);
    }

    // Check if user has admin permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== UserRole.ADMIN) {
      throw new ForumError('Not authorized to create categories', 403);
  }

    const data = await request.json();
    const { name, description, order } = data;

    if (!name || typeof name !== 'string' || name.length > 100) {
      throw new ForumError('Invalid category name', 400);
    }

    if (description && (typeof description !== 'string' || description.length > 500)) {
      throw new ForumError('Invalid category description', 400);
    }

    // Generate slug
    const slug = slugify(name, { lower: true, strict: true });

    const category = await prisma.category.create({
      data: {
        name,
        description,
        slug,
        order: order || 0,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    return handleForumError(error);
  }
}

export async function PATCH(request: Request) {
  try {
  const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new ForumError('Unauthorized', 401);
    }

    // Check if user has admin permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== UserRole.ADMIN) {
      throw new ForumError('Not authorized to update categories', 403);
  }

    const data = await request.json();
    const { id, name, description, order } = data;

    if (!id) {
      throw new ForumError('Category ID is required', 400);
    }

    if (name && (typeof name !== 'string' || name.length > 100)) {
      throw new ForumError('Invalid category name', 400);
    }

    if (description && (typeof description !== 'string' || description.length > 500)) {
      throw new ForumError('Invalid category description', 400);
    }

    // Generate new slug if name is updated
    const slug = name ? slugify(name, { lower: true, strict: true }) : undefined;

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
        slug,
        order,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    return handleForumError(error);
  }
}

export async function DELETE(request: Request) {
  try {
  const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new ForumError('Unauthorized', 401);
    }

    // Check if user has admin permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== UserRole.ADMIN) {
      throw new ForumError('Not authorized to delete categories', 403);
  }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      throw new ForumError('Category ID is required', 400);
    }

    // Check if category has threads
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            threads: true,
          },
        },
      },
    });

    if (!category) {
      throw new ForumError('Category not found', 404);
    }

    if (category._count.threads > 0) {
      throw new ForumError('Cannot delete category with existing threads', 400);
    }

    await prisma.category.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleForumError(error);
  }
} 