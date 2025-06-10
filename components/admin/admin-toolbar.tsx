"use client"

import { UserRole } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

interface AdminToolbarProps {
  user: {
    id: string
    name: string | null
    role: UserRole
    image: string | null
    email: string | null
  }
}

export function AdminToolbar({ user }: AdminToolbarProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {user.name}</h1>
        <p className="text-sm text-muted-foreground">
          Manage your site content and settings
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Button asChild>
          <Link href="/admin/news/new">
            <Plus className="mr-2 h-4 w-4" />
            New Article
          </Link>
        </Button>
      </div>
    </div>
  )
} 