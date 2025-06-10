"use client";

import { ContentBlockManager } from "@/components/content-block-manager";

interface ContentBlock {
  id: string;
  type: string;
  content: string;
  settings: Record<string, any>;
  order: number;
}

interface ContentBlockManagerClientProps {
  blocks: ContentBlock[];
}

export function ContentBlockManagerClient({ blocks }: ContentBlockManagerClientProps) {
  return (
    <ContentBlockManager
      blocks={blocks}
      onBlocksChange={() => {}} // No-op since this is a read-only view
    />
  );
} 