"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface TiptapEditorProps {
  content: string;
  onChange?: (content: string) => void;
  editable?: boolean;
  className?: string;
}

export function TiptapEditor({ content, onChange, editable = true, className }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
    ],
    content,
    editable,
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  if (!editor) return <div>Loading editor...</div>;

  return (
    <div className={cn('border rounded-md p-2 bg-background', className)}>
      {/* Toolbar */}
      {editable && (
        <div className="flex flex-wrap gap-2 mb-2">
          <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'bg-primary text-primary-foreground' : ''}>
            Bold
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'bg-primary text-primary-foreground' : ''}>
            Italic
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().toggleStrike().run()} disabled={!editor.can().chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'bg-primary text-primary-foreground' : ''}>
            Strike
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'bg-primary text-primary-foreground' : ''}>
            Bullet List
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'bg-primary text-primary-foreground' : ''}>
            Numbered List
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().setParagraph().run()} className={editor.isActive('paragraph') ? 'bg-primary text-primary-foreground' : ''}>
            Paragraph
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'bg-primary text-primary-foreground' : ''}>
            H2
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'bg-primary text-primary-foreground' : ''}>
            H3
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => {
            const url = window.prompt('Enter image URL');
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}>
            Image
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => {
            const url = window.prompt('Enter link URL');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}>
            Link
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().unsetLink().run()}>
            Unlink
          </Button>
        </div>
      )}
      <EditorContent editor={editor} className="prose min-h-[200px] max-w-none" />
    </div>
  );
} 