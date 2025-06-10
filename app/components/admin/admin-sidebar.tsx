"use client"

import { cn } from "@/lib/utils"
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
import { usePathname } from "next/navigation"

interface AdminSidebarProps {
  isOpen: boolean
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

export function AdminSidebar({ isOpen }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 hidden w-64 border-r bg-background md:block",
        isOpen ? "block" : "hidden"
      )}
    >
      <ScrollArea className="h-full py-6">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">Navigation</h2>
          <div className="space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </ScrollArea>
    </aside>
  )
} 