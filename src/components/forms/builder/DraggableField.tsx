
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { FormField } from '@/types/form';
import { Card, CardContent } from '@/components/ui/card';

interface DraggableFieldProps {
  field: FormField;
  onFieldAdd: () => void;
}

const DraggableField: React.FC<DraggableFieldProps> = ({ field, onFieldAdd }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: field.id,
    data: field,
  });

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} onClick={onFieldAdd}>
      <Card className="mb-2 cursor-move hover:bg-gray-50">
        <CardContent className="p-3">
          <div className="text-sm font-medium">{field.label}</div>
          <div className="text-xs text-muted-foreground">{field.type}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DraggableField;
