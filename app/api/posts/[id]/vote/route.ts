import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPostById, addVote, removeVote } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const post = await getPostById(params.id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const { value } = await request.json();
    if (value !== 1 && value !== -1) {
      return NextResponse.json(
        { error: 'Invalid vote value' },
        { status: 400 }
      );
    }

    // Check if user has already voted
    const existingVote = post.votes.find((v: any) => v.userId === session.user.id);
    if (existingVote) {
      if (existingVote.value === value) {
        // Remove vote if clicking the same button
        await removeVote(post.id, session.user.id);
      } else {
        // Update vote if changing from upvote to downvote or vice versa
        await removeVote(post.id, session.user.id);
        await addVote({
          id: uuidv4(),
          postId: post.id,
          userId: session.user.id,
          value,
          createdAt: new Date().toISOString()
        });
      }
    } else {
      // Add new vote
      await addVote({
        id: uuidv4(),
        postId: post.id,
        userId: session.user.id,
        value,
        createdAt: new Date().toISOString()
      });
    }

    // Get updated post
    const updatedPost = await getPostById(params.id);
    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error voting on post:', error);
    return NextResponse.json(
      { error: 'Failed to vote on post' },
      { status: 500 }
    );
  }
} 