"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface EditPageButtonProps {
  pageId: string;
}

export function EditPageButton({ pageId }: EditPageButtonProps) {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="sm"
      className="fixed bottom-4 right-4 z-50"
      onClick={() => router.push(`/admin/content/${pageId}`)}
    >
      <Pencil className="h-4 w-4 mr-2" />
      Edit Page
    </Button>
  );
} 