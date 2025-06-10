import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, GripVertical, Trash2, Eye, EyeOff, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlockEditor } from "@/components/block-editor";
import { ContentBlockManager } from "@/components/content-block-manager";
import { InlineEditor } from "@/components/inline-editor";
import { hasPermission } from "@/lib/permissions";

interface BlockSettings {
  imageUrl?: string;
  videoUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  alignment?: "left" | "center" | "right";
  padding?: string;
  margin?: string;
  borderRadius?: string;
  shadow?: string;
  opacity?: number;
  animation?: string;
  customClass?: string;
}

interface ContentBlock {
  id: string;
  type: string;
  content: string;
  settings: BlockSettings;
  title?: string;
  order: number;
  isPublished: boolean;
  pageId: string;
}

interface AdminContentManagerProps {
  pageId: string;
  initialBlocks?: ContentBlock[];
  onSave?: (blocks: ContentBlock[]) => Promise<void>;
}

export function AdminContentManager({
  pageId,
  initialBlocks = [],
  onSave,
}: AdminContentManagerProps) {
  const { data: session } = useSession();
  const [blocks, setBlocks] = useState<ContentBlock[]>(initialBlocks);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");

  const canEdit = session?.user && hasPermission(session.user.role, "manage:content");

  useEffect(() => {
    setBlocks(initialBlocks);
  }, [initialBlocks]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(blocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order property for all blocks
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setBlocks(updatedItems);
  };

  const handleAddBlock = (type: string) => {
    const newBlock: ContentBlock = {
      id: crypto.randomUUID(),
      type,
      content: "",
      settings: {},
      order: blocks.length,
      isPublished: false,
      pageId,
    };
    setBlocks([...blocks, newBlock]);
  };

  const handleUpdateBlock = (id: string, updates: Partial<ContentBlock>) => {
    setBlocks(
      blocks.map((block) =>
        block.id === id ? { ...block, ...updates } : block
      )
    );
  };

  const handleDeleteBlock = (id: string) => {
    setBlocks(blocks.filter((block) => block.id !== id));
  };

  const handleSave = async () => {
    if (!onSave) return;

    setIsSaving(true);
    try {
      await onSave(blocks);
      toast.success("Changes saved successfully");
    } catch (error) {
      console.error("Error saving blocks:", error);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  if (!canEdit) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {isEditing ? "Preview" : "Edit"}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <TabsContent value="edit" className="mt-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddBlock("text")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Text Block
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddBlock("card")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Card Block
            </Button>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="blocks">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {blocks.map((block, index) => (
                    <Draggable
                      key={block.id}
                      draggableId={block.id}
                      index={index}
                    >
                      {(provided) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="p-4"
                        >
                          <div className="flex items-center gap-2 mb-4">
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-move"
                            >
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteBlock(block.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>

                          {isEditing ? (
                            <BlockEditor
                              block={block}
                              onSave={async (data) => {
                                handleUpdateBlock(block.id, {
                                  title: data.title,
                                  content: data.content,
                                  type: data.type,
                                  order: data.order,
                                  settings: data.settings,
                                  isPublished: data.isPublished,
                                });
                              }}
                            />
                          ) : (
                            <ContentBlockManager
                              blocks={[block]}
                              onBlocksChange={(updatedBlocks) => {
                                if (updatedBlocks[0]) {
                                  handleUpdateBlock(block.id, updatedBlocks[0]);
                                }
                              }}
                            />
                          )}
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </TabsContent>

      <TabsContent value="preview" className="mt-4">
        <div className="space-y-4">
          {blocks.map((block) => (
            <ContentBlockManager
              key={block.id}
              blocks={[block]}
              onBlocksChange={(updatedBlocks) => {
                if (updatedBlocks[0]) {
                  handleUpdateBlock(block.id, updatedBlocks[0]);
                }
              }}
            />
          ))}
        </div>
      </TabsContent>
    </div>
  );
} 