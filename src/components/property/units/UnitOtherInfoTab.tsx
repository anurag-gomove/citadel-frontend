import React, { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormInput } from "@/components/FormInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UnitOtherInfoTabProps {
  formState: any;
  onChange: (field: string, value: any) => void;
}

export function UnitOtherInfoTab({ formState, onChange }: UnitOtherInfoTabProps) {
  // Local state for checkboxes to ensure UI updates immediately
  const [services, setServices] = useState({
    heating_included: false,
    electricity_included: false,
    water_included: false,
    internet_included: false,
    hot_water_included: false,
    gas_included: false,
    water_heater_rental_included: false,
    water_tax_included: false,
  });

  const [snowRemoval, setSnowRemoval] = useState({
    snow_removal_parking: "landlord",
    snow_removal_balcony: "tenant",
    snow_removal_entrance: "landlord",
    snow_removal_walkway: "landlord",
    snow_removal_stairs: "landlord",
  });

  // Update local state when formState changes
  useEffect(() => {
    setServices({
      heating_included: formState.heating_included || false,
      electricity_included: formState.electricity_included || false,
      water_included: formState.water_included || false,
      internet_included: formState.internet_included || false,
      hot_water_included: formState.hot_water_included || false,
      gas_included: formState.gas_included || false,
      water_heater_rental_included: formState.water_heater_rental_included || false,
      water_tax_included: formState.water_tax_included || false,
    });

    setSnowRemoval({
      snow_removal_parking: formState.snow_removal_parking || "landlord",
      snow_removal_balcony: formState.snow_removal_balcony || "tenant",
      snow_removal_entrance: formState.snow_removal_entrance || "landlord",
      snow_removal_walkway: formState.snow_removal_walkway || "landlord",
      snow_removal_stairs: formState.snow_removal_stairs || "landlord",
    });
  }, [formState]);

  // Handle checkbox change with immediate UI update
  const handleServiceChange = (field: string, checked: boolean | "indeterminate") => {
    const isChecked = checked === true;
    setServices(prev => ({
      ...prev,
      [field]: isChecked
    }));
    onChange(field, isChecked);
    console.log(`Service ${field} changed to:`, isChecked);
  };

  // Handle snow removal responsibility change
  const handleSnowRemovalChange = (field: string, value: string) => {
    setSnowRemoval(prev => ({
      ...prev,
      [field]: value
    }));
    onChange(field, value);
    console.log(`Snow removal ${field} changed to:`, value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Services Included</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="heatingIncluded"
                checked={services.heating_included}
                onCheckedChange={(checked) => handleServiceChange("heating_included", checked)}
              />
              <Label htmlFor="heatingIncluded">Heating</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="electricityIncluded"
                checked={services.electricity_included}
                onCheckedChange={(checked) => handleServiceChange("electricity_included", checked)}
              />
              <Label htmlFor="electricityIncluded">Electricity</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="waterIncluded"
                checked={services.water_included}
                onCheckedChange={(checked) => handleServiceChange("water_included", checked)}
              />
              <Label htmlFor="waterIncluded">Water</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="internetIncluded"
                checked={services.internet_included}
                onCheckedChange={(checked) => handleServiceChange("internet_included", checked)}
              />
              <Label htmlFor="internetIncluded">Internet</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hotWaterIncluded"
                checked={services.hot_water_included}
                onCheckedChange={(checked) => handleServiceChange("hot_water_included", checked)}
              />
              <Label htmlFor="hotWaterIncluded">Hot Water</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="gasIncluded"
                checked={services.gas_included}
                onCheckedChange={(checked) => handleServiceChange("gas_included", checked)}
              />
              <Label htmlFor="gasIncluded">Gas</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="waterHeaterRentalIncluded"
                checked={services.water_heater_rental_included}
                onCheckedChange={(checked) => handleServiceChange("water_heater_rental_included", checked)}
              />
              <Label htmlFor="waterHeaterRentalIncluded">Water Heater Rental</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="waterTaxIncluded"
                checked={services.water_tax_included}
                onCheckedChange={(checked) => handleServiceChange("water_tax_included", checked)}
              />
              <Label htmlFor="waterTaxIncluded">Water Tax</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Snow Removal Responsibilities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="snowRemovalParking" className="mb-2 block">Parking Area</Label>
              <Select 
                value={snowRemoval.snow_removal_parking}
                onValueChange={(value) => handleSnowRemovalChange("snow_removal_parking", value)}
              >
                <SelectTrigger id="snowRemovalParking">
                  <SelectValue placeholder="Select responsible party" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="landlord">Landlord</SelectItem>
                  <SelectItem value="tenant">Tenant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="snowRemovalBalcony" className="mb-2 block">Balcony</Label>
              <Select 
                value={snowRemoval.snow_removal_balcony}
                onValueChange={(value) => handleSnowRemovalChange("snow_removal_balcony", value)}
              >
                <SelectTrigger id="snowRemovalBalcony">
                  <SelectValue placeholder="Select responsible party" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="landlord">Landlord</SelectItem>
                  <SelectItem value="tenant">Tenant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="snowRemovalEntrance" className="mb-2 block">Entrance</Label>
              <Select 
                value={snowRemoval.snow_removal_entrance}
                onValueChange={(value) => handleSnowRemovalChange("snow_removal_entrance", value)}
              >
                <SelectTrigger id="snowRemovalEntrance">
                  <SelectValue placeholder="Select responsible party" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="landlord">Landlord</SelectItem>
                  <SelectItem value="tenant">Tenant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="snowRemovalWalkway" className="mb-2 block">Walkway</Label>
              <Select 
                value={snowRemoval.snow_removal_walkway}
                onValueChange={(value) => handleSnowRemovalChange("snow_removal_walkway", value)}
              >
                <SelectTrigger id="snowRemovalWalkway">
                  <SelectValue placeholder="Select responsible party" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="landlord">Landlord</SelectItem>
                  <SelectItem value="tenant">Tenant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="snowRemovalStairs" className="mb-2 block">Stairs</Label>
              <Select 
                value={snowRemoval.snow_removal_stairs}
                onValueChange={(value) => handleSnowRemovalChange("snow_removal_stairs", value)}
              >
                <SelectTrigger id="snowRemovalStairs">
                  <SelectValue placeholder="Select responsible party" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="landlord">Landlord</SelectItem>
                  <SelectItem value="tenant">Tenant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Other Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Heating Type"
              name="heating_type"
              value={formState.heating_type || ""}
              onChange={(e) => onChange("heating_type", e.target.value)}
              placeholder="e.g., Central, Baseboard, Radiator"
            />
            
            <FormInput
              label="Air Conditioning Type"
              name="air_conditioning_type"
              value={formState.air_conditioning_type || ""}
              onChange={(e) => onChange("air_conditioning_type", e.target.value)}
              placeholder="e.g., Central, Window, Split"
            />

            <FormInput
              label="Payment Method"
              name="payment_method"
              value={formState.payment_method || ""}
              onChange={(e) => onChange("payment_method", e.target.value)}
              placeholder="e.g., Check, Direct Deposit, Cash"
            />
            
            <FormInput
              label="Other Services"
              name="other_services"
              value={formState.other_services || ""}
              onChange={(e) => onChange("other_services", e.target.value)}
              placeholder="Additional services or amenities"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
