"use client";

import { useState } from "react";
import { ContentBlockManager } from "@/components/content-block-manager";

interface ContentBlockManagerClientProps {
  blocks: any[];
  pageId: string;
}

export function ContentBlockManagerClient({ blocks, pageId }: ContentBlockManagerClientProps) {
  const [localBlocks, setLocalBlocks] = useState(blocks);

  return (
    <ContentBlockManager
      blocks={localBlocks}
      onBlocksChange={setLocalBlocks}
    />
  );
} 