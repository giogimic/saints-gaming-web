import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { pageId: string } }
) {
  try {
    const page = await prisma.page.findFirst({
      where: {
        slug: params.pageId,
      },
    });

    if (!page) {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 }
      );
    }

    // Parse the content if it's a string
    const content = typeof page.content === 'string' 
      ? JSON.parse(page.content)
      : page.content;

    return NextResponse.json({ ...page, content });
  } catch (error) {
    console.error("Error fetching content:", error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
} 