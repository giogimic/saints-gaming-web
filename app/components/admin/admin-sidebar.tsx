"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  Users,
  MessageSquare,
  Settings,
  BarChart,
  Shield,
} from "lucide-react"

interface AdminSidebarProps {
  isOpen: boolean
}

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Content",
    href: "/admin/content",
    icon: FileText,
  },
  {
    title: "News",
    href: "/admin/news",
    icon: Newspaper,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Forum",
    href: "/admin/forum",
    icon: MessageSquare,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    title: "Permissions",
    href: "/admin/permissions",
    icon: Shield,
  },
]

export function AdminSidebar({ isOpen }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-card transition-transform duration-300 ease-in-out",
        !isOpen && "-translate-x-full"
      )}
    >
      <div className="flex h-full flex-col">
        <div className="p-4">
          <h2 className="mb-2 px-3 text-sm font-semibold text-muted-foreground">
            Navigation
          </h2>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="mt-auto border-t p-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs font-medium text-muted-foreground">
              Need help?
            </p>
            <p className="mt-1 text-sm">
              Check our{" "}
              <Link
                href="/docs"
                className="font-medium text-primary hover:underline"
              >
                documentation
              </Link>
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
} 