
import React from "react";
import { Building, Home } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface LeasePropertySelectionProps {
  properties: any[];
  units: any[];
  selectedPropertyId: string | null;
  isPropertiesLoading: boolean;
  isUnitsLoading: boolean;
  onPropertyChange: (propertyId: string) => void;
  onUnitChange: (unitId: string) => void;
}

export function LeasePropertySelection({
  properties,
  units,
  selectedPropertyId,
  isPropertiesLoading,
  isUnitsLoading,
  onPropertyChange,
  onUnitChange
}: LeasePropertySelectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full md:max-w-3xl">
      <div>
        <Label htmlFor="property-select" className="mb-2 flex items-center">
          <Building className="h-4 w-4 mr-1" /> Property
        </Label>
        <Select 
          value={selectedPropertyId || ""}
          onValueChange={onPropertyChange}
          disabled={isPropertiesLoading}
        >
          <SelectTrigger id="property-select" className="w-full">
            <SelectValue placeholder="Select a property" />
          </SelectTrigger>
          <SelectContent className="min-w-[300px]">
            {properties.map((property) => (
              <SelectItem key={property.id} value={property.id}>
                {property.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="unit-select" className="mb-2 flex items-center">
          <Home className="h-4 w-4 mr-1" /> Unit
        </Label>
        <Select 
          onValueChange={onUnitChange}
          disabled={!selectedPropertyId || isUnitsLoading}
        >
          <SelectTrigger id="unit-select" className="w-full">
            <SelectValue placeholder="Select a unit" />
          </SelectTrigger>
          <SelectContent className="min-w-[300px]">
            {units.map((unit) => (
              <SelectItem 
                key={unit.id} 
                value={unit.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center justify-between w-full">
                  <span>
                    {unit.unit_number} ({unit.bedrooms}BR, {unit.bathrooms}BA)
                  </span>
                  <Badge className={unit.status === 'vacant' ? 'bg-green-500' : 'bg-red-500'}>
                    {unit.status === 'vacant' ? 'Vacant' : 'Occupied'}
                  </Badge>
                </div>
              </SelectItem>
            ))}
            {units.length === 0 && selectedPropertyId && !isUnitsLoading && (
              <div className="px-2 py-1 text-sm text-muted-foreground">
                No units available
              </div>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
