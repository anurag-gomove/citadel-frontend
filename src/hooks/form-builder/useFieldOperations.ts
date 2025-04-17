import { useState } from "react";
import { FormField } from "@/types/form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GRID_SIZE, DEFAULT_FIELD_SIZE } from "./types";
import { DragEndEvent } from "@dnd-kit/core";

export function useFieldOperations(formId: string) {
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [activeField, setActiveField] = useState<FormField | null>(null);
  const { toast } = useToast();

  const handleFieldSelect = (field: FormField) => {
    setSelectedField(field);
  };

  const handleFieldUpdate = async (updatedField: FormField) => {
    try {
      console.log('Updating field:', updatedField);
      const { error } = await supabase
        .from('form_fields')
        .update({
          label: updatedField.label,
          placeholder: updatedField.placeholder,
          required: updatedField.required,
          x_position: updatedField.position?.x,
          y_position: updatedField.position?.y,
          is_auto_filled: updatedField.isAutoFilled,
          tenant_field: updatedField.tenantField,
          options: updatedField.options,
        })
        .eq('id', updatedField.id);

      if (error) {
        console.error('Error details:', error);
        throw error;
      }

      setFields((fields) =>
        fields.map((f) => (f.id === updatedField.id ? updatedField : f))
      );
    } catch (error) {
      console.error('Error updating field:', error);
      toast({
        title: "Error",
        description: "Failed to update field",
        variant: "destructive",
      });
    }
  };

  const handleFieldDelete = async (fieldId: string) => {
    try {
      const { error } = await supabase
        .from('form_fields')
        .delete()
        .eq('id', fieldId);

      if (error) throw error;

      setFields((fields) => fields.filter((f) => f.id !== fieldId));
      if (selectedField?.id === fieldId) {
        setSelectedField(null);
      }
    } catch (error) {
      console.error('Error deleting field:', error);
      toast({
        title: "Error",
        description: "Failed to delete field",
        variant: "destructive",
      });
    }
  };

  const createNewField = async (event: DragEndEvent) => {
    if (!event.active.data.current?.type) return null;
    
    const activeType = event.active.data.current.type;
    const newField: FormField = {
      id: `${activeType}-${Date.now()}`,
      form_id: formId,
      type: activeType,
      label: `New ${activeType} field`,
      width: DEFAULT_FIELD_SIZE.width,
      height: DEFAULT_FIELD_SIZE.height,
      position: {
        x: Math.round(event.over!.rect.left / GRID_SIZE) * GRID_SIZE,
        y: Math.round(event.over!.rect.top / GRID_SIZE) * GRID_SIZE,
      },
      isAutoFilled: event.active.data.current?.isAutoFilled || false,
      tenantField: event.active.data.current?.tenantField,
    };

    try {
      const { data, error } = await supabase
        .from('form_fields')
        .insert({
          form_id: formId,
          field_type: activeType,
          label: newField.label,
          x_position: newField.position.x,
          y_position: newField.position.y,
          width: newField.width,
          height: newField.height,
          is_auto_filled: newField.isAutoFilled,
          tenant_field: newField.tenantField,
        })
        .select()
        .single();

      if (error) throw error;
      
      newField.id = data.id;
      setFields(fields => [...fields, newField]);
      return newField;
      
    } catch (error) {
      console.error('Error saving field:', error);
      toast({
        title: "Error",
        description: "Failed to save field position",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    fields,
    selectedField,
    activeField,
    setFields,
    setActiveField,
    handleFieldSelect,
    handleFieldUpdate,
    handleFieldDelete,
    createNewField,
  };
}
