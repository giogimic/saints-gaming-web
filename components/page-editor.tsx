'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ROLE_PERMISSIONS, type PageContent } from '@/lib/types';

interface PageEditorProps {
  page: PageContent;
  onSave: (content: string) => Promise<void>;
}

export function PageEditor({ page, onSave }: PageEditorProps) {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(page.content);
  const [isSaving, setIsSaving] = useState(false);

  const canEdit = session?.user?.role && ROLE_PERMISSIONS[session.user.role].canEditPages;

  if (!canEdit) {
    return null;
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(content);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving page:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="relative group">
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setIsEditing(true)}
        >
          Edit Page
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[400px] font-mono"
      />
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setContent(page.content);
            setIsEditing(false);
          }}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
} 