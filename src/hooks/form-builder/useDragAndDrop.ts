
import { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import { FormField, FieldType } from "@/types/form";
import { DEFAULT_FIELD_SIZE } from "./types";

export function useDragAndDrop(
  fields: FormField[],
  setFields: (fields: FormField[]) => void,
  setActiveField: (field: FormField | null) => void,
  setSelectedField: (field: FormField | null) => void,
  createNewField: (event: DragEndEvent) => Promise<FormField | null>
) {
  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.isToolbarItem) {
      const type = event.active.data.current?.type as FieldType;
      const newField: FormField = {
        id: `${type}-preview`,
        type,
        label: `New ${type} field`,
        width: DEFAULT_FIELD_SIZE.width,
        height: DEFAULT_FIELD_SIZE.height,
        isAutoFilled: event.active.data.current?.isAutoFilled || false,
        tenantField: event.active.data.current?.tenantField,
      };
      setActiveField(newField);
      setSelectedField(null);
    } else {
      const draggedField = fields.find(f => f.id === event.active.id);
      if (draggedField) {
        setActiveField({
          ...draggedField,
          id: `${draggedField.id}-preview`,
        });
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    if (!active.data.current?.isToolbarItem && overId !== "canvas") {
      const oldIndex = fields.findIndex((f) => f.id === activeId);
      const newIndex = fields.findIndex((f) => f.id === overId);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newFields = [...fields];
        const [removed] = newFields.splice(oldIndex, 1);
        newFields.splice(newIndex, 0, removed);
        setFields(newFields);
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveField(null);
    
    if (!event.over || event.over.id !== "canvas") return;

    // Get the canvas element's position
    const canvasRect = event.over.rect;
    
    // Calculate position relative to the canvas
    const x = Math.max(0, event.active.rect.current.translated?.left || 0);
    const y = Math.max(0, event.active.rect.current.translated?.top || 0);

    if (event.active.data.current?.isToolbarItem) {
      // Create a properly typed event object
      const modifiedEvent: DragEndEvent = {
        ...event,
        active: {
          ...event.active,
          rect: {
            ...event.active.rect,
            current: {
              ...event.active.rect.current,
              translated: {
                left: x,
                top: y,
                width: DEFAULT_FIELD_SIZE.width,
                height: DEFAULT_FIELD_SIZE.height,
                right: x + DEFAULT_FIELD_SIZE.width,
                bottom: y + DEFAULT_FIELD_SIZE.height,
              },
            },
          },
        },
      };
      await createNewField(modifiedEvent);
    } else {
      // Update existing field position
      const fieldId = event.active.id as string;
      const fieldIndex = fields.findIndex(f => f.id === fieldId);
      
      if (fieldIndex !== -1) {
        const updatedFields = [...fields];
        updatedFields[fieldIndex] = {
          ...updatedFields[fieldIndex],
          position: {
            x,
            y,
          },
        };
        setFields(updatedFields);
      }
    }
  };

  return {
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
