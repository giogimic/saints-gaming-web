import { BasePage, BasePageProps } from './base-page';
import { ContentRenderer } from '../content-renderer';

export function DynamicPage({ page }: BasePageProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">{page.title}</h1>
            {page.description && (
              <p className="text-xl text-muted-foreground">{page.description}</p>
            )}
          </div>
        </div>
      </section>

      {/* CMS Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {page.blocks.map((block) => (
                <div key={block.id} className="prose dark:prose-invert max-w-none">
                  <ContentRenderer block={block} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 