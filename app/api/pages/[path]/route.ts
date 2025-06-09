import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ROLE_PERMISSIONS, type PageContent } from '@/lib/types';
import { readJsonFile, writeJsonFile } from '@/lib/storage';

const PAGES_FILE = 'data/pages.json';

export async function GET(
  request: Request,
  { params }: { params: { path: string } }
) {
  try {
    const pages = await readJsonFile<PageContent[]>(PAGES_FILE);
    const page = pages.find(p => p.path === params.path);
    
    if (!page) {
      return new NextResponse('Page not found', { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error('Error fetching page:', error);
    return new NextResponse('Error fetching page', { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { path: string } }
) {
  const session = await getServerSession();
  if (!session?.user?.role) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const canEdit = ROLE_PERMISSIONS[session.user.role].canEditPages;
  if (!canEdit) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  try {
    const { content } = await request.json();
    const pages = await readJsonFile<PageContent[]>(PAGES_FILE);
    const pageIndex = pages.findIndex(p => p.path === params.path);
    
    if (pageIndex === -1) {
      return new NextResponse('Page not found', { status: 404 });
    }

    pages[pageIndex] = {
      ...pages[pageIndex],
      content,
      lastEditedBy: session.user.id,
      lastEditedAt: new Date().toISOString(),
    };

    await writeJsonFile(PAGES_FILE, pages);
    return NextResponse.json(pages[pageIndex]);
  } catch (error) {
    console.error('Error updating page:', error);
    return new NextResponse('Error updating page', { status: 500 });
  }
} 