
import React, { useState, useCallback } from 'react';
import { DndContext } from '@dnd-kit/core';
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormField } from '@/types/form';
import DraggableField from '@/components/forms/builder/DraggableField';
import FormCanvas from '@/components/forms/builder/FormCanvas';

const initialFields: FormField[] = [
  { id: uuidv4(), type: 'text', label: 'Text Field', required: false, width: 100, height: 40, position: { x: 0, y: 0 } },
  { id: uuidv4(), type: 'number', label: 'Number Field', required: false, width: 100, height: 40, position: { x: 0, y: 0 } },
  { id: uuidv4(), type: 'email', label: 'Email Field', required: false, width: 100, height: 40, position: { x: 0, y: 0 } },
  { id: uuidv4(), type: 'textarea', label: 'Textarea', required: false, width: 200, height: 60, position: { x: 0, y: 0 } },
];

const FormBuilder: React.FC = () => {
  const [fields, setFields] = useState<FormField[]>(initialFields);
  const [canvasFields, setCanvasFields] = useState<FormField[]>([]);
  const [formName, setFormName] = useState<string>('');

  const handleFieldAdd = (field: FormField) => {
    setCanvasFields(prevFields => [...prevFields, { 
      ...field, 
      id: uuidv4(),
      position: field.position || { x: 0, y: 0 },
      placeholder: field.placeholder || '',
    }]);
  };

  const handleFieldRemove = useCallback((id: string) => {
    setCanvasFields(prevFields => prevFields.filter(field => field.id !== id));
  }, []);

  const handleUpdateFieldPosition = useCallback((id: string, x: number, y: number) => {
    setCanvasFields(prevFields =>
      prevFields.map(field =>
        field.id === id ? { ...field, position: { x, y } } : field
      )
    );
  }, []);

  return (
    <DndContext>
      <div className="flex flex-col h-screen">
        <header className="bg-gray-100 p-4">
          <div className="container mx-auto">
            <Label htmlFor="formName">Form Name</Label>
            <Input
              type="text"
              id="formName"
              placeholder="Enter form name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
            <Button className="mt-2">Save Form</Button>
          </div>
        </header>

        <div className="flex flex-1">
          <aside className="w-64 bg-gray-50 p-4 border-r">
            <h2 className="font-semibold mb-2">Fields</h2>
            {fields.map(field => (
              <DraggableField key={field.id} field={field} onFieldAdd={() => handleFieldAdd(field)} />
            ))}
          </aside>

          <main className="flex-1 p-4">
            <h2 className="font-semibold mb-2">Canvas</h2>
            <FormCanvas
              fields={canvasFields}
              onFieldRemove={handleFieldRemove}
              onUpdateFieldPosition={handleUpdateFieldPosition}
            />
          </main>
        </div>
      </div>
    </DndContext>
  );
};

export default FormBuilder;
