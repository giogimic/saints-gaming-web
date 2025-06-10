import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth-config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default async function NewNewsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role?.toLowerCase() !== "admin") {
    redirect("/")
  }

  // The form will be rendered client-side, so we use a client component for the form itself
  return <CreateNewsForm />
}

'use client'

function CreateNewsForm() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [published, setPublished] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, excerpt, imageUrl, published }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to create news article.")
        setLoading(false)
        return
      }
      router.push("/admin/news")
    } catch (err) {
      setError("Failed to create news article.")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6 bg-card p-8 rounded-lg border mt-8">
      <h2 className="text-2xl font-bold mb-4">Create News Article</h2>
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
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating..." : "Create Article"}
      </Button>
    </form>
  )
} 