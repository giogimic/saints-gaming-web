"use client";

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useEditMode } from '@/app/contexts/EditModeContext';

interface Post {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
}

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: string;
  updatedAt: string;
}

export function ForumPost({ post }: { post: Post }) {
  const { isEditMode } = useEditMode();
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/forum/posts/${post.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const comment = await response.json();
      setComments(prev => [...prev, comment]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className={`space-y-4${isEditMode ? ' edit-mode' : ''}`}>
      <div className="flex gap-4">
        <img
          src={post.author.avatar}
          alt={post.author.name}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold">{post.author.name}</span>
              <span className="text-sm text-muted-foreground ml-2">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
          <div className="mt-2 prose prose-invert max-w-none">
            {post.content}
          </div>
        </div>
      </div>

      {comments.length > 0 && (
        <div className="ml-12 space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <img
                src={comment.author.avatar}
                alt={comment.author.name}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold">{comment.author.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <div className="mt-2 prose prose-invert max-w-none">
                  {comment.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="ml-12">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="mb-2"
        />
        <Button onClick={handleAddComment} disabled={!newComment.trim()}>
          Add Comment
        </Button>
      </div>
    </div>
  );
} 