import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { ForumPost } from '@/lib/types';
import { getForumPosts, createForumPost, updateForumPost, deleteForumPost } from '@/lib/db';
import { hasPermission } from '@/lib/permissions';

// GET: List all posts
export async function GET(req: NextRequest) {
  try {
    const posts = await getForumPosts();
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST: Create a new post
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { title, content, categoryId } = await req.json();
    if (!title || !content || !categoryId) {
      return NextResponse.json({ error: 'Title, content, and category are required' }, { status: 400 });
    }
    const post: ForumPost = {
      id: uuidv4(),
      title,
      content,
      authorId: session.user.id,
      categoryId,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const createdPost = await createForumPost(post);
    return NextResponse.json(createdPost);
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

// PATCH: Update a post
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id, ...updates } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }
    const posts = await getForumPosts();
    const post = posts.find(p => p.id === id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    if (post.authorId !== session.user.id && !hasPermission(session.user.role, 'manage:posts')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const updatedPost = await updateForumPost({ ...post, ...updates, updatedAt: new Date().toISOString() });
    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

// DELETE: Delete a post
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }
    const posts = await getForumPosts();
    const post = posts.find(p => p.id === id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    if (post.authorId !== session.user.id && !hasPermission(session.user.role, 'manage:posts')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await deleteForumPost(id);
    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
} 