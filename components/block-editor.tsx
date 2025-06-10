'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TiptapEditor } from '@/components/ui/tiptap-editor';
import { toast } from '@/components/ui/use-toast';
import { UserRole } from '@/lib/permissions';

interface BlockEditorProps {
  block?: {
    id?: string;
    title?: string;
    content?: string;
    type?: string;
    order?: number;
    metadata?: Record<string, any>;
    createdAt?: string;
    updatedAt?: string;
  };
  onSave: (data: {
    id?: string;
    title: string;
    content: string;
    type: string;
    order: number;
    metadata?: Record<string, any>;
  }) => Promise<void>;
}

export function BlockEditor({ block, onSave }: BlockEditorProps) {
  const { data: session } = useSession();
  const [title, setTitle] = useState(block?.title || '');
  const [content, setContent] = useState(block?.content || '');
  const [type, setType] = useState(block?.type || '');
  const [order, setOrder] = useState(block?.order || 0);
  const [metadata, setMetadata] = useState<Record<string, any>>(block?.metadata || {});
  const [saving, setSaving] = useState(false);

  const canEdit = session?.user?.role && [UserRole.ADMIN, UserRole.MODERATOR].includes(session.user.role);

  if (!canEdit) {
    return <div>You do not have permission to edit this block.</div>;
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        id: block?.id,
        title,
        content,
        type,
        order,
        metadata,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save block',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter block title"
        />
      </div>
      <div>
        <Label htmlFor="content">Content</Label>
        <TiptapEditor
          content={content}
          onChange={setContent}
        />
      </div>
      <div>
        <Label htmlFor="type">Type</Label>
        <Input
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="Enter block type"
        />
      </div>
      <div>
        <Label htmlFor="order">Order</Label>
        <Input
          id="order"
          type="number"
          value={order}
          onChange={(e) => setOrder(Number(e.target.value))}
          placeholder="Enter block order"
        />
      </div>
      <div>
        <Label htmlFor="metadata">Metadata</Label>
        <Input
          id="metadata"
          value={JSON.stringify(metadata)}
          onChange={(e) => {
            try {
              setMetadata(JSON.parse(e.target.value));
            } catch (error) {
              // Handle invalid JSON
            }
          }}
          placeholder="Enter block metadata as JSON"
        />
      </div>
      <Button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Block'}
      </Button>
    </div>
  );
} 