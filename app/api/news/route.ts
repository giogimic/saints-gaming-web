import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { authOptions as authConfig } from "@/lib/auth-config"
import { db } from "@/lib/db"
import { newsPosts } from "@/lib/db/schema"
import { UserRole } from "@/lib/permissions"
import slugify from "slugify"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (id) {
      const news = await prisma.news.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      })

      if (!news) {
        return new NextResponse("News not found", { status: 404 })
      }

      return NextResponse.json(news)
    }

    const news = await prisma.news.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(news)
  } catch (error) {
    console.error("[NEWS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !["admin", "moderator"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { title, content, published } = body

    if (!title || !content) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const news = await prisma.news.create({
      data: {
        title,
        content,
        published: published ?? false,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(news)
  } catch (error) {
    console.error("[NEWS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !["admin", "moderator"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { id, title, content, published } = body

    if (!id || !title || !content) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const news = await prisma.news.update({
      where: { id },
      data: {
        title,
        content,
        published: published ?? false,
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(news)
  } catch (error) {
    console.error("[NEWS_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !["admin", "moderator"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return new NextResponse("Missing news ID", { status: 400 })
    }

    await prisma.news.delete({ where: { id } })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[NEWS_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 