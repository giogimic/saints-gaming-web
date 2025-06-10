"use client"

import { User } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

interface AdminHeaderProps {
  user: Pick<User, "id" | "name" | "email" | "image" | "role">
  isSidebarOpen: boolean
  onSidebarToggle: () => void
}

export function AdminHeader({ user, isSidebarOpen, onSidebarToggle }: AdminHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b bg-background">
      <div className="flex h-full items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onSidebarToggle}
          className="mr-4"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
} 