'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { TiptapEditor } from '@/components/ui/tiptap-editor';
import { toast } from '@/components/ui/use-toast';
import { UserRole } from '@/lib/permissions';

interface PageEditorProps {
  page?: {
    id?: string;
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    imageUrl?: string;
    isPublished?: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
  onSave: (data: {
    id?: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    imageUrl?: string;
    isPublished: boolean;
  }) => Promise<void>;
}

export function PageEditor({ page, onSave }: PageEditorProps) {
  const { data: session } = useSession();
  const [title, setTitle] = useState(page?.title || '');
  const [slug, setSlug] = useState(page?.slug || '');
  const [content, setContent] = useState(page?.content || '');
  const [excerpt, setExcerpt] = useState(page?.excerpt || '');
  const [imageUrl, setImageUrl] = useState(page?.imageUrl || '');
  const [isPublished, setIsPublished] = useState(page?.isPublished || false);
  const [saving, setSaving] = useState(false);

  const canEdit = session?.user?.role && [UserRole.ADMIN, UserRole.MODERATOR].includes(session.user.role);

  if (!canEdit) {
    return <div>You do not have permission to edit this page.</div>;
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        id: page?.id,
        title,
        slug,
        content,
        excerpt,
        imageUrl,
        isPublished,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save page',
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
          placeholder="Enter page title"
        />
      </div>
      <div>
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="Enter page slug"
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
        <Label htmlFor="excerpt">Excerpt</Label>
        <Input
          id="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Enter page excerpt"
        />
      </div>
      <div>
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Enter image URL"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="isPublished"
          checked={isPublished}
          onCheckedChange={setIsPublished}
        />
        <Label htmlFor="isPublished">Published</Label>
      </div>
      <Button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Page'}
      </Button>
    </div>
  );
} 