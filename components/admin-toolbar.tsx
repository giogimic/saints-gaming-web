"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, Users, List, LayoutDashboard, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function AdminToolbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  if (!session?.user || session.user.role !== "admin") return null;

  return (
    <div className={cn(
      "fixed top-0 left-0 z-50 w-full flex items-center justify-between bg-primary text-primary-foreground shadow-lg px-4 py-2 transition-transform",
      open ? "translate-y-0" : "-translate-y-full hover:translate-y-0"
    )} style={{ minHeight: 48 }}>
      <div className="flex items-center gap-4">
        <LayoutDashboard className="h-6 w-6 mr-2" />
        <span className="font-bold text-lg">Admin Toolbar</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4 mr-1" /> Edit Page
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Edit Content</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href="/admin/pages">Edit Pages</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/tabs">Edit Tabs</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/categories">Edit Categories</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/users">
            <Users className="h-4 w-4 mr-1" /> Manage Users
          </Link>
        </Button>
      </div>
      <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
} 