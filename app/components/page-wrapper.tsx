"use client"

import { useSession } from "next-auth/react"
import { UserRole } from "@/lib/permissions"
import { EditPageButton } from "./edit-page-button"

interface PageWrapperProps {
  children: React.ReactNode
  pageId: string
}

export function PageWrapper({ children, pageId }: PageWrapperProps) {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === UserRole.ADMIN

  return (
    <div className="relative">
      {isAdmin && (
        <div className="fixed bottom-4 right-4 z-50">
          <EditPageButton pageId={pageId} />
        </div>
      )}
      {children}
    </div>
  )
} 