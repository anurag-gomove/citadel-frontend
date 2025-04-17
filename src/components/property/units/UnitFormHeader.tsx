
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";

interface UnitFormHeaderProps {
  propertyId: string;
  isEditMode: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export function UnitFormHeader({ 
  propertyId, 
  isEditMode, 
  isSubmitting,
  onSubmit
}: UnitFormHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <Button
        variant="outline"
        size="sm"
        asChild
        className="gap-1"
      >
        <Link to={`/properties/${propertyId}`}>
          <ArrowLeft className="h-4 w-4" />
          Back to Property
        </Link>
      </Button>
      <h1 className="text-2xl font-bold">
        {isEditMode ? "Edit Unit" : "Create New Unit"}
      </h1>
      <Button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="gap-1"
      >
        <Check className="h-4 w-4" />
        {isSubmitting ? "Saving..." : "Save Unit"}
      </Button>
    </div>
  );
}
