
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { UnitProfile } from "./units/UnitProfile";

export default function PropertyUnitDetails({ onBack }: { onBack: () => void }) {
  const { unitId, propertyId } = useParams();

  const { data: unit, isLoading: isUnitLoading } = useQuery({
    queryKey: ["unit", unitId],
    queryFn: async () => {
      if (!unitId) return null;
      
      const { data, error } = await supabase
        .from("units")
        .select("*")
        .eq("id", unitId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!unitId
  });

  const { data: property, isLoading: isPropertyLoading } = useQuery({
    queryKey: ["property", propertyId],
    queryFn: async () => {
      if (!propertyId) return null;
      
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", propertyId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!propertyId
  });

  const { data: tenant, isLoading: isTenantLoading } = useQuery({
    queryKey: ["tenant", unit?.tenant_id],
    queryFn: async () => {
      if (!unit?.tenant_id) return null;
      
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("id", unit.tenant_id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!unit?.tenant_id
  });

  if (isUnitLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-20" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h3 className="text-lg font-medium mb-2">Unit not found</h3>
        <p className="text-muted-foreground mb-4">The requested unit could not be found.</p>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <Button variant="ghost" onClick={onBack} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h2 className="text-2xl font-bold">Unit {unit.unit_number}</h2>
        </div>
        <Button 
          variant="outline" 
          className="gap-1"
          onClick={() => window.location.href = `/properties/${propertyId}/units/${unitId}/edit`}
        >
          <Edit className="h-4 w-4" />
          Edit Unit
        </Button>
      </div>

      <UnitProfile unit={unit} property={property} />

      {tenant && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Tenant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Name:</span>
                    <span className="text-sm font-medium">{tenant.first_name} {tenant.last_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Email:</span>
                    <span className="text-sm font-medium">{tenant.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Phone:</span>
                    <span className="text-sm font-medium">{tenant.phone || "Not provided"}</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Move-in Date:</span>
                    <span className="text-sm font-medium">{tenant.lease_start_date || "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Lease End Date:</span>
                    <span className="text-sm font-medium">{tenant.lease_end_date || "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Status:</span>
                    <span className="text-sm font-medium">{tenant.status}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = `/tenants/${tenant.id}`}
              >
                View Tenant Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
