import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { authOptions as authConfig } from "@/lib/auth-config"
import { db } from "@/lib/db"
import { newsPosts } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { UserRole } from "@/lib/permissions"
import slugify from "slugify"

export async function GET() {
  try {
    const posts = await db.query.newsPosts.findMany({
      with: {
        author: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error("Error fetching news posts:", error)
    return NextResponse.json(
      { error: "Failed to fetch news posts" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || ![UserRole.ADMIN, UserRole.MODERATOR].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { title, content, published } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      )
    }

    const [post] = await db.insert(newsPosts).values({
      title,
      content,
      authorId: session.user.id,
      published: published ?? true,
    }).returning()

    const createdPost = await db.query.newsPosts.findFirst({
      where: eq(newsPosts.id, post.id),
      with: {
        author: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(createdPost)
  } catch (error) {
    console.error("Error creating news post:", error)
    return NextResponse.json(
      { error: "Failed to create news post" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || ![UserRole.ADMIN, UserRole.MODERATOR].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id, title, content } = await request.json()

    if (!id || !title || !content) {
      return NextResponse.json(
        { error: "ID, title, and content are required" },
        { status: 400 }
      )
    }

    const [post] = await db.update(newsPosts)
      .set({
        title,
        content,
        updatedAt: new Date(),
      })
      .where(eq(newsPosts.id, id))
      .returning()

    const updatedPost = await db.query.newsPosts.findFirst({
      where: eq(newsPosts.id, post.id),
      with: {
        author: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error("Error updating news post:", error)
    return NextResponse.json(
      { error: "Failed to update news post" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || ![UserRole.ADMIN, UserRole.MODERATOR].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      )
    }

    await db.delete(newsPosts).where(eq(newsPosts.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting news post:", error)
    return NextResponse.json(
      { error: "Failed to delete news post" },
      { status: 500 }
    )
  }
} 