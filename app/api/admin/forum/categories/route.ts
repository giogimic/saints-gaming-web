import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { Session } from "next-auth"

const categorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  slug: z.string().min(1).max(100).optional(),
  order: z.number().int().min(0).optional(),
  isDefault: z.boolean().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions) as Session | null

  if (!session?.user || session.user.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            threads: true,
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("[CATEGORIES_GET]", error)
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
    const validatedData = categorySchema.parse(body)

    const category = await prisma.category.create({
      data: {
        ...validatedData,
        slug: validatedData.slug || validatedData.name.toLowerCase().replace(/\s+/g, '-'),
        order: validatedData.order || 0,
        isDefault: validatedData.isDefault || false,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("[CATEGORIES_POST]", error)
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
        { error: "Category ID is required" },
        { status: 400 }
      )
    }

    const category = await prisma.category.findUnique({
      where: { id }
    })

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }

    if (category.isDefault) {
      return NextResponse.json(
        { error: "Cannot modify default categories" },
        { status: 400 }
      )
    }

    const validatedData = categorySchema.parse(data)
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        ...validatedData,
        slug: validatedData.slug || validatedData.name.toLowerCase().replace(/\s+/g, '-'),
      },
    })

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error("[CATEGORIES_PATCH]", error)
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
        { error: "Category ID is required" },
        { status: 400 }
      )
    }

    const category = await prisma.category.findUnique({
      where: { id }
    })

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }

    if (category.isDefault) {
      return NextResponse.json(
        { error: "Cannot delete default categories" },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[CATEGORIES_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 