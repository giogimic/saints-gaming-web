"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { UserRole } from "@/lib/permissions"
import {
  Settings,
  FileText,
  Users,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react"

export function AdminWidget() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return null
  }

  const menuItems = [
    {
      label: "Settings",
      icon: Settings,
      href: "/admin/settings",
    },
    {
      label: "Content",
      icon: FileText,
      href: "/admin/content",
    },
    {
      label: "Users",
      icon: Users,
      href: "/admin/users",
    },
    {
      label: "Forum",
      icon: MessageSquare,
      href: "/admin/forum",
    },
  ]

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
        isMinimized ? "w-12" : "w-64"
      }`}
    >
      <Card className="relative shadow-lg">
        {!isMinimized && (
          <div className="absolute -top-2 -right-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full bg-background"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {isOpen ? (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Admin Panel</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {!isMinimized && (
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => router.push(item.href)}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={() => setIsOpen(true)}
          >
            <Settings className="h-6 w-6" />
          </Button>
        )}
      </Card>
    </div>
  )
} 