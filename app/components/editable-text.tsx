import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'

interface EditableTextProps {
  value: string
  onSave: (value: string) => void
  className?: string
  multiline?: boolean
}

export function EditableText({ value, onSave, className = '', multiline = false }: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedValue, setEditedValue] = useState(value)

  const handleSave = () => {
    if (editedValue !== value) {
      onSave(editedValue)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedValue(value)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2">
        {multiline ? (
          <Textarea
            value={editedValue}
            onChange={(e) => setEditedValue(e.target.value)}
            className={className}
          />
        ) : (
          <Input
            value={editedValue}
            onChange={(e) => setEditedValue(e.target.value)}
            className={className}
          />
        )}
        <div className="flex gap-2">
          <Button onClick={handleSave} size="sm">
            Save
          </Button>
          <Button onClick={handleCancel} variant="outline" size="sm">
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer hover:bg-gray-800/50 rounded px-2 py-1 ${className}`}
    >
      {value}
    </div>
  )
} 