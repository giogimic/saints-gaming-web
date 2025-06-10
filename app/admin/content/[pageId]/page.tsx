import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-config";
import prisma from "@/lib/prisma";
import { AdminContentManager } from "@/components/admin-content-manager";
import { hasPermission } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: {
    pageId: string;
  };
}

interface BlockSettings {
  imageUrl?: string;
  videoUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  alignment?: "left" | "center" | "right";
  padding?: string;
  margin?: string;
  borderRadius?: string;
  shadow?: string;
  opacity?: number;
  animation?: string;
  customClass?: string;
}

interface ContentBlock {
  id: string;
  type: string;
  content: string;
  settings: BlockSettings;
  title?: string;
  order: number;
  isPublished: boolean;
  pageId: string;
}

export default async function Page({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !hasPermission(session.user.role, "manage:content")) {
    redirect("/auth/signin");
  }

  const page = await prisma.page.findUnique({
    where: { id: params.pageId },
    include: {
      blocks: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!page) {
    redirect("/admin/content");
  }

  // Transform database blocks to match our ContentBlock interface
  const blocks: ContentBlock[] = page.blocks.map((block) => ({
    id: block.id,
    type: block.type,
    content: typeof block.content === "string" ? block.content : JSON.stringify(block.content),
    settings: (block.settings as BlockSettings) || {},
    title: block.title || undefined,
    order: block.order,
    isPublished: block.isPublished,
    pageId: block.pageId,
  }));

  const handleSave = async (blocks: ContentBlock[]) => {
    "use server";

    try {
      // Delete existing blocks
      await prisma.contentBlock.deleteMany({
        where: { pageId: params.pageId },
      });

      // Create new blocks
      await prisma.contentBlock.createMany({
        data: blocks.map((block, index) => ({
          id: block.id,
          type: block.type,
          content: block.content,
          settings: JSON.stringify(block.settings),
          title: block.title,
          order: index,
          isPublished: block.isPublished,
          pageId: params.pageId,
          createdById: session.user.id,
        })),
      });

      // Update page
      await prisma.page.update({
        where: { id: params.pageId },
        data: { updatedAt: new Date() },
      });
    } catch (error) {
      console.error("Error saving blocks:", error);
      throw new Error("Failed to save blocks");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{page.title}</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date(page.updatedAt).toLocaleDateString()}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/${page.slug}`}>
            <Eye className="h-4 w-4 mr-2" />
            View Page
          </Link>
        </Button>
      </div>

      <AdminContentManager
        pageId={params.pageId}
        initialBlocks={blocks}
        onSave={handleSave}
      />
    </div>
  );
} 