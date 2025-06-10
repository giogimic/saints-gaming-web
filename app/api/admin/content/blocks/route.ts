import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { UserRole, hasPermission } from "@/lib/permissions"

const blockSettingsSchema = z.object({
  imageUrl: z.string().optional(),
  alt: z.string().optional(),
  videoUrl: z.string().optional(),
  videoType: z.enum(['youtube', 'vimeo', 'direct']).optional(),
  buttonText: z.string().optional(),
  buttonUrl: z.string().optional(),
  columns: z.number().min(1).max(4).optional(),
  authorName: z.string().optional(),
  authorTitle: z.string().optional(),
  price: z.string().optional(),
  currency: z.string().optional(),
  period: z.string().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  alignment: z.enum(["left", "center", "right"]).optional(),
  padding: z.string().optional(),
  margin: z.string().optional(),
  borderRadius: z.string().optional(),
  shadow: z.string().optional(),
  opacity: z.number().min(0).max(1).optional(),
  animation: z.string().optional(),
  customClass: z.string().optional(),
});

const blockSchema = z.object({
  id: z.string(),
  type: z.string(),
  content: z.any(),
  settings: blockSettingsSchema.optional(),
  title: z.string().optional(),
  order: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  isPublished: z.boolean(),
  pageId: z.string(),
});

const blocksSchema = z.array(blockSchema);

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !hasPermission(session.user.role as UserRole, "manage:content")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const blocks = await prisma.contentBlock.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json(blocks);
  } catch (error) {
    console.error("Error fetching blocks:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !hasPermission(session.user.role as UserRole, "manage:content")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = blocksSchema.parse(body);

    const blocks = await Promise.all(
      validatedData.map(async (block) => {
        return prisma.contentBlock.upsert({
          where: { id: block.id },
          update: {
            type: block.type,
            content: block.content,
            settings: block.settings,
            title: block.title,
            order: block.order,
            isPublished: block.isPublished,
            updatedAt: new Date(),
          },
          create: {
            id: block.id,
            type: block.type,
            content: block.content,
            settings: block.settings,
            title: block.title,
            order: block.order,
            isPublished: block.isPublished,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdById: session.user.id,
            pageId: block.pageId,
          },
        });
      })
    );

    return NextResponse.json(blocks);
  } catch (error) {
    console.error("Error saving blocks:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !hasPermission(session.user.role as UserRole, "manage:content")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = blockSchema.parse(body);

    const block = await prisma.contentBlock.update({
      where: { id: validatedData.id },
      data: {
        type: validatedData.type,
        content: validatedData.content,
        settings: validatedData.settings,
        title: validatedData.title,
        order: validatedData.order,
        isPublished: validatedData.isPublished,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(block);
  } catch (error) {
    console.error("Error updating block:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !hasPermission(session.user.role as UserRole, "manage:content")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("Block ID is required", { status: 400 });
    }

    await prisma.contentBlock.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting block:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 