
import React, { useState, useEffect } from "react";
import { FormInput } from "@/components/FormInput";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UnitParkingStorageTabProps {
  formState: any;
  onChange: (field: string, value: any) => void;
  selectedUnit?: any;
}

export function UnitParkingStorageTab({
  formState,
  onChange,
  selectedUnit,
}: UnitParkingStorageTabProps) {
  // Initialize local state to ensure fields render immediately
  const [showParkingFields, setShowParkingFields] = useState(formState.has_parking);
  const [showStorageFields, setShowStorageFields] = useState(formState.has_storage);
  // Add local state to track button states
  const [hasParking, setHasParking] = useState<boolean>(formState.has_parking === true);
  const [hasStorage, setHasStorage] = useState<boolean>(formState.has_storage === true);

  // Update fields visibility when formState changes
  useEffect(() => {
    setShowParkingFields(formState.has_parking);
    setShowStorageFields(formState.has_storage);
    setHasParking(formState.has_parking === true);
    setHasStorage(formState.has_storage === true);
  }, [formState.has_parking, formState.has_storage]);

  // Handle toggling parking
  const handleParkingToggle = (value: boolean) => {
    onChange("has_parking", value);
    // Update local state immediately
    setShowParkingFields(value);
    setHasParking(value);
  };

  // Handle toggling storage
  const handleStorageToggle = (value: boolean) => {
    onChange("has_storage", value);
    // Update local state immediately
    setShowStorageFields(value);
    setHasStorage(value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Parking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="hasParking" className="mb-2 block">Has Parking</Label>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant={hasParking === true ? "default" : "outline"}
                onClick={() => handleParkingToggle(true)}
              >
                Yes
              </Button>
              <Button
                type="button"
                variant={hasParking === false ? "default" : "outline"}
                onClick={() => handleParkingToggle(false)}
              >
                No
              </Button>
            </div>
          </div>

          {showParkingFields && (
            <div className="pl-6 grid gap-4 grid-cols-1 md:grid-cols-2">
              <FormInput
                label="Parking Number"
                name="parking_number"
                value={formState.parking_number || ""}
                onChange={(e) => onChange("parking_number", e.target.value)}
                placeholder="e.g., P-12"
              />

              <div>
                <Label htmlFor="parkingType" className="mb-2 block">Parking Type</Label>
                <Select
                  value={formState.parking_type || "indoor"}
                  onValueChange={(value) => onChange("parking_type", value)}
                >
                  <SelectTrigger id="parkingType">
                    <SelectValue placeholder="Select parking type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indoor">Indoor</SelectItem>
                    <SelectItem value="outdoor">Outdoor</SelectItem>
                    <SelectItem value="garage">Garage</SelectItem>
                    <SelectItem value="driveway">Driveway</SelectItem>
                    <SelectItem value="street">Street</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <FormInput
                label="Parking Location"
                name="parking_location"
                value={formState.parking_location || ""}
                onChange={(e) => onChange("parking_location", e.target.value)}
                placeholder="e.g., Basement level, North lot"
              />

              <FormInput
                label="Parking Fee"
                name="parking_fee"
                value={formState.parking_fee || ""}
                onChange={(e) => onChange("parking_fee", e.target.value)}
                placeholder="e.g., $50/month"
                startIcon="$"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Storage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="hasStorage" className="mb-2 block">Has Storage</Label>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant={hasStorage === true ? "default" : "outline"}
                onClick={() => handleStorageToggle(true)}
              >
                Yes
              </Button>
              <Button
                type="button"
                variant={hasStorage === false ? "default" : "outline"}
                onClick={() => handleStorageToggle(false)}
              >
                No
              </Button>
            </div>
          </div>

          {showStorageFields && (
            <div className="pl-6 grid gap-4 grid-cols-1 md:grid-cols-2">
              <FormInput
                label="Storage Number"
                name="storage_number"
                value={formState.storage_number || ""}
                onChange={(e) => onChange("storage_number", e.target.value)}
                placeholder="e.g., S-15"
              />

              <FormInput
                label="Storage Location"
                name="storage_location"
                value={formState.storage_location || ""}
                onChange={(e) => onChange("storage_location", e.target.value)}
                placeholder="e.g., Basement, 3rd floor"
              />

              <FormInput
                label="Storage Size"
                name="storage_size"
                value={formState.storage_size || ""}
                onChange={(e) => onChange("storage_size", e.target.value)}
                placeholder="e.g., 5'x5', 10'x10'"
              />

              <FormInput
                label="Storage Fee"
                name="storage_fee"
                value={formState.storage_fee || ""}
                onChange={(e) => onChange("storage_fee", e.target.value)}
                placeholder="e.g., $25/month"
                startIcon="$"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
