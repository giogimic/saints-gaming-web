import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPost, getPosts } from '@/lib/db';
import { hasPermission } from '@/lib/permissions';
import { v4 as uuidv4 } from 'uuid';

// GET: List all posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const posts = await getPosts(categoryId || undefined);
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST: Create a new post
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.user.role, 'create:post')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title, content, categoryId } = await request.json();

    if (!title || !content || !categoryId) {
      return NextResponse.json(
        { error: 'Title, content, and category are required' },
        { status: 400 }
      );
    }

    const post = await createPost({
      id: uuidv4(),
      title,
      content,
      categoryId,
      authorId: session.user.id,
      authorName: session.user.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      votes: [],
      isPinned: false
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
} 