
import React from "react";
import { PRIMARY_CLASSIFICATIONS, PrimaryClassification } from "./types";
import { cn } from "@/lib/utils";
import { Home, Building2, Building, LandPlot } from "lucide-react";

interface PrimaryClassificationSelectProps {
  value: PrimaryClassification;
  onChange: (value: PrimaryClassification) => void;
  disabled?: boolean;
}

// Map of primary classifications to their respective icons
const classificationIcons: Record<PrimaryClassification, React.ReactNode> = {
  residential: <Home className="h-6 w-6" />,
  commercial: <Building2 className="h-6 w-6" />,
  industrial: <Building className="h-6 w-6" />,
  land: <LandPlot className="h-6 w-6" />
};

export function PrimaryClassificationSelect({ value, onChange, disabled = false }: PrimaryClassificationSelectProps) {
  return (
    <div className="space-y-3">
      <label className={`block text-sm font-medium ${disabled ? 'text-gray-500 dark:text-gray-400' : 'dark:text-gray-200'}`}>
        Primary Classification
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PRIMARY_CLASSIFICATIONS.map((classification) => (
          <div
            key={classification}
            onClick={() => !disabled && onChange(classification)}
            className={cn(
              "relative flex flex-col items-center justify-center p-4 rounded-lg border transition-colors",
              "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800",
              value === classification && "ring-2 ring-primary ring-offset-1 dark:ring-primary dark:ring-offset-background",
              !disabled 
                ? "hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" 
                : "opacity-70"
            )}
          >
            <div className="mb-2 text-gray-700 dark:text-gray-200">
              {classificationIcons[classification]}
            </div>
            <span className="text-sm font-medium text-center dark:text-white">{classification}</span>
            <p className="text-xs text-gray-500 dark:text-gray-300 text-center mt-1">
              {classification === 'residential' && "Housing properties for living"}
              {classification === 'commercial' && "Properties for business use"}
              {classification === 'industrial' && "Properties for manufacturing and production"}
              {classification === 'land' && "Undeveloped or vacant land"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
