"use client"

import { useState } from "react"
import { AdminSidebar } from "./admin-sidebar"
import { AdminHeader } from "./admin-header"
import { cn } from "@/lib/utils"

interface AdminLayoutProps {
  children: React.ReactNode
  user: {
    id: string
    name: string | null
    role: string
    image: string | null
    email: string | null
  }
}

export function AdminLayoutClient({ children, user }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader
        user={user}
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <AdminSidebar isOpen={isSidebarOpen} />
      <main
        className={cn(
          "min-h-screen pt-16 transition-all duration-300",
          isSidebarOpen ? "md:pl-64" : "md:pl-0"
        )}
      >
        <div className="container mx-auto p-4">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
} 