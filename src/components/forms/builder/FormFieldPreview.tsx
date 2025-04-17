
import { FormField } from "@/types/form";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface FormFieldPreviewProps {
  field: FormField;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onUpdate: (field: FormField) => void;
  isDragging?: boolean;
}

export function FormFieldPreview({
  field,
  isSelected,
  onSelect,
  onDelete,
  onUpdate,
  isDragging,
}: FormFieldPreviewProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: field.width || 200,
    height: field.height || 40,
  };

  if (isDragging) {
    return (
      <div
        style={style}
        className="bg-green-200/50 border-2 border-green-500 rounded pointer-events-none"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`bg-white border rounded-lg overflow-hidden ${
        isSelected ? "border-primary shadow-md" : "border-border"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between p-2 gap-2">
        <div {...listeners} className="cursor-move">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <span className="flex-1 truncate text-sm">{field.label}</span>
        {field.isAutoFilled && (
          <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
            Auto
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
