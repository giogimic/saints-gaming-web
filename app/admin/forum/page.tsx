"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function ForumPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [threads, setThreads] = useState([])

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const response = await fetch("/api/admin/forum/threads")
        if (!response.ok) throw new Error("Failed to fetch threads")
        const data = await response.json()
        setThreads(data)
      } catch (error) {
        console.error("Error fetching threads:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchThreads()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Forum Management</h1>
        <Button onClick={() => router.push("/admin/forum/new")}>
          New Thread
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Threads</CardTitle>
        </CardHeader>
        <CardContent>
          {threads.length === 0 ? (
            <p className="text-muted-foreground">No threads found</p>
          ) : (
            <div className="space-y-4">
              {threads.map((thread: any) => (
                <div
                  key={thread.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{thread.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      By {thread.author?.name || "Unknown"} •{" "}
                      {new Date(thread.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => router.push(`/admin/forum/${thread.id}`)}
                  >
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 