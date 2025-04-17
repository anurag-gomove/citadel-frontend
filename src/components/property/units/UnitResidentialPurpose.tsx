
import React, { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UnitResidentialPurposeProps {
  unit: any;
  isReadOnly?: boolean;
  onChange?: (field: string, value: any) => void;
}

export function UnitResidentialPurpose({
  unit,
  isReadOnly = false,
  onChange = () => {},
}: UnitResidentialPurposeProps) {
  // Local state for checkboxes
  const [residentialOnly, setResidentialOnly] = useState<boolean>(true);
  const [mixedTypes, setMixedTypes] = useState<string[]>([]);

  // Sync with incoming unit data
  useEffect(() => {
    if (unit) {
      setResidentialOnly(unit.residential_purpose_only === true);
      
      let initialMixedTypes: string[] = [];
      
      if (unit.mixed_purpose_types) {
        if (Array.isArray(unit.mixed_purpose_types)) {
          initialMixedTypes = unit.mixed_purpose_types;
        } else if (typeof unit.mixed_purpose_types === 'string') {
          try {
            const parsed = JSON.parse(unit.mixed_purpose_types);
            initialMixedTypes = Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            console.error("Error parsing mixed_purpose_types:", e);
          }
        }
      }
      
      setMixedTypes(initialMixedTypes);
      console.log("Initial mixed types:", initialMixedTypes);
    }
  }, [unit]);

  // Options for mixed purpose types
  const mixedPurposeOptions = [
    { id: "commercial", label: "Commercial" },
    { id: "professional", label: "Professional" },
    { id: "industrial", label: "Industrial" },
  ];

  // Handle residential purpose change
  const handleResidentialChange = (checked: boolean | "indeterminate") => {
    const isChecked = checked === true;
    setResidentialOnly(isChecked);
    onChange("residential_purpose_only", isChecked);
    console.log("Residential purpose changed to:", isChecked);
    
    // If switching back to residential only, clear mixed types
    if (isChecked) {
      setMixedTypes([]);
      onChange("mixed_purpose_types", []);
    }
  };

  // Handle mixed purpose type toggle
  const handleMixedTypeChange = (type: string, checked: boolean | "indeterminate") => {
    const isChecked = checked === true;
    let updatedTypes = [...mixedTypes];
    
    if (isChecked && !updatedTypes.includes(type)) {
      updatedTypes.push(type);
    } else if (!isChecked && updatedTypes.includes(type)) {
      updatedTypes = updatedTypes.filter(t => t !== type);
    }
    
    setMixedTypes(updatedTypes);
    onChange("mixed_purpose_types", updatedTypes);
    console.log("Mixed purpose types changed to:", updatedTypes);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Property Usage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="residentialOnly"
            checked={residentialOnly}
            disabled={isReadOnly}
            onCheckedChange={handleResidentialChange}
          />
          <Label htmlFor="residentialOnly">Residential purpose only</Label>
        </div>

        {!residentialOnly && (
          <div className="pl-6 space-y-2">
            <p className="text-sm text-muted-foreground mb-2">
              If mixed purpose, select applicable types:
            </p>
            {mixedPurposeOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`mixed-${option.id}`}
                  checked={mixedTypes.includes(option.id)}
                  disabled={isReadOnly}
                  onCheckedChange={(checked) => handleMixedTypeChange(option.id, checked)}
                />
                <Label htmlFor={`mixed-${option.id}`}>{option.label}</Label>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
