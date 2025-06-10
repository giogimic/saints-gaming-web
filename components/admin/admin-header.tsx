"use client"

import { UserRole } from "@prisma/client"
import { Bell, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/user-nav"

interface AdminHeaderProps {
  user: {
    id: string
    name: string | null
    role: UserRole
    image: string | null
    email: string | null
  }
  isSidebarOpen: boolean
  onSidebarToggle: () => void
}

export function AdminHeader({ user, isSidebarOpen, onSidebarToggle }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden"
          onClick={onSidebarToggle}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Add search or other header content here */}
          </div>
          <UserNav isAdmin={true} />
        </div>
      </div>
    </header>
  )
} 