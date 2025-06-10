import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (key) {
      const setting = await db.query.siteSettings.findFirst({
        where: eq(siteSettings.key, key),
      });

      if (!setting) {
        return new NextResponse("Setting not found", { status: 404 });
      }

      return NextResponse.json(setting);
    }

    const allSettings = await db.query.siteSettings.findMany();
    return NextResponse.json(allSettings);
  } catch (error) {
    console.error("[SETTINGS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["admin", "moderator"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const setting = await db.insert(siteSettings).values({
      key,
      value,
    }).returning();

    return NextResponse.json(setting[0]);
  } catch (error) {
    console.error("[SETTINGS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["admin", "moderator"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const setting = await db.update(siteSettings)
      .set({
        value,
        updatedAt: new Date(),
      })
      .where(eq(siteSettings.key, key))
      .returning();

    return NextResponse.json(setting[0]);
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

    await db.delete(siteSettings).where(eq(siteSettings.key, key));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[SETTINGS_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 