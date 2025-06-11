'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ContentBlock {
  id: string;
  type: string;
  content: string;
  settings?: any;
  order: number;
}

interface ContentBlockManagerProps {
  blocks: ContentBlock[];
  initialContent?: any;
}

export function ContentBlockManagerClient({ blocks, initialContent }: ContentBlockManagerProps) {
  const [content, setContent] = useState<any>(initialContent || {});
  const router = useRouter();

  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  const handleContentChange = async (blockId: string, newContent: any) => {
    try {
      const updatedContent = {
        ...content,
        [blockId]: newContent,
      };

      setContent(updatedContent);

      const response = await fetch('/api/content/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageId: window.location.pathname.slice(1),
          content: updatedContent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save content');
      }

      router.refresh();
    } catch (error) {
      console.error('Error saving content:', error);
      // Revert the content change on error
      setContent(content);
    }
  };

  return (
    <div className="space-y-8">
      {blocks.map((block) => (
        <div key={block.id} className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">{block.type}</h3>
          <div className="prose max-w-none">
            {typeof block.content === 'string' ? (
              <div dangerouslySetInnerHTML={{ __html: block.content }} />
            ) : (
              <pre>{JSON.stringify(block.content, null, 2)}</pre>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 