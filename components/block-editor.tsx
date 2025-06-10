'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TiptapEditor } from '@/components/tiptap-editor';
import { toast } from '@/components/ui/use-toast';
import { UserRole } from '@/lib/permissions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Image as ImageIcon,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { BlockSettings } from "@/types/content";
import { Card } from "@/components/ui/card";

interface BlockEditorProps {
  block: {
    id: string;
    type: string;
    content: string;
    settings?: BlockSettings;
    title?: string;
  };
  onSave: (block: {
    id: string;
    type: string;
    content: string;
    settings?: BlockSettings;
    title?: string;
  }) => void;
}

export function BlockEditor({ block, onSave }: BlockEditorProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState(block.content);
  const [title, setTitle] = useState(block.title || "");
  const [settings, setSettings] = useState<BlockSettings>(block.settings || {});

  const canEdit = session?.user?.role && [UserRole.ADMIN, UserRole.MODERATOR].includes(session.user.role);

  if (!canEdit) {
    return null;
  }

  const handleSave = () => {
    onSave({
      ...block,
      content,
      title,
      settings,
    });
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Block title (optional)"
        />
      </div>

      <div className="space-y-2">
        <Label>Content</Label>
        <TiptapEditor
          content={content}
          onChange={setContent}
          className="min-h-[200px]"
        />
      </div>

      {/* Block-specific settings */}
      {block.type === "image" && (
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            value={settings.imageUrl || ""}
            onChange={(e) => setSettings({ ...settings, imageUrl: e.target.value })}
            placeholder="Enter image URL"
          />
        </div>
      )}

      {block.type === "video" && (
        <div className="space-y-2">
          <Label htmlFor="videoUrl">Video URL</Label>
          <Input
            id="videoUrl"
            value={settings.videoUrl || ""}
            onChange={(e) => setSettings({ ...settings, videoUrl: e.target.value })}
            placeholder="Enter video URL"
          />
        </div>
      )}

      {block.type === "button" && (
        <div className="space-y-2">
          <Label htmlFor="buttonText">Button Text</Label>
          <Input
            id="buttonText"
            value={settings.buttonText || ""}
            onChange={(e) => setSettings({ ...settings, buttonText: e.target.value })}
            placeholder="Enter button text"
          />
          <Label htmlFor="buttonUrl">Button URL</Label>
          <Input
            id="buttonUrl"
            value={settings.buttonUrl || ""}
            onChange={(e) => setSettings({ ...settings, buttonUrl: e.target.value })}
            placeholder="Enter button URL"
          />
        </div>
      )}

      {block.type === "grid" && (
        <div className="space-y-2">
          <Label htmlFor="columns">Columns</Label>
          <Select
            value={settings.columns?.toString() || "2"}
            onValueChange={(value) => setSettings({ ...settings, columns: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select number of columns" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Column</SelectItem>
              <SelectItem value="2">2 Columns</SelectItem>
              <SelectItem value="3">3 Columns</SelectItem>
              <SelectItem value="4">4 Columns</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </Card>
  );
}

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  className?: string;
}

export function TiptapEditor({ content, onChange, className }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-1 p-1 border rounded-md bg-muted/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(editor.isActive("bold") && "bg-muted")}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(editor.isActive("italic") && "bg-muted")}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(editor.isActive("bulletList") && "bg-muted")}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(editor.isActive("orderedList") && "bg-muted")}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const url = window.prompt("Enter image URL");
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const url = window.prompt("Enter link URL");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={cn(editor.isActive("link") && "bg-muted")}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={cn(editor.isActive({ textAlign: "left" }) && "bg-muted")}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={cn(editor.isActive({ textAlign: "center" }) && "bg-muted")}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={cn(editor.isActive({ textAlign: "right" }) && "bg-muted")}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent editor={editor} className="prose prose-sm max-w-none" />
    </div>
  );
} 