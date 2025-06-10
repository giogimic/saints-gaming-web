"use client"

import { useState } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminToolbar } from "@/components/admin/admin-toolbar"
import { User } from "@prisma/client"

interface AdminLayoutProps {
  children: React.ReactNode
  user: Pick<User, "id" | "name" | "email" | "image" | "role">
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
      <div className="flex">
        <AdminSidebar isOpen={isSidebarOpen} />
        <main className="flex-1 md:pl-64 pt-16">
          <div className="container mx-auto py-8">
            <AdminToolbar user={user} />
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 