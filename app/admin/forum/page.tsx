"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useEditMode } from "@/app/contexts/EditModeContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { EditModeToggle } from "@/components/edit-mode-toggle"
import { toast } from "sonner"

interface Thread {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  authorId: string
  author: {
    name: string
  }
}

export default function ForumPage() {
  const { data: session } = useSession()
  const { isEditMode, canEdit } = useEditMode()
  const [threads, setThreads] = useState<Thread[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadThreads()
  }, [])

  const loadThreads = async () => {
    try {
      const response = await fetch("/api/forum/threads")
      if (!response.ok) throw new Error("Failed to load threads")
      const data = await response.json()
      setThreads(data.threads || [])
    } catch (error) {
      console.error("Error loading threads:", error)
      toast.error("Failed to load threads")
    } finally {
      setIsLoading(false)
    }
  }

  const handleThreadUpdate = async (threadId: string, field: "title" | "content", value: string) => {
    if (!isEditMode || !canEdit) return

    try {
      const response = await fetch(`/api/forum/threads/${threadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update thread")
      }

      const updatedThread = await response.json()
      setThreads(prevThreads => 
        prevThreads.map(thread => 
          thread.id === threadId ? updatedThread : thread
        )
      )
      toast.success("Thread updated successfully")
    } catch (error) {
      console.error("Error updating thread:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update thread")
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {canEdit && <EditModeToggle />}
      
      <div className="space-y-8">
        <h1 className="text-4xl font-bold">Forum</h1>
        
        <div className="space-y-4">
          {threads.map((thread) => (
            <Card key={thread.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {isEditMode && canEdit ? (
                      <Input
                        value={thread.title}
                        onChange={(e) => handleThreadUpdate(thread.id, "title", e.target.value)}
                      />
                    ) : (
                      thread.title
                    )}
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    Posted by {thread.author.name} on {new Date(thread.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isEditMode && canEdit ? (
                  <Textarea
                    value={thread.content}
                    onChange={(e) => handleThreadUpdate(thread.id, "content", e.target.value)}
                    className="min-h-[100px]"
                  />
                ) : (
                  <p className="whitespace-pre-wrap">{thread.content}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 