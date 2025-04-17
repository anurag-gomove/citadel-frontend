
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UnitParkingStorage } from "./UnitParkingStorage";
import { UnitFurnitureAppliances } from "./UnitFurnitureAppliances";
import { UnitResidentialPurpose } from "./UnitResidentialPurpose";

interface UnitProfileProps {
  unit: any;
  property?: any;
}

export function UnitProfile({ unit, property }: UnitProfileProps) {
  // Automatically determine status based on whether the unit has a tenant
  const determineUnitStatus = () => {
    if (unit.tenant_id) {
      return "occupied";
    } else if (unit.status === "maintenance") {
      return "maintenance";
    } else {
      return "vacant";
    }
  };

  const getUnitStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "vacant":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            Vacant
          </Badge>
        );
      case "occupied":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Occupied
          </Badge>
        );
      case "maintenance":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Maintenance
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  // Get the automatically determined status
  const currentStatus = determineUnitStatus();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Unit {unit.unit_number} Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Basic Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Status:</span>
                  <span>{getUnitStatusBadge(currentStatus)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Type:</span>
                  <span className="text-sm font-medium">{unit.unit_type || "Not specified"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Floor:</span>
                  <span className="text-sm font-medium">{unit.floor_number || "Not specified"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Size:</span>
                  <span className="text-sm font-medium">{unit.square_feet ? `${unit.square_feet} sq ft` : "Not specified"}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Layout</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Bedrooms:</span>
                  <span className="text-sm font-medium">{unit.bedrooms || "0"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Bathrooms:</span>
                  <span className="text-sm font-medium">{unit.bathrooms || "0"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Other Rooms:</span>
                  <span className="text-sm font-medium">{unit.other_rooms || "None"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Balcony:</span>
                  <span className="text-sm font-medium">{unit.has_balcony ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add the Residential Purpose section */}
      <UnitResidentialPurpose unit={unit} />
      
      {/* Parking and Storage section - second */}
      <UnitParkingStorage unit={unit} />
      
      {/* Furniture and Appliances section - third */}
      <UnitFurnitureAppliances unit={unit} />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rent & Utilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Rent Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Monthly Rent:</span>
                  <span className="text-sm font-medium">{unit.monthly_rent ? `$${unit.monthly_rent}` : "Not set"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Rent Due Date:</span>
                  <span className="text-sm font-medium">{unit.rent_due_date ? `Day ${unit.rent_due_date}` : "Not set"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Payment Method:</span>
                  <span className="text-sm font-medium">{unit.payment_method || "Not specified"}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Included Utilities</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Heating:</span>
                  <span className="text-sm font-medium">{unit.heating_included ? "Included" : "Not included"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Electricity:</span>
                  <span className="text-sm font-medium">{unit.electricity_included ? "Included" : "Not included"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Water:</span>
                  <span className="text-sm font-medium">{unit.water_included ? "Included" : "Not included"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Hot Water:</span>
                  <span className="text-sm font-medium">{unit.hot_water_included ? "Included" : "Not included"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Internet:</span>
                  <span className="text-sm font-medium">{unit.internet_included ? "Included" : "Not included"}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
