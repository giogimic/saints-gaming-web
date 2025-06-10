"use client";

import { useSession } from "next-auth/react";
import { UserRole } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PageWrapperProps {
  children: React.ReactNode;
  pageId: string;
}

export function PageWrapper({ children, pageId }: PageWrapperProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === UserRole.ADMIN;

  return (
    <div className="relative">
      {isAdmin && (
        <Button
          asChild
          className="absolute top-4 right-4 z-10"
          variant="outline"
          size="sm"
        >
          <Link href={`/admin/content/${pageId}`}>Edit Page</Link>
        </Button>
      )}
      {children}
    </div>
  );
} 