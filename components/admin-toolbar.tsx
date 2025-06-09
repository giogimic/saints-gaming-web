"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Users, List, LayoutDashboard, X, Settings, Shield, FileText, Tag, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { UserRole, hasPermission } from "@/lib/permissions";

export function AdminToolbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(true);
  const [editPageOpen, setEditPageOpen] = useState(false);
  const [pageContent, setPageContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleDoubleClick = (element: HTMLElement) => {
    if (element.tagName === 'IMG') {
      setImageUrl(element.getAttribute('src') || '');
    } else {
      setPageContent(element.textContent || '');
    }
    setEditPageOpen(true);
  };

  useEffect(() => {
    if (!session?.user || !hasPermission(session.user.role as UserRole, 'edit:page')) {
      return;
    }

    const elements = document.querySelectorAll('p, img');
    
    const handleDoubleClickEvent = (e: Event) => {
      const element = e.target as HTMLElement;
      handleDoubleClick(element);
    };

    elements.forEach((element) => {
      element.addEventListener('dblclick', handleDoubleClickEvent);
    });

    return () => {
      elements.forEach((element) => {
        element.removeEventListener('dblclick', handleDoubleClickEvent);
      });
    };
  }, [session?.user]);

  const handleSavePageContent = () => {
    console.log('Saving page content:', pageContent);
    setEditPageOpen(false);
  };

  // Add detailed debug logging
  console.log('AdminToolbar - Full Session:', session);
  console.log('AdminToolbar - User:', session?.user);
  console.log('AdminToolbar - Role:', session?.user?.role);
  console.log('AdminToolbar - Has Permission:', session?.user ? hasPermission(session.user.role as UserRole, 'manage:settings') : false);

  if (!session?.user) {
    console.log('AdminToolbar - No session user');
    return null;
  }

  // Check for any admin-level permission
  const hasAdminPermission = 
    hasPermission(session.user.role as UserRole, 'manage:settings') ||
    hasPermission(session.user.role as UserRole, 'manage:users') ||
    hasPermission(session.user.role as UserRole, 'manage:roles') ||
    hasPermission(session.user.role as UserRole, 'manage:content') ||
    hasPermission(session.user.role as UserRole, 'edit:page');

  if (!hasAdminPermission) {
    console.log('AdminToolbar - No admin permissions');
    return null;
  }

  return (
    <>
      <div className={cn(
        "fixed top-0 left-0 z-50 w-full flex items-center justify-between bg-primary text-primary-foreground shadow-lg px-4 py-2 transition-transform",
        open ? "translate-y-0" : "-translate-y-full"
      )} style={{ minHeight: 48 }}>
        <div className="flex items-center gap-4">
          <LayoutDashboard className="h-6 w-6" />
          <span className="font-bold text-lg">Admin Toolbar</span>
          
          {/* Content Management */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10">
                <Edit className="h-4 w-4 mr-1" /> Manage Content
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Content Management</DropdownMenuLabel>
              {hasPermission(session.user.role as UserRole, 'edit:page') && (
                <DropdownMenuItem onClick={() => setEditPageOpen(true)}>
                  <FileText className="h-4 w-4 mr-2" /> Edit Page
                </DropdownMenuItem>
              )}
              {hasPermission(session.user.role as UserRole, 'manage:categories') && (
                <DropdownMenuItem asChild>
                  <Link href="/admin/categories">
                    <Tag className="h-4 w-4 mr-2" /> Manage Categories
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {hasPermission(session.user.role as UserRole, 'manage:settings') && (
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">
                    <Settings className="h-4 w-4 mr-2" /> Site Settings
                  </Link>
                </DropdownMenuItem>
              )}
              {hasPermission(session.user.role as UserRole, 'manage:content') && (
                <DropdownMenuItem asChild>
                  <Link href="/admin/content/moderation">
                    <AlertTriangle className="h-4 w-4 mr-2" /> Content Moderation
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Management */}
          {hasPermission(session.user.role as UserRole, 'manage:users') && (
            <Button asChild variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10">
              <Link href="/admin/users">
                <Users className="h-4 w-4 mr-1" /> Manage Users
              </Link>
            </Button>
          )}

          {/* Role Management */}
          {hasPermission(session.user.role as UserRole, 'manage:roles') && (
            <Button asChild variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10">
              <Link href="/admin/roles">
                <Shield className="h-4 w-4 mr-1" /> Manage Roles
              </Link>
            </Button>
          )}

          {/* Activity Log */}
          {hasPermission(session.user.role as UserRole, 'manage:settings') && (
            <Button asChild variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10">
              <Link href="/admin/activity">
                <List className="h-4 w-4 mr-1" /> Activity Log
              </Link>
            </Button>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setOpen(!open)} 
          className="text-primary-foreground hover:bg-primary-foreground/10"
        >
          {open ? <X className="h-5 w-5" /> : <LayoutDashboard className="h-5 w-5" />}
        </Button>
      </div>
      {editPageOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Edit Page Content</h2>
            <textarea
              className="w-full h-40 p-2 border rounded mb-4"
              placeholder="Enter page content here..."
              value={pageContent}
              onChange={(e) => setPageContent(e.target.value)}
            />
            <input
              type="text"
              className="w-full p-2 border rounded mb-4"
              placeholder="Enter image URL here..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setEditPageOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button onClick={handleSavePageContent} className="px-4 py-2 bg-blue-500 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 