"use client";

import { useEffect, useState } from "react";
import { BlockPreview } from "@/components/block-preview";
import { ContentBlock } from "@/types/content";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface LivePreviewProps {
  block: ContentBlock;
  className?: string;
}

export function LivePreview({ block, className }: LivePreviewProps) {
  const [previewBlock, setPreviewBlock] = useState<ContentBlock>(block);

  useEffect(() => {
    setPreviewBlock(block);
  }, [block]);

  return (
    <Card className={cn("p-4", className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Live Preview</h3>
          <div className="text-sm text-muted-foreground">
            {block.type.charAt(0).toUpperCase() + block.type.slice(1)} Block
          </div>
        </div>
        <div className="border rounded-lg p-4 bg-background">
          <BlockPreview block={previewBlock} />
        </div>
      </div>
    </Card>
  );
} 