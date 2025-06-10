'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Table,
  Youtube,
  FileText,
  LayoutGrid,
  Columns,
  Box,
  Palette,
} from "lucide-react";
import { BlockSettings } from "@/types/content";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

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

const BLOCK_TYPES = [
  { value: "text", label: "Text Block" },
  { value: "heading", label: "Heading" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "button", label: "Button" },
  { value: "card", label: "Card" },
  { value: "grid", label: "Grid" },
  { value: "columns", label: "Columns" },
  { value: "quote", label: "Quote" },
  { value: "code", label: "Code Block" },
  { value: "table", label: "Table" },
  { value: "divider", label: "Divider" },
  { value: "spacer", label: "Spacer" },
  { value: "embed", label: "Embed" },
  { value: "file", label: "File" },
];

export function BlockEditor({ block, onSave }: BlockEditorProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState(block.content);
  const [title, setTitle] = useState(block.title || "");
  const [settings, setSettings] = useState<BlockSettings>(block.settings || {});
  const [activeTab, setActiveTab] = useState("content");

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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <div className="space-y-2">
            <Label>Block Type</Label>
            <Select
              value={block.type}
              onValueChange={(value) => onSave({ ...block, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select block type" />
              </SelectTrigger>
              <SelectContent>
                {BLOCK_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <Editor
              content={content}
              onChange={setContent}
              className="min-h-[200px]"
            />
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          {block.type === "image" && (
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={settings.imageUrl || ""}
                onChange={(e) => setSettings({ ...settings, imageUrl: e.target.value })}
                placeholder="Enter image URL"
              />
              <Label htmlFor="altText">Alt Text</Label>
              <Input
                id="altText"
                value={settings.altText || ""}
                onChange={(e) => setSettings({ ...settings, altText: e.target.value })}
                placeholder="Enter alt text"
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
              <Label htmlFor="videoType">Video Type</Label>
              <Select
                value={settings.videoType || "youtube"}
                onValueChange={(value) => setSettings({ ...settings, videoType: value as "youtube" | "vimeo" | "custom" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select video type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="vimeo">Vimeo</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
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
              <Label htmlFor="buttonType">Button Type</Label>
              <Select
                value={settings.buttonType || "primary"}
                onValueChange={(value) => setSettings({ ...settings, buttonType: value as "primary" | "secondary" | "outline" | "ghost" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select button type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                  <SelectItem value="outline">Outline</SelectItem>
                  <SelectItem value="ghost">Ghost</SelectItem>
                </SelectContent>
              </Select>
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
              <Label htmlFor="gap">Gap</Label>
              <Select
                value={settings.gap || "4"}
                onValueChange={(value) => setSettings({ ...settings, gap: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gap size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">Small</SelectItem>
                  <SelectItem value="4">Medium</SelectItem>
                  <SelectItem value="8">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {block.type === "embed" && (
            <div className="space-y-2">
              <Label htmlFor="embedUrl">Embed URL</Label>
              <Input
                id="embedUrl"
                value={settings.embedUrl || ""}
                onChange={(e) => setSettings({ ...settings, embedUrl: e.target.value })}
                placeholder="Enter embed URL"
              />
              <Label htmlFor="embedType">Embed Type</Label>
              <Select
                value={settings.embedType || "iframe"}
                onValueChange={(value) => setSettings({ ...settings, embedType: value as "iframe" | "script" | "custom" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select embed type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iframe">iFrame</SelectItem>
                  <SelectItem value="script">Script</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {block.type === "file" && (
            <div className="space-y-2">
              <Label htmlFor="fileUrl">File URL</Label>
              <Input
                id="fileUrl"
                value={settings.fileUrl || ""}
                onChange={(e) => setSettings({ ...settings, fileUrl: e.target.value })}
                placeholder="Enter file URL"
              />
              <Label htmlFor="fileName">File Name</Label>
              <Input
                id="fileName"
                value={settings.fileName || ""}
                onChange={(e) => setSettings({ ...settings, fileName: e.target.value })}
                placeholder="Enter file name"
              />
              <Label htmlFor="fileType">File Type</Label>
              <Select
                value={settings.fileType || "document"}
                onValueChange={(value) => setSettings({ ...settings, fileType: value as "document" | "image" | "video" | "audio" | "other" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select file type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </TabsContent>

        <TabsContent value="style" className="space-y-4">
          <div className="space-y-2">
            <Label>Background Color</Label>
            <Input
              type="color"
              value={settings.backgroundColor || "#ffffff"}
              onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Text Color</Label>
            <Input
              type="color"
              value={settings.textColor || "#000000"}
              onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Alignment</Label>
            <Select
              value={settings.alignment || "left"}
              onValueChange={(value) => setSettings({ ...settings, alignment: value as "left" | "center" | "right" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select alignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Padding</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                value={settings.padding?.split(" ")[0] || "0"}
                onChange={(e) => setSettings({ ...settings, padding: `${e.target.value}px` })}
                placeholder="Padding"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Border Radius</Label>
            <Input
              type="number"
              value={settings.borderRadius?.replace("px", "") || "0"}
              onChange={(e) => setSettings({ ...settings, borderRadius: `${e.target.value}px` })}
              placeholder="Border radius"
            />
          </div>

          <div className="space-y-2">
            <Label>Shadow</Label>
            <Select
              value={settings.shadow || "none"}
              onValueChange={(value) => setSettings({ ...settings, shadow: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select shadow" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="md">Medium</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Opacity</Label>
            <Slider
              value={[settings.opacity || 100]}
              onValueChange={(value: number[]) => setSettings({ ...settings, opacity: value[0] })}
              min={0}
              max={100}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <Label>Animation</Label>
            <Select
              value={settings.animation || "none"}
              onValueChange={(value) => setSettings({ ...settings, animation: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select animation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="fade">Fade</SelectItem>
                <SelectItem value="slide">Slide</SelectItem>
                <SelectItem value="bounce">Bounce</SelectItem>
                <SelectItem value="scale">Scale</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Custom Class</Label>
            <Input
              value={settings.customClass || ""}
              onChange={(e) => setSettings({ ...settings, customClass: e.target.value })}
              placeholder="Enter custom CSS class"
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </Card>
  );
}

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  className?: string;
}

export function Editor({ content, onChange, className }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
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
    <div className={cn("border rounded-md", className)}>
      <div className="border-b p-2 flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-muted' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-muted' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-muted' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-muted' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-muted' : ''}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'bg-muted' : ''}
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : ''}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : ''}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : ''}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const url = window.prompt('Enter image URL:');
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
            const url = window.prompt('Enter link URL:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent editor={editor} className="p-4 prose max-w-none" />
    </div>
  );
} 