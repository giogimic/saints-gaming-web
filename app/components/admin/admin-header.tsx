"use client"

import { User } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/admin/user-nav"
import { Menu } from "lucide-react"

interface AdminHeaderProps {
  user: Pick<User, "id" | "name" | "email" | "image" | "role">
  isSidebarOpen: boolean
  onSidebarToggle: () => void
}

export function AdminHeader({ user, isSidebarOpen, onSidebarToggle }: AdminHeaderProps) {
  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background">
      <div className="flex h-16 items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden"
          onClick={onSidebarToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex flex-1 items-center justify-between">
          <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          <UserNav user={user} />
        </div>
      </div>
    </header>
  )
} 