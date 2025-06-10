"use client"

import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth-config"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function EditNewsPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role?.toLowerCase() !== "admin") {
    redirect("/")
  }

  const article = await prisma.news.findUnique({
    where: { id: params.id },
  })

  if (!article) {
    notFound()
  }

  return <EditNewsForm article={article} />
}

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { News } from "@prisma/client"

interface EditNewsFormProps {
  article: News
}

function EditNewsForm({ article }: EditNewsFormProps) {
  const [title, setTitle] = useState(article.title)
  const [content, setContent] = useState(article.content)
  const [excerpt, setExcerpt] = useState(article.excerpt || "")
  const [imageUrl, setImageUrl] = useState(article.imageUrl || "")
  const [published, setPublished] = useState(article.published)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/news/${article.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, excerpt, imageUrl, published }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to update news article.")
        setLoading(false)
        return
      }
      router.push("/admin/news")
    } catch (err) {
      setError("Failed to update news article.")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6 bg-card p-8 rounded-lg border mt-8">
      <h2 className="text-2xl font-bold mb-4">Edit News Article</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Input id="excerpt" value={excerpt} onChange={e => setExcerpt(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input id="imageUrl" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea id="content" value={content} onChange={e => setContent(e.target.value)} rows={8} required />
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="published" checked={published} onCheckedChange={setPublished} />
        <Label htmlFor="published">Publish</Label>
      </div>
      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Saving..." : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/news")}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
} 