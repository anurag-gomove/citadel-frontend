
import React from "react";
import { FormInput } from "@/components/FormInput";
import type { PropertyFormData } from "./types";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface PropertyAddressFormProps {
  formData: PropertyFormData;
  onFieldChange: (field: keyof PropertyFormData, value: string) => void;
  errors?: { [key: string]: string };
  disabled?: boolean;
}

export function PropertyAddressForm({ formData, onFieldChange, errors = {}, disabled = false }: PropertyAddressFormProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Property Address</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Street No."
          name="street_number"
          type="text"
          value={formData.street_number}
          onChange={(e) => onFieldChange("street_number", e.target.value)}
          error={errors.street_number}
          required
          disabled={disabled}
        />
        
        <FormInput
          label="Street Name"
          name="street_name"
          type="text"
          value={formData.street_name}
          onChange={(e) => onFieldChange("street_name", e.target.value)}
          error={errors.street_name}
          required
          disabled={disabled}
        />

        <FormInput
          label="Municipality"
          name="municipality"
          type="text"
          value={formData.municipality}
          onChange={(e) => onFieldChange("municipality", e.target.value)}
          disabled={disabled}
        />

        <div className="space-y-2">
          <Label htmlFor="province">Province</Label>
          <Select
            disabled={disabled}
            value={formData.province || "Quebec"}
            onValueChange={(value) => onFieldChange("province", value)}
          >
            <SelectTrigger id="province" className="w-full">
              <SelectValue placeholder="Select a province" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-background">
              <SelectItem value="Quebec">Quebec</SelectItem>
              <SelectItem value="Ontario" disabled className="flex items-center justify-between gap-2">
                Ontario
                <Badge variant="outline" className="ml-2 text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                  Coming Soon
                </Badge>
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.province && (
            <p className="text-sm text-red-500 mt-1">{errors.province}</p>
          )}
        </div>

        <FormInput
          label="Postal Code"
          name="postal_code"
          type="text"
          value={formData.postal_code}
          onChange={(e) => onFieldChange("postal_code", e.target.value)}
          disabled={disabled}
        />

        <FormInput
          label="Country"
          name="country"
          type="text"
          value={formData.country}
          onChange={(e) => onFieldChange("country", e.target.value)}
          disabled={disabled}
        />

        <FormInput
          label="Latitude"
          name="latitude"
          type="text"
          value={formData.latitude || ''}
          placeholder="e.g. 45.5017"
          onChange={(e) => {
            // Allow only numbers, decimal point, and minus sign
            const value = e.target.value.replace(/[^0-9.-]/g, '');
            onFieldChange("latitude", value);
          }}
          disabled={disabled}
        />

        <FormInput
          label="Longitude"
          name="longitude"
          type="text"
          value={formData.longitude || ''}
          placeholder="e.g. -73.5673"
          onChange={(e) => {
            // Allow only numbers, decimal point, and minus sign
            const value = e.target.value.replace(/[^0-9.-]/g, '');
            onFieldChange("longitude", value);
          }}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
