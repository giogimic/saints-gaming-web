"use client";

import { useSession } from "next-auth/react";
import { useEditMode } from "@/app/contexts/EditModeContext";
import { Button } from "@/components/ui/button";
import { Pencil, Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UserRole } from "@/lib/permissions";

export function EditModeToggle() {
  const { data: session } = useSession();
  const { isEditMode, toggleEditMode } = useEditMode();
  const isAdmin = session?.user?.role === UserRole.ADMIN;

  if (!isAdmin) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={toggleEditMode}
            variant={isEditMode ? "default" : "outline"}
            size="icon"
            className={`
              fixed bottom-4 right-4 z-50
              transition-all duration-300 ease-in-out
              ${isEditMode ? "bg-primary hover:bg-primary/90" : "bg-background hover:bg-accent"}
              shadow-lg hover:shadow-xl
              rounded-full
              h-12 w-12
              flex items-center justify-center
              group
            `}
          >
            {isEditMode ? (
              <Check className="h-6 w-6 text-primary-foreground transition-transform duration-300 group-hover:scale-110" />
            ) : (
              <Pencil className="h-6 w-6 text-foreground transition-transform duration-300 group-hover:scale-110" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-background/95 backdrop-blur-sm">
          <p className="text-sm font-medium">
            {isEditMode ? "Exit Edit Mode" : "Enter Edit Mode"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 