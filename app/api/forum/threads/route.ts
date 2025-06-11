import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleForumError, validateThreadInput, ForumError } from '@/lib/forum-error-handler';
import slugify from 'slugify';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where = categoryId ? { categoryId } : {};

    const [threads, total] = await Promise.all([
      prisma.thread.findMany({
        where,
      include: {
        author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
        },
          category: true,
          _count: {
            select: {
              posts: true,
            },
          },
      },
      orderBy: [
        { isPinned: 'desc' },
          { lastPostAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.thread.count({ where }),
    ]);

    return NextResponse.json({
      threads,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
      },
    });
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

    const data = await request.json();
    const { title, content, categoryId } = validateThreadInput(data);

    // Generate slug
    let slug = slugify(title, { lower: true, strict: true });
    let counter = 1;
    let uniqueSlug = slug;

    // Ensure slug uniqueness
    while (await prisma.thread.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    const thread = await prisma.thread.create({
      data: {
        title,
        content,
        slug: uniqueSlug,
        authorId: session.user.id,
        categoryId,
        viewCount: 0,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        category: true,
      },
    });

    return NextResponse.json(thread);
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

    const data = await request.json();
    const { id, title, content, categoryId } = data;

    if (!id) {
      throw new ForumError('Thread ID is required', 400);
    }

    const thread = await prisma.thread.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!thread) {
      throw new ForumError('Thread not found', 404);
    }

    if (thread.authorId !== session.user.id) {
      throw new ForumError('Not authorized to edit this thread', 403);
    }

    const updatedThread = await prisma.thread.update({
      where: { id },
      data: {
        title,
        content,
        categoryId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        category: true,
      },
    });

    return NextResponse.json(updatedThread);
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      throw new ForumError('Thread ID is required', 400);
    }

    const thread = await prisma.thread.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!thread) {
      throw new ForumError('Thread not found', 404);
    }

    if (thread.authorId !== session.user.id) {
      throw new ForumError('Not authorized to delete this thread', 403);
    }

    await prisma.thread.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleForumError(error);
  }
} 