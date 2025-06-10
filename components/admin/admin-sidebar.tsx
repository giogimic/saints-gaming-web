"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Newspaper,
  MessageSquare,
  Settings,
  Users,
  FileText,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "News",
    href: "/admin/news",
    icon: Newspaper,
  },
  {
    name: "Forum",
    href: "/admin/forum",
    icon: MessageSquare,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Content",
    href: "/admin/content",
    icon: FileText,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

interface AdminSidebarProps {
  isOpen: boolean
}

export function AdminSidebar({ isOpen }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn(
      "hidden md:flex md:flex-col md:fixed md:inset-y-0 transition-transform duration-300",
      isOpen ? "md:w-64" : "md:w-20"
    )}>
      <div className="flex-1 flex flex-col min-h-0 bg-card border-r border-border">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <Link href="/admin" className={cn(
              "text-xl font-bold transition-opacity duration-300",
              isOpen ? "opacity-100" : "opacity-0"
            )}>
              Admin Panel
            </Link>
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5",
                      isOpen ? "mr-3" : "mx-auto",
                      isActive
                        ? "text-primary-foreground"
                        : "text-muted-foreground group-hover:text-accent-foreground"
                    )}
                    aria-hidden="true"
                  />
                  <span className={cn(
                    "transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 w-0"
                  )}>
                    {item.name}
                  </span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
} 