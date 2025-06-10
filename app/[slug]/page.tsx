import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { HomePage } from '../components/pages/home-page';
import { ServersPage } from '../components/pages/servers-page';
import { AboutPage } from '../components/pages/about-page';
import { ContactPage } from '../components/pages/contact-page';
import { DynamicPage } from '../components/pages/dynamic-page';
import { PageWrapper } from "@/components/page-wrapper"
import { ContentBlockManager } from "@/components/content-block-manager"

interface PageProps {
  params: {
    slug: string;
  };
}

interface ContentBlock {
  id: string;
  type: string;
  content: string;
  settings: Record<string, any>;
  title?: string;
  order: number;
  isPublished: boolean;
  pageId: string;
}

export async function generateMetadata({ params }: PageProps) {
  const page = await prisma.page.findUnique({
    where: { slug: params.slug },
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
  const page = await prisma.page.findUnique({
    where: { slug: params.slug },
    include: {
      blocks: {
        where: { isPublished: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!page) {
    notFound();
  }

  // Transform database blocks to match our ContentBlock interface
  const blocks: ContentBlock[] = page.blocks.map((block) => ({
    id: block.id,
    type: block.type,
    content: typeof block.content === "string" ? block.content : JSON.stringify(block.content),
    settings: block.settings as Record<string, any> || {},
    title: block.title || undefined,
    order: block.order,
    isPublished: block.isPublished,
    pageId: block.pageId,
  }));

  // Get user session for conditional rendering
  const session = await getServerSession(authOptions);

  // Render different templates based on page type
  switch (page.template) {
    case 'home':
      return <HomePage page={page} />;
    case 'servers':
      return <ServersPage page={page} />;
    case 'about':
      return <AboutPage page={page} />;
    case 'contact':
      return <ContactPage page={page} />;
    default:
      return (
        <PageWrapper pageId={page.id}>
          <div className="container mx-auto py-8">
            <h1 className="text-4xl font-bold mb-8">{page.title}</h1>
            <ContentBlockManager 
              blocks={blocks} 
              onBlocksChange={() => {}} // Read-only view, no changes allowed
            />
          </div>
        </PageWrapper>
      );
  }
} 