
import { FormField } from "@/types/form";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FormFieldPreview } from "./FormFieldPreview";

interface FormBuilderCanvasProps {
  fields: FormField[];
  selectedField: FormField | null;
  onFieldSelect: (field: FormField) => void;
  onFieldDelete: (fieldId: string) => void;
  onFieldUpdate?: (field: FormField) => void;
}

export function FormBuilderCanvas({
  fields,
  selectedField,
  onFieldSelect,
  onFieldDelete,
  onFieldUpdate,
}: FormBuilderCanvasProps) {
  const { setNodeRef } = useDroppable({
    id: "canvas",
  });

  return (
    <div className="col-span-1 bg-gray-50 p-4 rounded-lg min-h-[600px]">
      <div
        ref={setNodeRef}
        className="relative w-full h-full"
      >
        <SortableContext
          items={fields.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {fields.map((field) => (
              <FormFieldPreview
                key={field.id}
                field={field}
                isSelected={selectedField?.id === field.id}
                onSelect={() => onFieldSelect(field)}
                onDelete={() => onFieldDelete(field.id)}
                onUpdate={onFieldUpdate || (() => {})}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
