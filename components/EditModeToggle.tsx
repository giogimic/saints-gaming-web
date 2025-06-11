import { useEditMode } from '@/app/contexts/EditModeContext';
import { useSession } from 'next-auth/react';

export default function EditModeToggle() {
  const { isEditMode, toggleEditMode } = useEditMode();
  const { data: session } = useSession();

  if (session?.user?.role !== 'admin') return null;

  return (
    <button
      className={`btn mt-2 ${isEditMode ? 'accent' : ''}`}
      onClick={toggleEditMode}
      aria-pressed={isEditMode}
      aria-label="Toggle edit mode"
    >
      {isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
    </button>
  );
} 