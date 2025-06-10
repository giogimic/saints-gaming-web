import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { HomePage } from '../components/pages/home-page';
import { ServersPage } from '../components/pages/servers-page';
import { AboutPage } from '../components/pages/about-page';
import { ContactPage } from '../components/pages/contact-page';
import { DynamicPage } from '../components/pages/dynamic-page';
import { PageWrapperClient } from "@/components/page-wrapper-client"
import { ContentBlockManagerClient } from "@/components/content-block-manager-client"
import { useSession } from "next-auth/react";
import { UserRole } from "@/lib/permissions";
import { EditPageButton } from "@/components/edit-page-button";

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface ContentBlock {
  id: string;
  type: string;
  content: string;
  settings: Record<string, any>;
  order: number;
}

interface PageBlock {
  id: string;
  type: string;
  content: any;
  settings: any;
  order: number;
}

function PageWrapper({ children, pageId }: { children: React.ReactNode; pageId: string }) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === UserRole.ADMIN;

  return (
    <div className="relative">
      {children}
      {isAdmin && <EditPageButton pageId={pageId} />}
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const page = await prisma.page.findUnique({
    where: { slug: resolvedParams.slug },
  });

  if (!page) {
    return {
      title: 'Page Not Found',
    };
  }

  return {
    title: page.title,
    description: page.description,
  };
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const page = await prisma.page.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      blocks: {
        where: {
          isPublished: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!page) {
    notFound();
  }

  const blocks: ContentBlock[] = page.blocks.map((block: PageBlock) => ({
    id: block.id,
    type: block.type,
    content: typeof block.content === "string" ? block.content : JSON.stringify(block.content),
    settings: block.settings,
    order: block.order,
  }));

  return (
    <PageWrapperClient pageId={page.id}>
      <ContentBlockManagerClient blocks={blocks} />
    </PageWrapperClient>
  );
} 