import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { Session } from "next-auth"
import { Prisma } from "@prisma/client"

const pageSchema = z.object({
  title: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  template: z.string().optional(),
  isPublished: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
  parentId: z.string().nullable().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions) as Session | null

  if (!session?.user || session.user.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const pages = await prisma.page.findMany({
      include: {
        _count: {
          select: {
            blocks: true,
          },
        },
        parent: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        children: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: [
        {
          parentId: 'asc',
        },
        {
          createdAt: 'desc',
        },
      ],
    })

    return NextResponse.json(pages)
  } catch (error) {
    console.error("[PAGES_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions) as Session | null

  if (!session?.user || session.user.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const body = await req.json()
    const validatedData = pageSchema.parse(body)

    const pageData: Prisma.PageUncheckedCreateInput = {
      ...validatedData,
      createdById: session.user.id,
      metadata: validatedData.metadata || {},
    }

    const page = await prisma.page.create({
      data: pageData,
      include: {
        parent: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    })

    return NextResponse.json(page)
  } catch (error) {
    console.error("[PAGES_POST]", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions) as Session | null

  if (!session?.user || session.user.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const body = await req.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json(
        { error: "Page ID is required" },
        { status: 400 }
      )
    }

    const page = await prisma.page.findUnique({
      where: { id }
    })

    if (!page) {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 }
      )
    }

    const validatedData = pageSchema.parse(data)
    const updatedPage = await prisma.page.update({
      where: { id },
      data: {
        ...validatedData,
        metadata: validatedData.metadata || {},
      },
      include: {
        parent: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    })

    return NextResponse.json(updatedPage)
  } catch (error) {
    console.error("[PAGES_PATCH]", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions) as Session | null

  if (!session?.user || session.user.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Page ID is required" },
        { status: 400 }
      )
    }

    const page = await prisma.page.findUnique({
      where: { id },
      include: {
        children: true,
      },
    })

    if (!page) {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 }
      )
    }

    // Check if page has children
    if (page.children.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete page with child pages. Please delete or reassign child pages first." },
        { status: 400 }
      )
    }

    await prisma.page.delete({
      where: { id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[PAGES_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 