"use client"

import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Edit2 } from "lucide-react"
import { UserRole } from "@/lib/permissions"
import { useRouter } from "next/navigation"

interface EditPageButtonProps {
  pageId: string
  className?: string
}

export function EditPageButton({ pageId, className }: EditPageButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()

  const isAdmin = session?.user?.role === UserRole.ADMIN

  if (!isAdmin) return null

  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={() => router.push(`/admin/content/${pageId}`)}
    >
      <Edit2 className="h-4 w-4 mr-2" />
      Edit Page
    </Button>
  )
} 