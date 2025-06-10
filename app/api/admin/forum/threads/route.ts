import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"
import prisma from "@/lib/prisma"
import { UserRole } from "@/lib/permissions"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const categoryId = searchParams.get("categoryId")

    const where = {
      AND: [
        search ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { content: { contains: search, mode: "insensitive" } },
          ],
        } : {},
        categoryId ? { categoryId } : {},
      ],
    }

    const [threads, total] = await Promise.all([
      prisma.thread.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          category: true,
          _count: {
            select: {
              posts: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.thread.count({ where }),
    ])

    return NextResponse.json({
      threads,
      total,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("[THREADS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { title, content, categoryId } = body

    if (!title || !content || !categoryId) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const thread = await prisma.thread.create({
      data: {
        title,
        content,
        categoryId,
        authorId: session.user.id,
        slug: title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        category: true,
      },
    })

    return NextResponse.json(thread)
  } catch (error) {
    console.error("[THREADS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 