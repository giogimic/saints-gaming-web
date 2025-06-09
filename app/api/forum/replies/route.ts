import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { ForumReply } from '@/lib/types';
import { getForumReplies, createForumReply, updateForumReply, deleteForumReply } from '@/lib/db';
import { hasPermission } from '@/lib/permissions';

// GET: List all replies for a post
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId');

    const replies = await getForumReplies(postId || undefined);
    return NextResponse.json(replies);
  } catch (error) {
    console.error('Error fetching replies:', error);
    return NextResponse.json({ error: 'Failed to fetch replies' }, { status: 500 });
  }
}

// POST: Create a new reply
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, postId } = await req.json();
    if (!content || !postId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const reply: ForumReply = {
      id: crypto.randomUUID(),
      content,
      authorId: session.user.id,
      postId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await createForumReply(reply);
    return NextResponse.json(reply, { status: 201 });
  } catch (error) {
    console.error('Error creating reply:', error);
    return NextResponse.json({ error: 'Failed to create reply' }, { status: 500 });
  }
}

// PATCH: Update a reply
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, content } = await req.json();
    if (!id || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const replies = await getForumReplies();
    const reply = replies.find(r => r.id === id);
    if (!reply) {
      return NextResponse.json({ error: 'Reply not found' }, { status: 404 });
    }

    if (reply.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updatedReply: ForumReply = {
      ...reply,
      content,
      updatedAt: new Date().toISOString()
    };

    await updateForumReply(updatedReply);
    return NextResponse.json(updatedReply);
  } catch (error) {
    console.error('Error updating reply:', error);
    return NextResponse.json({ error: 'Failed to update reply' }, { status: 500 });
  }
}

// DELETE: Delete a reply
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing reply ID' }, { status: 400 });
    }

    const replies = await getForumReplies();
    const reply = replies.find(r => r.id === id);
    if (!reply) {
      return NextResponse.json({ error: 'Reply not found' }, { status: 404 });
    }

    if (reply.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteForumReply(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reply:', error);
    return NextResponse.json({ error: 'Failed to delete reply' }, { status: 500 });
  }
} 