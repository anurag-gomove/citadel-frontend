
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface UnitParkingStorageProps {
  unit: any;
  isReadOnly?: boolean;
}

export function UnitParkingStorage({ unit, isReadOnly = true }: UnitParkingStorageProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Parking and Storage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2 mb-3">
          <Label htmlFor="hasParking" className="min-w-28">Parking:</Label>
          <Badge variant={unit.has_parking === true ? "default" : "outline"}>
            {unit.has_parking === true ? "Yes" : "No"}
          </Badge>
        </div>
        
        {unit.has_parking && (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 pl-6 mb-4">
            {unit.parking_number && (
              <div>
                <Label className="mb-2 block">Number</Label>
                <div className="h-10 px-3 py-2 border rounded-md bg-muted text-muted-foreground">
                  {unit.parking_number}
                </div>
              </div>
            )}
            
            {unit.parking_location && (
              <div>
                <Label className="mb-2 block">Location</Label>
                <div className="h-10 px-3 py-2 border rounded-md bg-muted text-muted-foreground">
                  {unit.parking_location}
                </div>
              </div>
            )}
            
            {unit.parking_type && (
              <div>
                <Label className="mb-2 block">Type</Label>
                <div className="h-10 px-3 py-2 border rounded-md bg-muted text-muted-foreground">
                  {unit.parking_type}
                </div>
              </div>
            )}
            
            {unit.parking_fee && (
              <div>
                <Label className="mb-2 block">Fee</Label>
                <div className="h-10 px-3 py-2 border rounded-md bg-muted text-muted-foreground">
                  ${unit.parking_fee}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-center space-x-2 mb-3">
          <Label htmlFor="hasStorage" className="min-w-28">Storage:</Label>
          <Badge variant={unit.has_storage === true ? "default" : "outline"}>
            {unit.has_storage === true ? "Yes" : "No"}
          </Badge>
        </div>
        
        {unit.has_storage && (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 pl-6">
            {unit.storage_number && (
              <div>
                <Label className="mb-2 block">Number</Label>
                <div className="h-10 px-3 py-2 border rounded-md bg-muted text-muted-foreground">
                  {unit.storage_number}
                </div>
              </div>
            )}
            
            {unit.storage_location && (
              <div>
                <Label className="mb-2 block">Location</Label>
                <div className="h-10 px-3 py-2 border rounded-md bg-muted text-muted-foreground">
                  {unit.storage_location}
                </div>
              </div>
            )}
            
            {unit.storage_size && (
              <div>
                <Label className="mb-2 block">Size</Label>
                <div className="h-10 px-3 py-2 border rounded-md bg-muted text-muted-foreground">
                  {unit.storage_size}
                </div>
              </div>
            )}
            
            {unit.storage_fee && (
              <div>
                <Label className="mb-2 block">Fee</Label>
                <div className="h-10 px-3 py-2 border rounded-md bg-muted text-muted-foreground">
                  ${unit.storage_fee}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
