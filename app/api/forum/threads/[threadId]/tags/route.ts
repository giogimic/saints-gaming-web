import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/permissions';
import { z } from 'zod';

const tagIdsSchema = z.array(z.string());

export async function GET(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const tags = await prisma.threadTag.findMany({
      where: {
        threadId: params.threadId,
      },
      include: {
        tag: true,
      },
    });

    return NextResponse.json(tags.map(t => t.tag));
  } catch (error) {
    console.error('Error fetching thread tags:', error);
    return NextResponse.json({ error: 'Failed to fetch thread tags' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const thread = await prisma.thread.findUnique({
      where: { id: params.threadId },
      include: { category: true },
    });

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    // Check if user has permission to tag threads in this category
    const canTag = hasPermission(session.user.role, 'tag:threads') ||
      (thread.authorId === session.user.id && hasPermission(session.user.role, 'tag:own_threads'));

    if (!canTag) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const tagIds = tagIdsSchema.parse(body);

    // Remove existing tags
    await prisma.threadTag.deleteMany({
      where: { threadId: params.threadId },
    });

    // Add new tags
    const threadTags = await prisma.threadTag.createMany({
      data: tagIds.map(tagId => ({
        threadId: params.threadId,
        tagId,
      })),
    });

    return NextResponse.json({ success: true, count: threadTags.count });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error updating thread tags:', error);
    return NextResponse.json({ error: 'Failed to update thread tags' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { threadId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !hasPermission(session.user.role, 'manage:tags')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get('tagId');

    if (!tagId) {
      return NextResponse.json({ error: 'Tag ID is required' }, { status: 400 });
    }

    await prisma.threadTag.delete({
      where: {
        threadId_tagId: {
          threadId: params.threadId,
          tagId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing thread tag:', error);
    return NextResponse.json({ error: 'Failed to remove thread tag' }, { status: 500 });
  }
} 