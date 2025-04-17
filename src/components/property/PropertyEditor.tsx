
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Edit } from "lucide-react";

interface PropertyEditorProps {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
  isPending?: boolean;
  alwaysEdit?: boolean;
}

export function PropertyEditor({
  isEditing,
  setIsEditing,
  onSave,
  onCancel,
  isPending = false,
  alwaysEdit = false,
}: PropertyEditorProps) {
  return (
    <>
      {(!isEditing && !alwaysEdit) ? (
        <Button 
          onClick={() => setIsEditing(true)} 
          variant="outline"
          className="flex items-center gap-1"
        >
          <Edit className="h-4 w-4" />
          Edit
        </Button>
      ) : (
        <div className="flex gap-2">
          <Button 
            onClick={onSave} 
            variant="default"
            className="flex items-center gap-1"
            disabled={isPending}
          >
            <Check className="h-4 w-4" />
            Save
          </Button>
          {!alwaysEdit && (
            <Button 
              onClick={onCancel} 
              variant="outline"
              className="flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          )}
        </div>
      )}
    </>
  );
}
