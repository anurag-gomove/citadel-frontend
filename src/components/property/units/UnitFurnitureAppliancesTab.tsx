import React, { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface UnitFurnitureAppliancesTabProps {
  formState: any;
  onChange: (field: string, value: any) => void;
  selectedUnit?: any;
}

export function UnitFurnitureAppliancesTab({
  formState,
  onChange,
  selectedUnit,
}: UnitFurnitureAppliancesTabProps) {
  // Owner options for appliances
  const ownerOptions = [
    { value: "landlord", label: "Landlord" },
    { value: "tenant", label: "Tenant" }
  ];

  // Local state for appliance checkboxes to ensure UI updates immediately
  const [hasRefrigerator, setHasRefrigerator] = useState<boolean>(formState.has_refrigerator || false);
  const [hasStove, setHasStove] = useState<boolean>(formState.has_stove || false);
  const [hasDishwasher, setHasDishwasher] = useState<boolean>(formState.has_dishwasher || false);
  const [hasMicrowave, setHasMicrowave] = useState<boolean>(formState.has_microwave || false);
  const [hasWasher, setHasWasher] = useState<boolean>(formState.has_washer || false);
  const [hasDryer, setHasDryer] = useState<boolean>(formState.has_dryer || false);
  
  // Local state for appliance owners
  const [refrigeratorOwner, setRefrigeratorOwner] = useState<string>(formState.refrigerator_owner || "landlord");
  const [stoveOwner, setStoveOwner] = useState<string>(formState.stove_owner || "landlord");
  const [dishwasherOwner, setDishwasherOwner] = useState<string>(formState.dishwasher_owner || "landlord");
  const [microwaveOwner, setMicrowaveOwner] = useState<string>(formState.microwave_owner || "landlord");
  const [washerOwner, setWasherOwner] = useState<string>(formState.washer_owner || "landlord");
  const [dryerOwner, setDryerOwner] = useState<string>(formState.dryer_owner || "landlord");

  // Update local state when formState changes
  useEffect(() => {
    setHasRefrigerator(formState.has_refrigerator || false);
    setHasStove(formState.has_stove || false);
    setHasDishwasher(formState.has_dishwasher || false);
    setHasMicrowave(formState.has_microwave || false);
    setHasWasher(formState.has_washer || false);
    setHasDryer(formState.has_dryer || false);
    
    setRefrigeratorOwner(formState.refrigerator_owner || "landlord");
    setStoveOwner(formState.stove_owner || "landlord");
    setDishwasherOwner(formState.dishwasher_owner || "landlord");
    setMicrowaveOwner(formState.microwave_owner || "landlord");
    setWasherOwner(formState.washer_owner || "landlord");
    setDryerOwner(formState.dryer_owner || "landlord");
  }, [formState]);

  // Handle checkbox changes with local state updates
  const handleApplianceToggle = (field: string, checked: boolean | "indeterminate", setLocalState: React.Dispatch<React.SetStateAction<boolean>>) => {
    const isChecked = checked === true;
    setLocalState(isChecked);
    onChange(field, isChecked);
    console.log(`${field} changed to:`, isChecked);
  };

  // Handle owner selection changes with local state updates
  const handleOwnerChange = (field: string, value: string, setLocalState: React.Dispatch<React.SetStateAction<string>>) => {
    setLocalState(value);
    onChange(field, value);
    console.log(`${field} owner changed to:`, value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Appliances</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {/* Refrigerator */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasRefrigerator"
                  checked={hasRefrigerator}
                  onCheckedChange={(checked) => 
                    handleApplianceToggle("has_refrigerator", checked, setHasRefrigerator)
                  }
                />
                <Label htmlFor="hasRefrigerator">Refrigerator</Label>
              </div>
              {hasRefrigerator && (
                <div className="pl-6">
                  <Label htmlFor="refrigeratorOwner" className="text-sm">Owner</Label>
                  <Select
                    value={refrigeratorOwner}
                    onValueChange={(value) => 
                      handleOwnerChange("refrigerator_owner", value, setRefrigeratorOwner)
                    }
                  >
                    <SelectTrigger id="refrigeratorOwner" className="w-full">
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {ownerOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Stove */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasStove"
                  checked={hasStove}
                  onCheckedChange={(checked) => 
                    handleApplianceToggle("has_stove", checked, setHasStove)
                  }
                />
                <Label htmlFor="hasStove">Stove</Label>
              </div>
              {hasStove && (
                <div className="pl-6">
                  <Label htmlFor="stoveOwner" className="text-sm">Owner</Label>
                  <Select
                    value={stoveOwner}
                    onValueChange={(value) => 
                      handleOwnerChange("stove_owner", value, setStoveOwner)
                    }
                  >
                    <SelectTrigger id="stoveOwner" className="w-full">
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {ownerOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Dishwasher */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasDishwasher"
                  checked={hasDishwasher}
                  onCheckedChange={(checked) => 
                    handleApplianceToggle("has_dishwasher", checked, setHasDishwasher)
                  }
                />
                <Label htmlFor="hasDishwasher">Dishwasher</Label>
              </div>
              {hasDishwasher && (
                <div className="pl-6">
                  <Label htmlFor="dishwasherOwner" className="text-sm">Owner</Label>
                  <Select
                    value={dishwasherOwner}
                    onValueChange={(value) => 
                      handleOwnerChange("dishwasher_owner", value, setDishwasherOwner)
                    }
                  >
                    <SelectTrigger id="dishwasherOwner" className="w-full">
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {ownerOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Microwave */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasMicrowave"
                  checked={hasMicrowave}
                  onCheckedChange={(checked) => 
                    handleApplianceToggle("has_microwave", checked, setHasMicrowave)
                  }
                />
                <Label htmlFor="hasMicrowave">Microwave</Label>
              </div>
              {hasMicrowave && (
                <div className="pl-6">
                  <Label htmlFor="microwaveOwner" className="text-sm">Owner</Label>
                  <Select
                    value={microwaveOwner}
                    onValueChange={(value) => 
                      handleOwnerChange("microwave_owner", value, setMicrowaveOwner)
                    }
                  >
                    <SelectTrigger id="microwaveOwner" className="w-full">
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {ownerOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Washer */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasWasher"
                  checked={hasWasher}
                  onCheckedChange={(checked) => 
                    handleApplianceToggle("has_washer", checked, setHasWasher)
                  }
                />
                <Label htmlFor="hasWasher">Washer</Label>
              </div>
              {hasWasher && (
                <div className="pl-6">
                  <Label htmlFor="washerOwner" className="text-sm">Owner</Label>
                  <Select
                    value={washerOwner}
                    onValueChange={(value) => 
                      handleOwnerChange("washer_owner", value, setWasherOwner)
                    }
                  >
                    <SelectTrigger id="washerOwner" className="w-full">
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {ownerOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Dryer */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasDryer"
                  checked={hasDryer}
                  onCheckedChange={(checked) => 
                    handleApplianceToggle("has_dryer", checked, setHasDryer)
                  }
                />
                <Label htmlFor="hasDryer">Dryer</Label>
              </div>
              {hasDryer && (
                <div className="pl-6">
                  <Label htmlFor="dryerOwner" className="text-sm">Owner</Label>
                  <Select
                    value={dryerOwner}
                    onValueChange={(value) => 
                      handleOwnerChange("dryer_owner", value, setDryerOwner)
                    }
                  >
                    <SelectTrigger id="dryerOwner" className="w-full">
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {ownerOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Furniture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label htmlFor="furnitureList" className="text-base">Furniture List</Label>
            <Textarea
              id="furnitureList"
              value={formState.furniture_list || ""}
              onChange={(e) => onChange("furniture_list", e.target.value)}
              placeholder="Enter a list of furniture included with the unit (e.g., sofa, coffee table, bed, etc.)"
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Fixtures & Additional Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label htmlFor="fixturesInventory" className="text-base">Fixtures Inventory</Label>
            <Textarea
              id="fixturesInventory"
              value={formState.fixtures_inventory || ""}
              onChange={(e) => onChange("fixtures_inventory", e.target.value)}
              placeholder="Enter a list of fixtures and other permanent items (e.g., ceiling fans, light fixtures, shelving, etc.)"
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
