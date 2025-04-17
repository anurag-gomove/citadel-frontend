
import React from "react";
import { FormInput } from "@/components/FormInput";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UnitResidentialPurpose } from "./UnitResidentialPurpose";

interface UnitBasicInfoTabProps {
  formState: any;
  onChange: (field: string, value: any) => void;
  selectedUnit?: any; // Make selectedUnit optional
}

export function UnitBasicInfoTab({ formState, onChange, selectedUnit }: UnitBasicInfoTabProps) {
  // Use the current form state to pass to UnitResidentialPurpose
  const unitWithCurrentValues = {
    ...selectedUnit || {},
    ...formState,
    residential_purpose_only: formState.residential_purpose_only,
    mixed_purpose_types: formState.mixed_purpose_types
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Unit Number"
              name="unit_number"
              value={formState.unit_number || ""}
              onChange={(e) => onChange("unit_number", e.target.value)}
              required
            />
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formState.status || "vacant"}
                onValueChange={(value) => onChange("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacant">Vacant</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <FormInput
              label="Floor Number"
              name="floor_number"
              type="number"
              value={formState.floor_number || ""}
              onChange={(e) => onChange("floor_number", e.target.value)}
            />
            <FormInput
              label="Square Feet"
              name="square_feet"
              type="number"
              value={formState.square_feet || ""}
              onChange={(e) => onChange("square_feet", e.target.value)}
            />
            <div>
              <Label htmlFor="unit_type">Unit Type</Label>
              <Select
                value={formState.unit_type || ""}
                onValueChange={(value) => onChange("unit_type", value)}
              >
                <SelectTrigger id="unit_type">
                  <SelectValue placeholder="Select unit type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="duplex">Duplex</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                  <SelectItem value="loft">Loft</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <FormInput
              label="Bedrooms"
              name="bedrooms"
              type="number"
              value={formState.bedrooms || ""}
              onChange={(e) => onChange("bedrooms", e.target.value)}
            />
            <FormInput
              label="Bathrooms"
              name="bathrooms"
              type="number"
              value={formState.bathrooms || ""}
              onChange={(e) => onChange("bathrooms", e.target.value)}
            />
            <FormInput
              label="Other Rooms"
              name="other_rooms"
              value={formState.other_rooms || ""}
              onChange={(e) => onChange("other_rooms", e.target.value)}
              placeholder="e.g., den, office"
            />
          </div>

          <div className="mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="balcony"
                checked={formState.has_balcony || false}
                onCheckedChange={(checked) => onChange("has_balcony", checked === true)}
              />
              <Label htmlFor="balcony">Has Balcony</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Residential Purpose Section */}
      <UnitResidentialPurpose 
        unit={unitWithCurrentValues}
        isReadOnly={false}
        onChange={onChange}
      />
    </div>
  );
}
