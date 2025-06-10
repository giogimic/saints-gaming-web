import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface EditableTextProps {
  value: string
  onSave: (value: string) => Promise<void>
  type?: 'text' | 'textarea'
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function EditableText({
  value,
  onSave,
  type = 'text',
  placeholder,
  className = '',
  disabled = false,
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedValue, setEditedValue] = useState(value)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (editedValue === value) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    try {
      await onSave(editedValue)
      setIsEditing(false)
      toast.success('Changes saved successfully')
    } catch (error) {
      console.error('Error saving changes:', error)
      toast.error('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedValue(value)
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <div
        className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded ${className}`}
        onClick={() => !disabled && setIsEditing(true)}
      >
        {value || placeholder || 'Click to edit'}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {type === 'textarea' ? (
        <Textarea
          value={editedValue}
          onChange={(e) => setEditedValue(e.target.value)}
          placeholder={placeholder}
          className={className}
          disabled={isSaving}
        />
      ) : (
        <Input
          value={editedValue}
          onChange={(e) => setEditedValue(e.target.value)}
          placeholder={placeholder}
          className={className}
          disabled={isSaving}
        />
      )}
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving || editedValue === value}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
} 