import { ContentBlock } from '@prisma/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface ContentRendererProps {
  block: ContentBlock;
}

export function ContentRenderer({ block }: ContentRendererProps) {
  const content = typeof block.content === 'string' 
    ? JSON.parse(block.content) 
    : block.content;

  switch (block.type) {
    case 'text':
      return <div dangerouslySetInnerHTML={{ __html: content.html }} />;
    
    case 'image':
      return (
        <div className="relative aspect-video">
          <Image
            src={content.url}
            alt={content.alt || ''}
            fill
            className="object-cover rounded-lg"
          />
        </div>
      );
    
    case 'card':
      return (
        <Card>
          {content.title && (
            <CardHeader>
              <CardTitle>{content.title}</CardTitle>
              {content.description && (
                <CardDescription>{content.description}</CardDescription>
              )}
            </CardHeader>
          )}
          {content.content && <CardContent>{content.content}</CardContent>}
          {content.buttonText && content.buttonUrl && (
            <CardFooter>
              <Button asChild>
                <a href={content.buttonUrl}>{content.buttonText}</a>
              </Button>
            </CardFooter>
          )}
        </Card>
      );
    
    case 'grid':
      return (
        <div className={`grid gap-6 ${content.columns || 'md:grid-cols-2'}`}>
          {content.items?.map((item: any, index: number) => (
            <ContentRenderer key={index} block={{ ...block, content: item }} />
          ))}
        </div>
      );
    
    case 'cta':
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">{content.title}</h2>
          <p className="text-muted-foreground mb-6">{content.description}</p>
          {content.buttonText && content.buttonUrl && (
            <Button asChild size="lg">
              <a href={content.buttonUrl}>{content.buttonText}</a>
            </Button>
          )}
        </div>
      );
    
    default:
      return <div>{JSON.stringify(content)}</div>;
  }
} 