import { Page, ContentBlock } from '@prisma/client';
import { ContentRenderer } from '@/components/content-renderer';

export interface BasePageProps {
  page: Page & {
    blocks: ContentBlock[];
  };
}

export function BasePage({ page }: BasePageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{page.title}</h1>
        {page.description && (
          <p className="text-xl text-muted-foreground">{page.description}</p>
        )}
      </div>

      <div className="space-y-8">
        {page.blocks.map((block) => (
          <div key={block.id} className="prose dark:prose-invert max-w-none">
            <ContentRenderer block={block} />
          </div>
        ))}
      </div>
    </div>
  );
} 