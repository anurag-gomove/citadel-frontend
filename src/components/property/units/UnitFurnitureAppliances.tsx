
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface UnitFurnitureAppliancesProps {
  unit: any;
  isReadOnly?: boolean;
}

export function UnitFurnitureAppliances({ unit, isReadOnly = true }: UnitFurnitureAppliancesProps) {
  const hasFurniture = !!unit.furniture_list && unit.furniture_list.trim() !== '';
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Furniture and Appliances</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2 mb-1">
          <Checkbox 
            id="furnitureIncluded" 
            checked={hasFurniture} 
            disabled={isReadOnly} 
          />
          <Label htmlFor="furnitureIncluded">Furniture included in rent</Label>
        </div>
        
        {hasFurniture && (
          <div className="pl-6 pt-2 border-t">
            <Label className="text-sm font-medium mb-2">Furniture List</Label>
            <div className="min-h-[60px] p-3 border rounded-md bg-muted text-muted-foreground">
              {unit.furniture_list}
            </div>
          </div>
        )}
        
        <div className="pt-3 border-t">
          <h4 className="text-sm font-medium mb-3">Appliances</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-2 gap-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="appliance-stove" 
                checked={unit.has_stove || false} 
                disabled={isReadOnly} 
              />
              <Label htmlFor="appliance-stove" className="text-xs sm:text-sm">
                Stove {unit.stove_owner ? `(${unit.stove_owner})` : ''}
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="appliance-microwave" 
                checked={unit.has_microwave || false} 
                disabled={isReadOnly} 
              />
              <Label htmlFor="appliance-microwave" className="text-xs sm:text-sm">
                Microwave {unit.microwave_owner ? `(${unit.microwave_owner})` : ''}
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="appliance-dishwasher" 
                checked={unit.has_dishwasher || false} 
                disabled={isReadOnly} 
              />
              <Label htmlFor="appliance-dishwasher" className="text-xs sm:text-sm">
                Dishwasher {unit.dishwasher_owner ? `(${unit.dishwasher_owner})` : ''}
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="appliance-refrigerator" 
                checked={unit.has_refrigerator || false} 
                disabled={isReadOnly} 
              />
              <Label htmlFor="appliance-refrigerator" className="text-xs sm:text-sm">
                Refrigerator {unit.refrigerator_owner ? `(${unit.refrigerator_owner})` : ''}
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="appliance-washer" 
                checked={unit.has_washer || false} 
                disabled={isReadOnly} 
              />
              <Label htmlFor="appliance-washer" className="text-xs sm:text-sm">
                Washer {unit.washer_owner ? `(${unit.washer_owner})` : ''}
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="appliance-dryer" 
                checked={unit.has_dryer || false} 
                disabled={isReadOnly} 
              />
              <Label htmlFor="appliance-dryer" className="text-xs sm:text-sm">
                Dryer {unit.dryer_owner ? `(${unit.dryer_owner})` : ''}
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
