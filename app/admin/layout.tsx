"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminToolbar } from "@/components/admin/admin-toolbar"
import { cn } from "@/lib/utils"
import { User } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { hasPermission } from "@/lib/permissions"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  FileText,
  Newspaper,
  MessageSquare,
  Settings,
  Users,
  LayoutDashboard,
} from "lucide-react"
import Link from "next/link"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user || !hasPermission(session.user.role, "manage:content")) {
    redirect("/")
  }

  const navItems = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Pages",
      href: "/admin/content",
      icon: FileText,
    },
    {
      title: "News",
      href: "/admin/news",
      icon: Newspaper,
    },
    {
      title: "Forum",
      href: "/admin/forum",
      icon: MessageSquare,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader 
        user={session.user} 
        isSidebarOpen={true} 
        onSidebarToggle={() => {}} 
      />
      <div className="flex">
        <AdminSidebar isOpen={true} />
        <main className="flex-1 md:pl-64 pt-16">
          <div className="container mx-auto py-8">
            <AdminToolbar user={session.user} />
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 