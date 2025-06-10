"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminToolbar } from "@/components/admin/admin-toolbar"
import { cn } from "@/lib/utils"
import { User } from "@prisma/client"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session?.user || session.user.role !== "admin") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader
        user={session.user as User}
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <AdminSidebar isOpen={isSidebarOpen} />
      <div className={cn(
        "md:pl-64 transition-all duration-300",
        !isSidebarOpen && "md:pl-20"
      )}>
        <main className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AdminToolbar user={session.user as User} />
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 