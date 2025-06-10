"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Plus, Filter, ArrowUpDown } from "lucide-react"

interface AdminToolbarProps {
  title?: string
  onSearch?: (query: string) => void
  onFilter?: (filter: string) => void
  onSort?: (sort: string) => void
}

export function AdminToolbar({
  title,
  onSearch,
  onFilter,
  onSort,
}: AdminToolbarProps) {
  const pathname = usePathname()

  const getActionButton = () => {
    if (pathname.startsWith("/admin/content")) {
      return { label: "New Page", href: "/admin/content/new" }
    }
    if (pathname.startsWith("/admin/news")) {
      return { label: "New Article", href: "/admin/news/new" }
    }
    if (pathname.startsWith("/admin/categories")) {
      return { label: "New Category", href: "/admin/categories/new" }
    }
    if (pathname.startsWith("/admin/users")) {
      return { label: "New User", href: "/admin/users/new" }
    }
    return null
  }

  const actionButton = getActionButton()

  return (
    <div className="sticky top-16 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">{title}</h1>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-8"
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onFilter?.("all")}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilter?.("published")}>
                Published
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilter?.("draft")}>
                Draft
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onSort?.("newest")}>
                Newest
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSort?.("oldest")}>
                Oldest
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSort?.("name")}>
                Name
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {actionButton && (
            <Button size="sm" asChild>
              <a href={actionButton.href}>
                <Plus className="mr-2 h-4 w-4" />
                {actionButton.label}
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
} 