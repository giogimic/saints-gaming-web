"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TiptapEditor } from "@/components/block-editor";
import { X, Save, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface InlineEditorProps {
  element: HTMLElement;
  onSave: (content: string) => Promise<void>;
  onClose: () => void;
}

export function InlineEditor({ element, onSave, onClose }: InlineEditorProps) {
  const [content, setContent] = useState(element.textContent || "");
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(content);
      toast({
        title: "Success",
        description: "Content saved successfully",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save content",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card
      ref={editorRef}
      className={cn(
        "fixed z-50 w-[600px] max-w-[90vw] bg-background shadow-lg",
        "transform transition-all duration-200 ease-in-out"
      )}
      style={{
        top: element.getBoundingClientRect().top + window.scrollY,
        left: element.getBoundingClientRect().left + window.scrollX,
      }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit Content</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <TiptapEditor
            content={content}
            onChange={setContent}
            className="min-h-[200px] border rounded-md p-4"
          />

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
} 