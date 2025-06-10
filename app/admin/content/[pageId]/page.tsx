import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { AdminContentManagerClient } from "./admin-content-manager-client";

interface PageProps {
  params: {
    pageId: string;
  };
}

interface ContentBlock {
  id: string;
  type: string;
  content: string;
  settings: Record<string, any>;
  order: number;
  isPublished: boolean;
  pageId: string;
}

export default async function Page({ params }: PageProps) {
  const { pageId } = params;
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== UserRole.admin) {
    notFound();
  }

  const page = await prisma.page.findUnique({
    where: { id: pageId },
    include: {
      blocks: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!page) {
    notFound();
  }

  const blocks: ContentBlock[] = page.blocks.map((block) => ({
    id: block.id,
    type: block.type,
    content: block.content as string,
    settings: block.settings as Record<string, any>,
    order: block.order,
    isPublished: block.isPublished,
    pageId: block.pageId,
  }));

  const handleSave = async (blocks: ContentBlock[]) => {
    "use server";

    try {
      await prisma.$transaction(
        blocks.map((block, index) =>
          prisma.block.update({
            where: { id: block.id },
            data: {
              content: block.content,
              settings: block.settings,
              order: index,
              isPublished: block.isPublished,
            },
          })
        )
      );
    } catch (error) {
      console.error("Error saving blocks:", error);
      throw new Error("Failed to save blocks");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{page.title}</h1>
      </div>

      <AdminContentManagerClient
        pageId={pageId}
        initialBlocks={blocks}
        onSave={handleSave}
      />
    </div>
  );
} 