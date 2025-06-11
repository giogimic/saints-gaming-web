"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { UserRole } from "@/lib/permissions";

// EditModeContext: Only admins can toggle edit mode. All pages/components must use this context.
interface EditModeContextType {
  isEditMode: boolean;
  canEdit: boolean;
  toggleEditMode: () => void;
}

const EditModeContext = createContext<EditModeContextType>({
  isEditMode: false,
  canEdit: false,
  toggleEditMode: () => {},
});

export function EditModeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [isEditMode, setIsEditMode] = useState(false);
  const canEdit = session?.user?.role === UserRole.ADMIN;

  useEffect(() => {
    // Check localStorage for persisted edit mode state
    const storedEditMode = localStorage.getItem("editMode");
    if (storedEditMode === "true" && canEdit) {
      setIsEditMode(true);
    }
  }, [canEdit]);

  useEffect(() => {
    // Reset edit mode when user logs out or changes
    if (!canEdit) {
      setIsEditMode(false);
      localStorage.removeItem("editMode");
    }
  }, [canEdit]);

  const toggleEditMode = () => {
    if (!canEdit) {
      toast.error("You don't have permission to edit content");
      return;
    }

    const newEditMode = !isEditMode;
    setIsEditMode(newEditMode);
    localStorage.setItem("editMode", String(newEditMode));

    // Add transition class to body
    document.body.classList.add("edit-mode-transition");
    if (newEditMode) {
      document.body.classList.add("edit-mode-active");
    } else {
      document.body.classList.remove("edit-mode-active");
    }

    // Remove transition class after animation
    setTimeout(() => {
      document.body.classList.remove("edit-mode-transition");
    }, 300);

    toast.success(newEditMode ? "Edit mode enabled" : "Edit mode disabled");
  };

  return (
    <EditModeContext.Provider value={{ isEditMode, canEdit, toggleEditMode }}>
      {children}
    </EditModeContext.Provider>
  );
}

export const useEditMode = () => {
  const context = useContext(EditModeContext);
  if (context === undefined) {
    throw new Error("useEditMode must be used within an EditModeProvider");
  }
  return context;
}; 