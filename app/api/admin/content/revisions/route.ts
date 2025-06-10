import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import prisma from '@/lib/prisma';
import { UserRole } from '@/lib/permissions';

// Helper to check admin/mod
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || ![UserRole.ADMIN, UserRole.MODERATOR].includes(session.user.role)) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('entityId');
    const type = searchParams.get('type');

    if (!entityId || !type) {
      return NextResponse.json({ error: 'Missing entityId or type' }, { status: 400 });
    }

    const revisions = await prisma.contentRevision.findMany({
      where: { entityId, type },
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json(revisions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch revisions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    const { content, type, entityId } = await request.json();
    if (!content || !type || !entityId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const revision = await prisma.contentRevision.create({
      data: {
        content,
        type,
        entityId,
        authorId: session.user.id,
      },
    });
    return NextResponse.json(revision);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to create revision' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireAdmin();
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing revision id' }, { status: 400 });
    }
    const revision = await prisma.contentRevision.findUnique({ where: { id } });
    if (!revision) {
      return NextResponse.json({ error: 'Revision not found' }, { status: 404 });
    }
    // Restore the revision by updating the page or block
    if (revision.type === 'page') {
      await prisma.page.update({
        where: { id: revision.entityId },
        data: { content: revision.content },
      });
    } else if (revision.type === 'block') {
      await prisma.contentBlock.update({
        where: { id: revision.entityId },
        data: { content: revision.content },
      });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to restore revision' }, { status: 500 });
  }
} 