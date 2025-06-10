import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { HomePage } from '../components/pages/home-page';
import { ServersPage } from '../components/pages/servers-page';
import { AboutPage } from '../components/pages/about-page';
import { ContactPage } from '../components/pages/contact-page';
import { DynamicPage } from '../components/pages/dynamic-page';

interface PageProps {
  params: {
    slug: string;
  };
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
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!page || !page.isPublished) {
    notFound();
  }

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
      return <DynamicPage page={page} />;
  }
} 