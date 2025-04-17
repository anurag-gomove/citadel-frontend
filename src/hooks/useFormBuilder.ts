
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormField } from "@/types/form";
import { DragEndEvent } from "@dnd-kit/core";
import { useFieldOperations } from "./form-builder/useFieldOperations";
import { useDragAndDrop } from "./form-builder/useDragAndDrop";
import { useFormSave } from "./form-builder/useFormSave";

export function useFormBuilder(formId: string) {
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const navigate = useNavigate();

  const {
    fields,
    selectedField,
    activeField,
    setFields,
    setActiveField,
    handleFieldSelect,
    handleFieldUpdate,
    handleFieldDelete,
    createNewField,
  } = useFieldOperations(formId);

  const { handleDragStart, handleDragOver, handleDragEnd } = useDragAndDrop(
    fields,
    setFields,
    setActiveField,
    handleFieldSelect,
    createNewField
  );

  const { isSaving, handleSave } = useFormSave(formId);

  return {
    fields,
    selectedField,
    formName,
    formCategory,
    isSaving,
    activeField,
    setFields,
    setFormName,
    setFormCategory,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleFieldSelect,
    handleFieldUpdate,
    handleFieldDelete,
    handleSave: () => handleSave(fields),
    navigate,
  };
}
