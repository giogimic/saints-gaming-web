import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { Session } from "next-auth"

const blockSchema = z.object({
  type: z.string(),
  title: z.string().min(1).max(100),
  content: z.union([z.string(), z.record(z.any())]),
  order: z.number().int().min(0),
  isPublished: z.boolean().optional(),
  pageId: z.string(),
  settings: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions) as Session | null

  if (!session?.user || session.user.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const pageId = searchParams.get("pageId")

    const where = pageId ? { pageId } : {}

    const blocks = await prisma.contentBlock.findMany({
      where,
      orderBy: {
        order: "asc",
      },
      include: {
        page: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        ContentRevision: {
          select: {
            id: true,
            content: true,
            createdAt: true,
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
          take: 1,
        },
      },
    })

    return NextResponse.json(blocks)
  } catch (error) {
    console.error("[BLOCKS_GET]", error)
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
    const validatedData = blockSchema.parse(body)

    const createData: any = {
      type: validatedData.type,
      title: validatedData.title,
      content: typeof validatedData.content === 'string' ? { text: validatedData.content } : validatedData.content,
      order: validatedData.order,
      ...(typeof validatedData.isPublished === 'boolean' ? { isPublished: validatedData.isPublished } : {}),
      settings: validatedData.settings,
      metadata: validatedData.metadata,
      page: {
        connect: {
          id: validatedData.pageId
        }
      },
      author: {
        connect: {
          id: session.user.id
        }
      }
    }
    console.log('Prisma create data:', createData)
    const block = await prisma.contentBlock.create({
      data: createData,
    })

    return NextResponse.json(block)
  } catch (error) {
    console.error("[BLOCKS_POST]", error)
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
        { error: "Block ID is required" },
        { status: 400 }
      )
    }

    const block = await prisma.contentBlock.findUnique({
      where: { id }
    })

    if (!block) {
      return NextResponse.json(
        { error: "Block not found" },
        { status: 404 }
      )
    }

    const validatedData = blockSchema.parse(data)
    const updateData: any = {
      type: validatedData.type,
      title: validatedData.title,
      content: typeof validatedData.content === 'string' ? { text: validatedData.content } : validatedData.content,
      order: validatedData.order,
      settings: validatedData.settings,
      metadata: validatedData.metadata,
    }
    if (typeof validatedData.isPublished === 'boolean') {
      updateData.isPublished = validatedData.isPublished
    }
    if (validatedData.pageId) {
      updateData.page = { connect: { id: validatedData.pageId } }
    }
    console.log('Prisma update data:', updateData)
    const updatedBlock = await prisma.contentBlock.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updatedBlock)
  } catch (error) {
    console.error("[BLOCKS_PATCH]", error)
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
        { error: "Block ID is required" },
        { status: 400 }
      )
    }

    const block = await prisma.contentBlock.findUnique({
      where: { id }
    })

    if (!block) {
      return NextResponse.json(
        { error: "Block not found" },
        { status: 404 }
      )
    }

    await prisma.contentBlock.delete({
      where: { id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[BLOCKS_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 