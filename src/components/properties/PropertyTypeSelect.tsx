
import React from "react";
import { PrimaryClassification, SECONDARY_CLASSIFICATIONS } from "./types";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Building2, 
  Building, 
  Trees, 
  Mountain, 
  LandPlot
} from "lucide-react";

interface PropertyTypeSelectProps {
  primaryClassification: PrimaryClassification;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

// Map of property types to their respective icons
const propertyTypeIcons: Record<string, React.ReactNode> = {
  // Single Unit Property
  "House": <Home className="h-6 w-6" />,
  "Individual Condo": <Building2 className="h-6 w-6" />,
  "Mobile Home": <Home className="h-6 w-6" />,
  "Cottage": <Mountain className="h-6 w-6" />,
  "Hobby Farm": <Trees className="h-6 w-6" />,
  "Lot": <LandPlot className="h-6 w-6" />,
  
  // Multi-Unit Property
  "Duplex": <Building className="h-6 w-6" />,
  "Triplex": <Building className="h-6 w-6" />,
  "Fourplex": <Building className="h-6 w-6" />,
  "Apartment Building": <Building2 className="h-6 w-6" />,
  "Mixed-Use Building": <Building2 className="h-6 w-6" />,
  "Commercial Building": <Building2 className="h-6 w-6" />
};

export function PropertyTypeSelect({ primaryClassification, value, onChange, disabled = false }: PropertyTypeSelectProps) {
  const secondaryOptions = SECONDARY_CLASSIFICATIONS[primaryClassification] || [];
  
  return (
    <div className="space-y-3">
      <label className={`block text-sm font-medium ${disabled ? 'text-gray-500 dark:text-gray-400' : 'dark:text-gray-200'}`}>
        Property Type
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {secondaryOptions.map((type) => (
          <div
            key={type}
            onClick={() => !disabled && onChange(type)}
            className={cn(
              "relative flex flex-col items-center justify-center p-4 rounded-lg border transition-colors",
              "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800",
              value === type && "ring-2 ring-primary ring-offset-1 dark:ring-primary dark:ring-offset-background",
              !disabled 
                ? "hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" 
                : "opacity-70"
            )}
          >
            <div className="mb-2 text-gray-700 dark:text-gray-200">
              {propertyTypeIcons[type] || <Home className="h-6 w-6" />}
            </div>
            <span className="text-sm font-medium text-center dark:text-white">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
