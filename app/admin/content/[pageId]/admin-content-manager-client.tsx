"use client";

import { AdminContentManager } from "@/components/admin-content-manager";

interface AdminContentManagerClientProps {
  pageId: string;
  initialBlocks: any[];
  onSave: (blocks: any[]) => Promise<void>;
}

export function AdminContentManagerClient({
  pageId,
  initialBlocks,
  onSave,
}: AdminContentManagerClientProps) {
  return (
    <AdminContentManager
      pageId={pageId}
      initialBlocks={initialBlocks}
      onSave={onSave}
    />
  );
} 