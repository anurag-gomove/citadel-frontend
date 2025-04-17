
import React, { useEffect } from "react";
import type { PropertyFormData } from "./types";
import { PrimaryClassification, PRIMARY_CLASSIFICATIONS, SECONDARY_CLASSIFICATIONS } from "./types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PrimaryClassificationSelect } from "./PrimaryClassificationSelect";
import { PropertyTypeSelect } from "./PropertyTypeSelect";

interface PropertyDetailsFormProps {
  formData: PropertyFormData;
  onFieldChange: (field: keyof PropertyFormData, value: string) => void;
  disabled?: boolean;
}

export function PropertyDetailsForm({ formData, onFieldChange, disabled = false }: PropertyDetailsFormProps) {
  const currentYear = new Date().getFullYear();
  
  // Generate years from 1800 to current year
  const years = Array.from({ length: currentYear - 1799 }, (_, i) => (currentYear - i).toString());

  // Set default primary classification if not set
  useEffect(() => {
    if (!formData.primary_classification && !disabled) {
      onFieldChange("primary_classification", PRIMARY_CLASSIFICATIONS[0]);
    }
  }, [formData.primary_classification, disabled]);

  // Update secondary classification when primary changes
  useEffect(() => {
    if (formData.primary_classification && !formData.secondary_classification && !disabled) {
      // Set first option as default
      const options = formData.primary_classification ? 
        SECONDARY_CLASSIFICATIONS[formData.primary_classification] : [];
      
      if (options.length > 0) {
        onFieldChange("secondary_classification", options[0]);
      }
    }
  }, [formData.primary_classification, formData.secondary_classification, disabled]);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold dark:text-white">Property Details</h2>
      
      <PrimaryClassificationSelect
        value={formData.primary_classification as PrimaryClassification || PRIMARY_CLASSIFICATIONS[0]}
        onChange={(value) => {
          onFieldChange("primary_classification", value);
          // Reset secondary classification when primary changes
          const options = SECONDARY_CLASSIFICATIONS[value];
          if (options && options.length > 0) {
            onFieldChange("secondary_classification", options[0]);
          }
        }}
        disabled={disabled}
      />

      {formData.primary_classification && (
        <PropertyTypeSelect
          primaryClassification={formData.primary_classification as PrimaryClassification}
          value={formData.secondary_classification || ""}
          onChange={(value) => {
            onFieldChange("secondary_classification", value);
            // Also update the legacy type field for backward compatibility
            onFieldChange("type", value as any);
          }}
          disabled={disabled}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-1 ${disabled ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>
            Year Built
          </label>
          <Select
            value={formData.year_built || ""}
            onValueChange={(value) => onFieldChange("year_built", value)}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] overflow-y-auto">
              <div className="max-h-[300px] overflow-y-auto">
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </div>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${disabled ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>
            Year Occupied
          </label>
          <Select
            value={formData.year_occupied || ""}
            onValueChange={(value) => onFieldChange("year_occupied", value)}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] overflow-y-auto">
              <div className="max-h-[300px] overflow-y-auto">
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </div>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
