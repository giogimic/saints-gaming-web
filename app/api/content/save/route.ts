import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import prisma from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { UserRole } from "@/lib/permissions";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !hasPermission(session.user.role as UserRole, "edit:content")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { pageId, content } = await request.json();
    if (!pageId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updatedPage = await prisma.page.update({
      where: { id: pageId },
      data: { 
        content: typeof content === 'string' ? content : JSON.stringify(content),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error("Error updating content:", error);
    return NextResponse.json({ error: "Failed to update content" }, { status: 500 });
  }
} 