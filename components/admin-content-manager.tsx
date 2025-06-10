"use client";

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
import { cn } from "@/lib/utils";

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

interface BlockEditorProps {
  block: {
    id: string;
    type: string;
    content: string;
    settings?: BlockSettings;
    title?: string;
    order: number;
    isPublished: boolean;
    pageId: string;
  };
  onSave: (block: {
    id: string;
    type: string;
    content: string;
    settings?: BlockSettings;
    title?: string;
    order: number;
    isPublished: boolean;
    pageId: string;
  }) => void;
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
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  const canEdit = session?.user && hasPermission(session.user.role, "manage:content");

  useEffect(() => {
    setBlocks(initialBlocks);
  }, [initialBlocks]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(blocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

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
    setSelectedBlock(newBlock.id);
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
    if (selectedBlock === id) {
      setSelectedBlock(null);
    }
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
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-3 space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Add Block</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddBlock("text")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Text
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddBlock("heading")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Heading
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddBlock("image")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Image
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddBlock("video")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Video
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddBlock("button")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Button
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddBlock("card")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Card
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddBlock("grid")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Grid
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddBlock("columns")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Columns
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddBlock("quote")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Quote
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddBlock("code")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Code
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddBlock("table")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Table
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddBlock("divider")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Divider
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddBlock("spacer")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Spacer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddBlock("embed")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Embed
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddBlock("file")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  File
                </Button>
              </div>
            </div>
          </div>

          <div className="col-span-9">
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
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={cn(
                              "relative group",
                              selectedBlock === block.id && "ring-2 ring-primary"
                            )}
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100"
                            >
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteBlock(block.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                            <BlockEditor
                              block={block}
                              onSave={(data) => {
                                handleUpdateBlock(block.id, {
                                  ...data,
                                  order: block.order,
                                  isPublished: block.isPublished,
                                  pageId: block.pageId,
                                });
                              }}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
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