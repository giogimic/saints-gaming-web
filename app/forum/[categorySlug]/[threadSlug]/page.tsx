import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PostList } from '@/components/forum/post-list'
import { NewPostForm } from '@/components/forum/new-post-form'

interface ThreadPageProps {
  params: {
    categorySlug: string
    threadSlug: string
  }
}

async function getThread(threadId: string) {
  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    include: {
      author: {
        select: {
          name: true,
          image: true,
        },
      },
      category: true,
      posts: {
        include: {
          author: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  })

  return thread
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const thread = await getThread(params.threadSlug)

  if (!thread) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{thread.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span>Posted by {thread.author.name}</span>
          <span>•</span>
          <span>in {thread.category.name}</span>
        </div>
      </div>

      <div className="grid gap-8">
        <PostList posts={thread.posts} />
        <NewPostForm threadId={thread.id} />
      </div>
    </div>
  )
} 