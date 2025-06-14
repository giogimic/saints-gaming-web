"use client"

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
  Edit2,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useEditMode } from '@/app/contexts/EditModeContext';
import { useState } from 'react';

export function AdminWidget() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const { isEditMode, toggleEditMode } = useEditMode();

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
    <div className="fixed bottom-4 right-4 z-50">
      <Card className={`bg-gray-800 border-gray-700 shadow-lg ${isOpen ? 'w-64' : 'w-auto'}`}>
        {isOpen ? (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Admin Panel</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {!isMinimized && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 border-b pb-4">
                  <Switch
                    checked={isEditMode}
                    onCheckedChange={toggleEditMode}
                    id="edit-mode"
                  />
                  <Label htmlFor="edit-mode" className="flex items-center gap-2">
                    <Edit2 className="h-4 w-4" />
                    Edit Mode
                  </Label>
                </div>
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
              </div>
            )}
          </div>
        ) : (
          <div className="p-2">
            <div className="flex items-center justify-between mb-2">
              <Switch
                checked={isEditMode}
                onCheckedChange={toggleEditMode}
                id="edit-mode-mini"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setIsOpen(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
} 