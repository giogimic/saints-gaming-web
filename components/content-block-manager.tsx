"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BlockEditor } from "@/components/block-editor";
import { Plus, GripVertical, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
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
}

interface ContentBlockManagerProps {
  blocks: ContentBlock[];
  onBlocksChange: (blocks: ContentBlock[]) => void;
}

export function ContentBlockManager({ blocks, onBlocksChange }: ContentBlockManagerProps) {
  const [selectedBlock, setSelectedBlock] = useState<ContentBlock | null>(null);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(blocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onBlocksChange(items);
  };

  const handleAddBlock = () => {
    const newBlock: ContentBlock = {
      id: crypto.randomUUID(),
      type: "text",
      content: "",
      settings: {},
    };
    onBlocksChange([...blocks, newBlock]);
    setSelectedBlock(newBlock);
  };

  const handleDeleteBlock = (blockId: string) => {
    const newBlocks = blocks.filter((block) => block.id !== blockId);
    onBlocksChange(newBlocks);
    if (selectedBlock?.id === blockId) {
      setSelectedBlock(null);
    }
  };

  const handleBlockChange = (blockId: string, content: string, settings: BlockSettings) => {
    const newBlocks = blocks.map((block) =>
      block.id === blockId ? { ...block, content, settings } : block
    );
    onBlocksChange(newBlocks);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Content Blocks</h2>
        <Button onClick={handleAddBlock}>
          <Plus className="h-4 w-4 mr-2" />
          Add Block
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="blocks">
          {(provided: DroppableProvided) => (
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
                  {(provided: DraggableProvided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={cn(
                        "p-4 transition-all duration-200",
                        selectedBlock?.id === block.id && "ring-2 ring-primary"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <div
                          {...provided.dragHandleProps}
                          className="cursor-grab"
                        >
                          <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">
                            {block.type.charAt(0).toUpperCase() + block.type.slice(1)} Block
                          </h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteBlock(block.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <BlockEditor
                        type={block.type}
                        content={block.content}
                        settings={block.settings}
                        onChange={(content: string, settings: BlockSettings) =>
                          handleBlockChange(block.id, content, settings)
                        }
                      />
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
  );
} 