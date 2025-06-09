"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Editor } from '@/components/editor';
import { useSession } from 'next-auth/react';
import { hasPermission } from '@/lib/permissions';
import { toast } from '@/components/ui/use-toast';

interface ThreadFormProps {
  children?: React.ReactNode;
  categoryId?: string;
  thread?: {
    id: string;
    title: string;
    content: string;
    isLocked?: boolean;
  };
}

export function ThreadForm({ children, categoryId, thread }: ThreadFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [title, setTitle] = useState(thread?.title || '');
  const [content, setContent] = useState(thread?.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canManageThreads = session?.user && hasPermission(session.user.role, 'manage:content');
  const canEdit = !thread?.isLocked || canManageThreads;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/forum/threads${thread ? `/${thread.id}` : ''}`, {
        method: thread ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          categoryId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save thread');
      }

      const data = await response.json();
      router.push(`/forum/${data.category.slug}/${data.slug}`);
      router.refresh();
    } catch (error) {
      console.error('Error saving thread:', error);
      toast.error('Failed to save thread');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canEdit) {
    return (
      <div className="text-center text-muted-foreground">
        <p>This thread is locked. Only moderators can edit it.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="text"
          placeholder="Thread title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <Editor value={content} onChange={setContent} />
      </div>
      <div className="flex justify-end gap-2">
        {children}
        <Button type="submit" disabled={isSubmitting}>
          {thread ? 'Update Thread' : 'Create Thread'}
        </Button>
      </div>
    </form>
  );
} 