
import React from "react";
import { FormInput } from "@/components/FormInput";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface UnitRentalTabProps {
  formState: any;
  onChange: (field: string, value: any) => void;
  availableTenants: any[];
  isTenantsLoading: boolean;
}

export function UnitRentalTab({ 
  formState, 
  onChange, 
  availableTenants, 
  isTenantsLoading 
}: UnitRentalTabProps) {
  // Helper function to handle all form input changes
  const handleInputChange = (field: string, value: any) => {
    // Call the parent onChange function immediately to update the form state
    onChange(field, value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rent Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <FormInput
              label="Monthly Rent"
              name="monthly_rent"
              type="number"
              value={formState.monthly_rent || ""}
              onChange={(e) => handleInputChange("monthly_rent", e.target.value)}
              placeholder="e.g., 1200"
              startIcon="$"
            />

            <div>
              <Label htmlFor="rentDueDate" className="mb-2 block">Rent Due Date</Label>
              <Select 
                value={formState.rent_due_date?.toString() || "1"} 
                onValueChange={(value) => handleInputChange("rent_due_date", value)}
              >
                <SelectTrigger id="rentDueDate">
                  <SelectValue placeholder="Select rent due date" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(28)].map((_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1}{getOrdinalSuffix(i + 1)} of the month
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="paymentMethod" className="mb-2 block">Payment Method</Label>
            <Select 
              value={formState.payment_method || ""} 
              onValueChange={(value) => handleInputChange("payment_method", value)}
            >
              <SelectTrigger id="paymentMethod">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <FormInput
            label="Additional Fees"
            name="additional_fees"
            value={formState.additional_fees || ""}
            onChange={(e) => handleInputChange("additional_fees", e.target.value)}
            placeholder="e.g., Parking: $50/month, Pet fee: $25/month"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tenant Assignment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="tenantSelect" className="mb-2 block">Assign Tenant</Label>
            <Select 
              value={formState.tenant_id || "none"} 
              onValueChange={(value) => handleInputChange("tenant_id", value === "none" ? null : value)}
              disabled={isTenantsLoading}
            >
              <SelectTrigger id="tenantSelect">
                <SelectValue placeholder="Select a tenant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Vacant)</SelectItem>
                {availableTenants.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.first_name} {tenant.last_name}
                    {tenant.unit_id && 
                      <Badge variant="outline" className="ml-2">Current</Badge>
                    }
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isTenantsLoading && <p className="text-sm text-muted-foreground mt-2">Loading tenants...</p>}
            {!isTenantsLoading && availableTenants.length === 0 && 
              <p className="text-sm text-muted-foreground mt-2">No available tenants for this property</p>
            }
          </div>

          {formState.tenant_id && (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <FormInput
                label="Lease Start Date"
                name="lease_start_date"
                type="date"
                value={formState.lease_start_date || ""}
                onChange={(e) => handleInputChange("lease_start_date", e.target.value)}
              />
              
              <FormInput
                label="Lease End Date"
                name="lease_end_date"
                type="date"
                value={formState.lease_end_date || ""}
                onChange={(e) => handleInputChange("lease_end_date", e.target.value)}
              />
              
              <FormInput
                label="Lease Length"
                name="lease_length"
                value={formState.lease_length || ""}
                onChange={(e) => handleInputChange("lease_length", e.target.value)}
                placeholder="e.g., 12 months"
              />
              
              <FormInput
                label="Move-in Date"
                name="move_in_date"
                type="date"
                value={formState.move_in_date || ""}
                onChange={(e) => handleInputChange("move_in_date", e.target.value)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lease Renewal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormInput
            label="Renewal Terms"
            name="renewal_terms"
            value={formState.renewal_terms || ""}
            onChange={(e) => handleInputChange("renewal_terms", e.target.value)}
            placeholder="e.g., Option to renew with 5% increase"
          />
          
          <FormInput
            label="Previous Tenant Rent"
            name="previous_tenant_rent"
            value={formState.previous_tenant_rent || ""}
            onChange={(e) => handleInputChange("previous_tenant_rent", e.target.value)}
            placeholder="If applicable"
            startIcon="$"
          />
          
          <FormInput
            label="Rent Increase History"
            name="rent_increase_history"
            value={formState.rent_increase_history || ""}
            onChange={(e) => handleInputChange("rent_increase_history", e.target.value)}
            placeholder="e.g., 2022: $1000, 2023: $1050"
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to get ordinal suffix
function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}
