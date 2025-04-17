
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { FormField } from '@/types/form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface FormCanvasProps {
  fields: FormField[];
  onFieldRemove: (id: string) => void;
  onUpdateFieldPosition: (id: string, x: number, y: number) => void;
}

const FormCanvas: React.FC<FormCanvasProps> = ({ 
  fields, 
  onFieldRemove, 
  onUpdateFieldPosition 
}) => {
  const { setNodeRef } = useDroppable({
    id: 'canvas',
  });

  return (
    <div 
      ref={setNodeRef} 
      className="w-full h-full min-h-[500px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 p-4"
    >
      {fields.map((field) => (
        <div
          key={field.id}
          className="relative"
          style={{
            position: 'absolute',
            left: field.position?.x || 0,
            top: field.position?.y || 0,
            width: field.width || 100,
            height: field.height || 40,
          }}
        >
          <Card className="w-full h-full">
            <CardContent className="p-3 relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6"
                onClick={() => onFieldRemove(field.id)}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium">{field.label}</div>
              {field.type === 'text' && (
                <input 
                  type="text" 
                  className="w-full mt-1 px-2 py-1 border rounded" 
                  placeholder={field.placeholder || field.label}
                  disabled
                />
              )}
              {field.type === 'textarea' && (
                <textarea 
                  className="w-full mt-1 px-2 py-1 border rounded" 
                  placeholder={field.placeholder || field.label}
                  disabled
                />
              )}
              {field.type === 'number' && (
                <input 
                  type="number" 
                  className="w-full mt-1 px-2 py-1 border rounded" 
                  placeholder={field.placeholder || field.label}
                  disabled
                />
              )}
              {field.type === 'email' && (
                <input 
                  type="email" 
                  className="w-full mt-1 px-2 py-1 border rounded" 
                  placeholder={field.placeholder || field.label}
                  disabled
                />
              )}
            </CardContent>
          </Card>
        </div>
      ))}
      {fields.length === 0 && (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          Drag and drop fields here
        </div>
      )}
    </div>
  );
};

export default FormCanvas;
