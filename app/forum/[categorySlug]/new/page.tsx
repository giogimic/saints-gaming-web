import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { NewThreadForm } from '@/components/forum/new-thread-form';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { redirect } from 'next/navigation';

interface NewThreadPageProps {
  params: {
    categorySlug: string;
  };
}

async function getCategory(slug: string) {
  return await prisma.category.findUnique({
    where: { slug },
  });
}

export default async function NewThreadPage({ params }: NewThreadPageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const category = await getCategory(params.categorySlug);
  
  if (!category) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Create New Thread in {category.name}</h1>
        <Suspense fallback={<div>Loading form...</div>}>
          <NewThreadForm categoryId={category.id} />
        </Suspense>
      </div>
    </div>
  );
} 