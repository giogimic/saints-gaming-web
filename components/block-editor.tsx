'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Type,
  Image as ImageIcon2,
  Link2,
  Grid,
  Layout,
  MessageSquare,
} from "lucide-react";
import { BlockSettings } from "@/types/content";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { ContentBlock } from "@/types/content";
import { RichTextToolbar } from "@/components/rich-text-toolbar";

interface BlockEditorProps {
  block: ContentBlock;
  onSave: (block: ContentBlock) => void;
}

const BLOCK_TYPES = [
  { value: "hero", label: "Hero Section", icon: Layout },
  { value: "grid", label: "Grid Layout", icon: Grid },
  { value: "card", label: "Card", icon: Box },
  { value: "cta", label: "Call to Action", icon: MessageSquare },
  { value: "text", label: "Text Block", icon: Type },
  { value: "heading", label: "Heading", icon: Heading1 },
  { value: "image", label: "Image", icon: ImageIcon2 },
  { value: "button", label: "Button", icon: Link2 },
  { value: "divider", label: "Divider", icon: Separator },
  { value: "spacer", label: "Spacer", icon: Box },
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
      order: block.order,
    });
  };

  const editor = useEditor({
    extensions: [StarterKit, Image, Link, TextAlign],
        content,
    onUpdate: ({ editor }) => setContent(editor.getHTML()),
  });

  const renderBlockEditor = () => {
    switch (block.type) {
      case "hero":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter hero title"
              />
            </div>
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter hero subtitle"
              />
            </div>
            <div className="space-y-2">
              <Label>Background Image URL</Label>
              <Input
                value={settings.imageUrl || ""}
                onChange={(e) => setSettings({ ...settings, imageUrl: e.target.value })}
                placeholder="Enter background image URL"
              />
            </div>
            <div className="space-y-2">
              <Label>Button Text</Label>
              <Input
                value={settings.buttonText || ""}
                onChange={(e) => setSettings({ ...settings, buttonText: e.target.value })}
                placeholder="Enter button text"
              />
            </div>
            <div className="space-y-2">
              <Label>Button URL</Label>
              <Input
                value={settings.buttonUrl || ""}
                onChange={(e) => setSettings({ ...settings, buttonUrl: e.target.value })}
                placeholder="Enter button URL"
              />
            </div>
            <div className="space-y-2">
              <Label>Background Color</Label>
              <Input
                type="color"
                value={settings.backgroundColor || "#ffffff"}
                onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
              />
            </div>
          </div>
        );

      case "grid":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter grid title"
              />
            </div>
            <div className="space-y-2">
              <Label>Number of Columns</Label>
              <Select
                value={settings.columns?.toString() || "3"}
                onValueChange={(value) => setSettings({ ...settings, columns: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select number of columns" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Columns</SelectItem>
                  <SelectItem value="3">3 Columns</SelectItem>
                  <SelectItem value="4">4 Columns</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Grid Items (JSON)</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder='[{"title": "Item 1", "description": "Description 1", "icon": "icon-url-1"}, ...]'
              />
            </div>
          </div>
        );

      case "card":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter card title"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter card description"
              />
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={settings.imageUrl || ""}
                onChange={(e) => setSettings({ ...settings, imageUrl: e.target.value })}
                placeholder="Enter image URL"
              />
            </div>
            <div className="space-y-2">
              <Label>Button Text</Label>
              <Input
                value={settings.buttonText || ""}
                onChange={(e) => setSettings({ ...settings, buttonText: e.target.value })}
                placeholder="Enter button text"
              />
            </div>
            <div className="space-y-2">
              <Label>Button URL</Label>
              <Input
                value={settings.buttonUrl || ""}
                onChange={(e) => setSettings({ ...settings, buttonUrl: e.target.value })}
                placeholder="Enter button URL"
              />
            </div>
          </div>
        );

      case "cta":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter CTA title"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter CTA description"
              />
            </div>
            <div className="space-y-2">
              <Label>Button Text</Label>
              <Input
                value={settings.buttonText || ""}
                onChange={(e) => setSettings({ ...settings, buttonText: e.target.value })}
                placeholder="Enter button text"
              />
            </div>
            <div className="space-y-2">
              <Label>Button URL</Label>
              <Input
                value={settings.buttonUrl || ""}
                onChange={(e) => setSettings({ ...settings, buttonUrl: e.target.value })}
                placeholder="Enter button URL"
              />
            </div>
            <div className="space-y-2">
              <Label>Background Color</Label>
              <Input
                type="color"
                value={settings.backgroundColor || "#ffffff"}
                onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
              />
            </div>
          </div>
        );

      case "text":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Content</Label>
              {editor && <RichTextToolbar editor={editor} />}
              <EditorContent editor={editor} className="prose max-w-none border rounded-md p-2 min-h-[120px]" />
            </div>
          </div>
        );

      case "heading":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Heading Level</Label>
              <Select
                value={settings.level || "h1"}
                onValueChange={(value) => setSettings({ ...settings, level: value as "h1" | "h2" | "h3" | "h4" | "h5" | "h6" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select heading level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="h1">Heading 1</SelectItem>
                  <SelectItem value="h2">Heading 2</SelectItem>
                  <SelectItem value="h3">Heading 3</SelectItem>
                  <SelectItem value="h4">Heading 4</SelectItem>
                  <SelectItem value="h5">Heading 5</SelectItem>
                  <SelectItem value="h6">Heading 6</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Text</Label>
              <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter heading text"
              />
            </div>
          </div>
        );

      case "image":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter image URL"
              />
            </div>
            <div className="space-y-2">
              <Label>Alt Text</Label>
              <Input
                value={settings.altText || ""}
                onChange={(e) => setSettings({ ...settings, altText: e.target.value })}
                placeholder="Enter alt text"
              />
            </div>
            <div className="space-y-2">
              <Label>Caption</Label>
              <Input
                value={settings.caption || ""}
                onChange={(e) => setSettings({ ...settings, caption: e.target.value })}
                placeholder="Enter image caption"
              />
            </div>
            <div className="space-y-2">
              <Label>Alignment</Label>
              <Select
                value={settings.alignment || "center"}
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
          </div>
        );

      case "button":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Button Text</Label>
              <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter button text"
              />
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input
                value={settings.buttonUrl || ""}
                onChange={(e) => setSettings({ ...settings, buttonUrl: e.target.value })}
                placeholder="Enter button URL"
              />
            </div>
            <div className="space-y-2">
              <Label>Variant</Label>
              <Select
                value={settings.variant || "default"}
                onValueChange={(value) => setSettings({ ...settings, variant: value as "default" | "secondary" | "outline" | "ghost" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select button variant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                  <SelectItem value="outline">Outline</SelectItem>
                  <SelectItem value="ghost">Ghost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "divider":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Style</Label>
              <Select
                value={settings.style || "solid"}
                onValueChange={(value) => setSettings({ ...settings, style: value as "solid" | "dashed" | "dotted" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select divider style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Solid</SelectItem>
                  <SelectItem value="dashed">Dashed</SelectItem>
                  <SelectItem value="dotted">Dotted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <Input
                type="color"
                value={settings.color || "#000000"}
                onChange={(e) => setSettings({ ...settings, color: e.target.value })}
              />
            </div>
          </div>
        );

      case "spacer":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Height (px)</Label>
              <Input
                type="number"
                value={settings.height || "32"}
                onChange={(e) => setSettings({ ...settings, height: e.target.value })}
                min="0"
                max="200"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter content"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="content" className="space-y-4">
          {renderBlockEditor()}
        </TabsContent>
        <TabsContent value="settings" className="space-y-4">
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
            <Label>Padding</Label>
            <Input
              value={settings.padding || "1rem"}
              onChange={(e) => setSettings({ ...settings, padding: e.target.value })}
              placeholder="Enter padding (e.g., 1rem)"
        />
      </div>
          <div className="space-y-2">
            <Label>Margin</Label>
        <Input
              value={settings.margin || "0"}
              onChange={(e) => setSettings({ ...settings, margin: e.target.value })}
              placeholder="Enter margin (e.g., 1rem)"
        />
      </div>
          <div className="space-y-2">
            <Label>Border Radius</Label>
        <Input
              value={settings.borderRadius || "0"}
              onChange={(e) => setSettings({ ...settings, borderRadius: e.target.value })}
              placeholder="Enter border radius (e.g., 0.5rem)"
            />
          </div>
          <div className="space-y-2">
            <Label>Shadow</Label>
            <Select
              value={settings.shadow || "none"}
              onValueChange={(value) => setSettings({ ...settings, shadow: value as "none" | "sm" | "md" | "lg" })}
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
              onValueChange={([value]) => setSettings({ ...settings, opacity: value })}
              min={0}
              max={100}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <Label>Animation</Label>
            <Select
              value={settings.animation || "none"}
              onValueChange={(value) => setSettings({ ...settings, animation: value as "none" | "fade" | "slide" | "bounce" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select animation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="fade">Fade</SelectItem>
                <SelectItem value="slide">Slide</SelectItem>
                <SelectItem value="bounce">Bounce</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
      </Tabs>
      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
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