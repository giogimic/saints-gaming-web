"use client";

import { useState } from "react";
import { ContentBlock } from "@/types/content";
import { BlockEditor } from "@/components/block-editor";
import { BlockPreview } from "@/components/block-preview";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, GripVertical, Trash2 } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";

interface AdminContentManagerProps {
  pageId: string;
  initialBlocks: ContentBlock[];
  onSave: (blocks: ContentBlock[]) => Promise<void>;
}

export function AdminContentManager({
  pageId,
  initialBlocks,
  onSave,
}: AdminContentManagerProps) {
  const [blocks, setBlocks] = useState<ContentBlock[]>(initialBlocks);
  const [selectedBlock, setSelectedBlock] = useState<ContentBlock | null>(null);
  const [activeTab, setActiveTab] = useState("edit");

  const handleAddBlock = (type: string) => {
    const newBlock: ContentBlock = {
      id: crypto.randomUUID(),
      type,
      content: "",
      settings: {},
      order: blocks.length,
    };
    setBlocks([...blocks, newBlock]);
    setSelectedBlock(newBlock);
  };

  const handleUpdateBlock = (updatedBlock: ContentBlock) => {
    setBlocks(
      blocks.map((block) =>
        block.id === updatedBlock.id ? updatedBlock : block
      )
    );
  };

  const handleDeleteBlock = (blockId: string) => {
    setBlocks(blocks.filter((block) => block.id !== blockId));
    if (selectedBlock?.id === blockId) {
      setSelectedBlock(null);
    }
  };

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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Content Manager</h2>
        <div className="flex gap-2">
          <Button onClick={() => handleAddBlock("text")}>
            <Plus className="w-4 h-4 mr-2" />
            Add Text Block
          </Button>
          <Button onClick={() => handleAddBlock("hero")}>
            <Plus className="w-4 h-4 mr-2" />
            Add Hero Section
          </Button>
          <Button onClick={() => handleAddBlock("grid")}>
            <Plus className="w-4 h-4 mr-2" />
            Add Grid
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="space-y-4">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Blocks</h3>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="blocks">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2"
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
                                  "p-2 rounded border cursor-pointer",
                                  selectedBlock?.id === block.id
                                    ? "border-primary"
                                    : "border-border"
                                )}
                                onClick={() => setSelectedBlock(block)}
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-grab"
                                  >
                                    <GripVertical className="w-4 h-4" />
                                  </div>
                                  <span className="flex-1">
                                    {block.type.charAt(0).toUpperCase() +
                                      block.type.slice(1)}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteBlock(block.id);
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </Card>
            </div>

            <div className="col-span-8">
              {selectedBlock ? (
                <BlockEditor
                  block={selectedBlock}
                  onSave={handleUpdateBlock}
                />
              ) : (
                <Card className="p-8 text-center text-muted-foreground">
                  Select a block to edit
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          {blocks.map((block) => (
            <BlockPreview key={block.id} block={block} />
          ))}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button
          onClick={() => onSave(blocks)}
          disabled={blocks.length === 0}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
} 