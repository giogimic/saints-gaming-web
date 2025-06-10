"use client"

import { User } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { usePathname } from "next/navigation"

interface AdminToolbarProps {
  user: Pick<User, "id" | "name" | "email" | "image" | "role">
}

export function AdminToolbar({ user }: AdminToolbarProps) {
  const pathname = usePathname()
  const currentSection = pathname.split("/").pop() || "Dashboard"

  const getActionButton = () => {
    switch (pathname) {
      case "/admin/content":
        return (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Page
          </Button>
        )
      case "/admin/news":
        return (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Article
          </Button>
        )
      case "/admin/forum":
        return (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Category
          </Button>
        )
      case "/admin/users":
        return (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New User
          </Button>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}
        </h1>
        <p className="text-muted-foreground">
          Manage your content and settings
        </p>
      </div>
      {getActionButton()}
    </div>
  )
} 