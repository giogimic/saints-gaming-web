import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth-config"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import Link from "next/link"
import { Plus } from "lucide-react"
import { DeleteNewsButton } from "@/components/admin/delete-news-button"

interface NewsWithAuthor {
  id: string
  title: string
  content: string
  excerpt: string | null
  imageUrl: string | null
  published: boolean
  createdAt: Date
  updatedAt: Date
  author: {
    name: string | null
  }
}

export default async function NewsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role?.toLowerCase() !== "admin") {
    redirect("/")
  }

  const news = await prisma.news.findMany({
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  }) as NewsWithAuthor[]

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">News Management</h2>
        <Button asChild>
          <Link href="/admin/news/new">
            <Plus className="mr-2 h-4 w-4" />
            New Article
          </Link>
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {news.map((article) => (
              <TableRow key={article.id}>
                <TableCell className="font-medium">{article.title}</TableCell>
                <TableCell>{article.author.name}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      article.published
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {article.published ? "Published" : "Draft"}
                  </span>
                </TableCell>
                <TableCell>
                  {format(new Date(article.createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  {format(new Date(article.updatedAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="mr-2"
                  >
                    <Link href={`/admin/news/${article.id}/edit`}>
                      Edit
                    </Link>
                  </Button>
                  <DeleteNewsButton id={article.id} title={article.title} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 