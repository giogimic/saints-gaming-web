import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/permissions';
import { z } from 'zod';
import { handleForumError, ForumError } from '@/lib/forum-error-handler';
import { UserRole } from '@prisma/client';
import slugify from 'slugify';

const tagSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().optional(),
  isHidden: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('categoryId');
    const includeHidden = session?.user && hasPermission(session.user.role, 'view:hidden');

    const tags = await prisma.tag.findMany({
      where: {
        isHidden: includeHidden ? undefined : false,
      },
      include: {
        _count: {
          select: {
            threads: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(tags);
  } catch (error) {
    return handleForumError(error);
  }
}

export async function POST(request: NextRequest) {
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

    if (user?.role !== UserRole.admin) {
      throw new ForumError('Not authorized to create tags', 403);
    }

    const data = await request.json();
    const { name, description, color } = data;

    if (!name || typeof name !== 'string' || name.length > 50) {
      throw new ForumError('Invalid tag name', 400);
    }

    if (description && (typeof description !== 'string' || description.length > 200)) {
      throw new ForumError('Invalid tag description', 400);
    }

    if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
      throw new ForumError('Invalid color format', 400);
    }

    // Generate slug
    const slug = slugify(name, { lower: true, strict: true });

    const tag = await prisma.tag.create({
      data: {
        name,
        description,
        slug,
        color: color || '#666666',
        createdBy: {
          connect: {
            id: session.user.id,
          },
        },
      },
    });

    return NextResponse.json(tag);
  } catch (error) {
    return handleForumError(error);
  }
}

export async function PATCH(request: NextRequest) {
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

    if (user?.role !== UserRole.admin) {
      throw new ForumError('Not authorized to update tags', 403);
    }

    const data = await request.json();
    const { id, name, description, color } = data;

    if (!id) {
      throw new ForumError('Tag ID is required', 400);
    }

    if (name && (typeof name !== 'string' || name.length > 50)) {
      throw new ForumError('Invalid tag name', 400);
    }

    if (description && (typeof description !== 'string' || description.length > 200)) {
      throw new ForumError('Invalid tag description', 400);
    }

    if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
      throw new ForumError('Invalid color format', 400);
    }

    // Generate new slug if name is updated
    const slug = name ? slugify(name, { lower: true, strict: true }) : undefined;

    const tag = await prisma.tag.update({
      where: { id },
      data: {
        name,
        description,
        slug,
        color,
      },
    });

    return NextResponse.json(tag);
  } catch (error) {
    return handleForumError(error);
  }
}

export async function DELETE(request: NextRequest) {
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

    if (user?.role !== UserRole.admin) {
      throw new ForumError('Not authorized to delete tags', 403);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      throw new ForumError('Tag ID is required', 400);
    }

    // Check if tag has threads
    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            threads: true,
          },
        },
      },
    });

    if (!tag) {
      throw new ForumError('Tag not found', 404);
    }

    if (tag._count.threads > 0) {
      throw new ForumError('Cannot delete tag with existing threads', 400);
    }

    await prisma.tag.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleForumError(error);
  }
} 