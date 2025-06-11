import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useEditMode } from '@/app/contexts/EditModeContext';

interface PageContent {
  [key: string]: any;
}

interface UsePageContentProps {
  pageId: string;
  defaultContent: PageContent;
}

export function usePageContent({ pageId, defaultContent }: UsePageContentProps) {
  const { isEditMode, canEdit } = useEditMode();
  const { toast } = useToast();
  const [content, setContent] = useState<PageContent>(defaultContent);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetch(`/api/content/${pageId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.content) {
            try {
              const parsedContent = JSON.parse(data.content);
              // Merge with default content to ensure all required fields exist
              setContent({
                ...defaultContent,
                ...parsedContent,
              });
            } catch (error) {
              console.error('Error parsing content:', error);
              setContent(defaultContent);
            }
          } else {
            setContent(defaultContent);
          }
        } else {
          setContent(defaultContent);
        }
      } catch (error) {
        console.error('Error loading content:', error);
        setContent(defaultContent);
      } finally {
        setIsLoading(false);
      }
    };
    loadContent();
  }, [pageId, defaultContent]);

  const saveContent = async () => {
    try {
      const response = await fetch('/api/content/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageId,
          content: JSON.stringify(content),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save content');
      }

      toast({
        title: "Success",
        description: "Content saved successfully",
      });
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "Error",
        description: "Failed to save content",
        variant: "destructive",
      });
    }
  };

  const handleSave = (field: string, value: any) => {
    setContent((prevContent) => ({
      ...prevContent,
      [field]: value,
    }));
    saveContent();
  };

  const handleNestedSave = (parentField: string, childId: string, field: string, value: any) => {
    setContent((prevContent) => {
      const parentArray = prevContent[parentField] || [];
      return {
        ...prevContent,
        [parentField]: parentArray.map((item: any) =>
          item.id === childId ? { ...item, [field]: value } : item
        ),
      };
    });
    saveContent();
  };

  return {
    content,
    isLoading,
    isEditMode,
    canEdit,
    handleSave,
    handleNestedSave,
  };
} 