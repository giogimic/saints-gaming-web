"use client";

import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";
import { EditPageButton } from "@/components/edit-page-button";

interface PageWrapperClientProps {
  children: React.ReactNode;
  pageId: string;
}

export function PageWrapperClient({ children, pageId }: PageWrapperClientProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === UserRole.admin;

  return (
    <div className="container mx-auto px-4 py-8">
      {isAdmin && <EditPageButton pageId={pageId} />}
      {children}
    </div>
  );
} 