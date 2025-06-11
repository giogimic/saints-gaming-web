"use client";

import { useState, useEffect } from "react";
import { useEditMode } from "@/app/contexts/EditModeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EditableContentProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  type?: "text" | "textarea";
  maxLength?: number;
  className?: string;
  placeholder?: string;
  validationSchema?: (value: string) => boolean;
  errorMessage?: string;
}

export function EditableContent({
  value,
  onSave,
  type = "text",
  maxLength = 500,
  className,
  placeholder,
  validationSchema,
  errorMessage = "Invalid content",
}: EditableContentProps) {
  const { canEdit } = useEditMode();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = async () => {
    if (!canEdit) return;

    // Validate content
    if (editValue.length > maxLength) {
      setError(`Content must be less than ${maxLength} characters`);
      return;
    }

    if (validationSchema && !validationSchema(editValue)) {
      setError(errorMessage);
      return;
    }

    try {
      setIsSaving(true);
      await onSave(editValue);
      setIsEditing(false);
      setError(null);
      toast.success("Content saved successfully");
    } catch (err) {
      setError("Failed to save content");
      toast.error("Failed to save content");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    setError(null);
  };

  if (!canEdit) {
    return <div className={className}>{value}</div>;
  }

  return (
    <div className="group relative">
      {isEditing ? (
        <div className="space-y-2">
          {type === "textarea" ? (
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className={cn(
                "min-h-[100px] resize-y transition-all duration-300",
                error && "border-destructive focus-visible:ring-destructive",
                className
              )}
              placeholder={placeholder}
            />
          ) : (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className={cn(
                "transition-all duration-300",
                error && "border-destructive focus-visible:ring-destructive",
                className
              )}
              placeholder={placeholder}
            />
          )}
          {error && (
            <p className="text-sm text-destructive animate-in fade-in slide-in-from-top-2">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90 transition-all duration-300"
            >
              <Check className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="hover:bg-destructive/10 transition-all duration-300"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative group">
          <div className={className}>{value}</div>
          <Button
            onClick={() => setIsEditing(true)}
            variant="ghost"
            size="icon"
            className="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
} 