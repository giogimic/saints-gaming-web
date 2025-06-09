'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { updatePost } from '@/lib/storage';
import { ForumPost as ForumPostType, ForumReply } from '@/lib/types';
import { hasPermission } from '@/lib/auth';
import { savePost, updatePost } from '@/lib/storage';
import { randomUUID } from 'crypto';

interface ForumPostProps {
  post: ForumPostType;
  currentUser: User | null;
  onUpdate?: () => void;
}

export function ForumPost({ post, currentUser, onUpdate }: ForumPostProps) {
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const canReply = currentUser && hasPermission(currentUser.role, 'user');
  const canModerate = currentUser && hasPermission(currentUser.role, 'mod');

  const handleReply = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    const newReply: ForumReply = {
      id: Date.now().toString(),
      postId: post.id,
      content: replyContent,
      authorId: 'current-user', // TODO: Get from auth context
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isEdited: false,
      likes: [],
      isSolution: false
    };

    await updatePost(post.id, {
      replies: [...(post.replies || []), newReply],
    });

    setReplyContent('');
    setIsReplying(false);
    onUpdate?.();
  };

  const handleLock = async () => {
    if (!canModerate) return;

    const updatedPost = {
      ...post,
      isLocked: !post.isLocked,
    };

    await savePost(updatedPost);
    onUpdate?.();
  };

  const handlePin = async () => {
    if (!canModerate) return;

    const updatedPost = {
      ...post,
      isPinned: !post.isPinned,
    };

    await savePost(updatedPost);
    onUpdate?.();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{post.title}</h2>
            {canModerate && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLock}
                >
                  {post.isLocked ? 'Unlock' : 'Lock'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePin}
                >
                  {post.isPinned ? 'Unpin' : 'Pin'}
                </Button>
              </div>
            )}
          </div>
          <p className="text-muted-foreground">{post.content}</p>
        </div>
      </div>

      <div className="space-y-4">
        {post.replies && post.replies.length > 0 && (
          <div className="ml-4 mb-4">
            {post.replies.map((reply) => (
              <div key={reply.id} className="border-l-2 pl-4 mb-2">
                <p className="text-sm text-gray-600">{reply.content}</p>
                <p className="text-xs text-gray-400">
                  {new Date(reply.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {canReply && !post.isLocked && (
          <div className="space-y-4">
            {!isReplying ? (
              <Button onClick={() => setIsReplying(true)}>Reply</Button>
            ) : (
              <form onSubmit={handleReply} className="mt-4">
                <Textarea
                  value={replyContent}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyContent(e.target.value)}
                  placeholder="Write your reply..."
                  className="mb-2"
                />
                <div className="flex gap-2">
                  <Button type="submit">Submit</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsReplying(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 