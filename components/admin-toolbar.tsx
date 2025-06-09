"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Users, List, LayoutDashboard, X, Settings, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { UserRole } from "@/lib/permissions";

export function AdminToolbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  if (!session?.user || session.user.role !== UserRole.ADMIN) return null;

  return (
    <div className={cn(
      "fixed top-0 left-0 z-50 w-full flex items-center justify-between bg-primary text-primary-foreground shadow-lg px-4 py-2 transition-transform",
      open ? "translate-y-0" : "-translate-y-full hover:translate-y-0"
    )} style={{ minHeight: 48 }}>
      <div className="flex items-center gap-4">
        <LayoutDashboard className="h-6 w-6" />
        <span className="font-bold text-lg">Admin Toolbar</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10">
              <Edit className="h-4 w-4 mr-1" /> Manage Content
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Content Management</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href="/admin/posts">Manage Posts</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/categories">Manage Categories</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/settings">Site Settings</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button asChild variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10">
          <Link href="/admin/users">
            <Users className="h-4 w-4 mr-1" /> Manage Users
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10">
          <Link href="/admin/roles">
            <Shield className="h-4 w-4 mr-1" /> Manage Roles
          </Link>
        </Button>
      </div>
      <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="text-primary-foreground hover:bg-primary-foreground/10">
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
} 