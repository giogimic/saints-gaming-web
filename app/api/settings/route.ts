import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findFirst();
    return NextResponse.json(settings || {});
  } catch (error) {
    console.error("[SETTINGS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const settings = await prisma.siteSettings.upsert({
      where: { id: "1" },
      update: {
        [key]: value,
      },
      create: {
        id: "1",
        [key]: value,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("[SETTINGS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const settings = await prisma.siteSettings.upsert({
      where: { id: "1" },
      update: {
        [key]: value,
      },
      create: {
        id: "1",
        [key]: value,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("[SETTINGS_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["admin", "moderator"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return new NextResponse("Missing setting key", { status: 400 });
    }

    await prisma.userSettings.delete({
      where: {
        key: key,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[SETTINGS_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 