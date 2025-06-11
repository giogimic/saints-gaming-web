import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSession } from 'next-auth/react';
import { hasPermission } from '@/lib/permissions';
import { toast } from 'sonner';

interface Tag {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

interface ThreadTagsProps {
  threadId: string;
  tags: Tag[];
  allTags: Tag[];
  onTagsChange?: (tags: Tag[]) => void;
}

export function ThreadTags({ threadId, tags, allTags, onTagsChange }: ThreadTagsProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(tags.map(t => t.id));

  const canManageTags = session?.user && (
    hasPermission(session.user.role, 'manage:tags') ||
    hasPermission(session.user.role, 'tag:threads')
  );

  const handleTagChange = async (tagIds: string[]) => {
    try {
      const response = await fetch(`/api/forum/threads/${threadId}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tagIds),
      });

      if (!response.ok) {
        throw new Error('Failed to update tags');
      }

      const selectedTags = allTags.filter(tag => tagIds.includes(tag.id));
      onTagsChange?.(selectedTags);
      toast.success('Tags updated successfully');
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating tags:', error);
      toast.error('Failed to update tags');
    }
  };

  return (
    <div className="flex items-center gap-2">
      {tags.map((tag) => (
        <Badge
          key={tag.id}
          variant="secondary"
          style={{ backgroundColor: tag.color + '20', color: tag.color }}
          className="flex items-center gap-1"
        >
          {tag.icon && <span className="text-sm">{tag.icon}</span>}
          {tag.name}
        </Badge>
      ))}

      {canManageTags && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              {tags.length > 0 ? 'Edit Tags' : 'Add Tags'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Thread Tags</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select
                value={selectedTags}
                onValueChange={(value) => {
                  const newTags = Array.isArray(value) ? value : [value];
                  setSelectedTags(newTags);
                  handleTagChange(newTags);
                }}
                multiple
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tags" />
                </SelectTrigger>
                <SelectContent>
                  {allTags.map((tag) => (
                    <SelectItem key={tag.id} value={tag.id}>
                      <div className="flex items-center gap-2">
                        {tag.icon && <span>{tag.icon}</span>}
                        <span>{tag.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 