
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FormField, DBFormField, DBFieldType } from "@/types/form";

export function useFormSave(formId: string) {
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const convertFieldType = (type: FormField['type']): DBFieldType => {
    // Only allow supported field types in the database
    if (['text', 'number', 'email', 'phone', 'checkbox', 'date', 'signature'].includes(type)) {
      return type as DBFieldType;
    }
    // Default to text for unsupported types
    return 'text';
  };

  const handleSave = async (fields: FormField[]) => {
    setIsSaving(true);
    try {
      // First, delete all existing fields for this form
      await supabase
        .from('form_fields')
        .delete()
        .eq('form_id', formId);

      if (fields.length > 0) {
        // Convert FormField[] to database format and insert
        const dbFields: DBFormField[] = fields.map(field => ({
          form_id: formId,
          field_type: convertFieldType(field.type),
          label: field.label,
          placeholder: field.placeholder || "",
          required: field.required || false,
          x_position: field.position?.x || 0,
          y_position: field.position?.y || 0,
          width: field.width || 200,
          height: field.height || 40,
          is_auto_filled: field.isAutoFilled || false,
          tenant_field: field.tenantField || null,
        }));

        const { error } = await supabase
          .from('form_fields')
          .insert(dbFields);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Form saved successfully",
        variant: "default"
      });

      navigate("/forms");
    } catch (error) {
      console.error('Error saving form:', error);
      toast({
        title: "Error",
        description: "Failed to save form",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    handleSave,
  };
}
