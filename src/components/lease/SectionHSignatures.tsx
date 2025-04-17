import React from "react";
import { Lease, OtherSignatory } from "@/types/lease";
import { Tenant } from "@/types/database";
import { FormInput } from "@/components/FormInput";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Check } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface SectionHSignaturesProps {
  formData: Partial<Lease>;
  tenant: Tenant;
  onChange: (data: Partial<Lease>) => void;
}

export function SectionHSignatures({ formData, tenant, onChange }: SectionHSignaturesProps) {
  const handleJointLiabilityChange = (value: string) => {
    onChange({ jointTenantLiability: value === "yes" });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Signatures</h2>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Landlord and Tenant Signatures</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First row of signatures */}
            <div>
              <Label className="mb-2 block text-sm font-medium">Landlord's signature (or that of their agent)</Label>
              <div className="h-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-sm border border-gray-300">
                Signature will be captured electronically
              </div>
              <div className="mt-2">
                <Label className="mb-2 block text-sm font-medium">Date</Label>
                <div className="h-10 bg-gray-100 rounded-md flex items-center px-3 text-gray-500 text-sm border border-gray-300">
                  mm/dd/yyyy
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Date will be recorded when landlord signs electronically
                </p>
              </div>
            </div>
            
            <div>
              <Label className="mb-2 block text-sm font-medium">Tenant's signature (or that of their agent)</Label>
              <div className="h-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-sm border border-gray-300">
                Signature will be captured electronically
              </div>
              <div className="mt-2">
                <Label className="mb-2 block text-sm font-medium">Date</Label>
                <div className="h-10 bg-gray-100 rounded-md flex items-center px-3 text-gray-500 text-sm border border-gray-300">
                  mm/dd/yyyy
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Date will be recorded when tenant signs electronically
                </p>
              </div>
            </div>
            
            {/* Second row of signatures */}
            <div className="mt-4">
              <Label className="mb-2 block text-sm font-medium">Landlord's signature (or that of their agent)</Label>
              <div className="h-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-sm border border-gray-300">
                Signature will be captured electronically
              </div>
              <div className="mt-2">
                <Label className="mb-2 block text-sm font-medium">Date</Label>
                <div className="h-10 bg-gray-100 rounded-md flex items-center px-3 text-gray-500 text-sm border border-gray-300">
                  mm/dd/yyyy
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Date will be recorded when landlord signs electronically
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <Label className="mb-2 block text-sm font-medium">Tenant's signature (or that of their agent)</Label>
              <div className="h-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-sm border border-gray-300">
                Signature will be captured electronically
              </div>
              <div className="mt-2">
                <Label className="mb-2 block text-sm font-medium">Date</Label>
                <div className="h-10 bg-gray-100 rounded-md flex items-center px-3 text-gray-500 text-sm border border-gray-300">
                  mm/dd/yyyy
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Date will be recorded when tenant signs electronically
                </p>
              </div>
            </div>
          </div>
          
          {/* Tenant initials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-border">
            <div>
              <Label className="mb-2 block text-sm font-medium">Tenant's initials</Label>
              <div className="h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-sm border border-gray-300">
                Initials will be captured electronically
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Initials will be recorded when tenant signs electronically
              </p>
            </div>
            
            <div>
              <Label className="mb-2 block text-sm font-medium">Tenant's initials</Label>
              <div className="h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-sm border border-gray-300">
                Initials will be captured electronically
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Initials will be recorded when tenant signs electronically
              </p>
            </div>
          </div>
          
          {/* Joint tenant liability section */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex flex-col space-y-3">
              <Label htmlFor="jointTenantLiability" className="text-base font-medium">
                The tenants are jointly and severally liable (mentions 11 and 12).
              </Label>
              <RadioGroup 
                value={formData.jointTenantLiability ? "yes" : "no"}
                onValueChange={handleJointLiabilityChange}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="jointLiability-yes" />
                  <Label htmlFor="jointLiability-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="jointLiability-no" />
                  <Label htmlFor="jointLiability-no">No</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Other Signatories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Any other person who signs the lease must clearly indicate in what capacity they are doing so (examples: other landlord, other tenant, guarantor). (Mention 12)
          </p>
          
          {/* First other signatory - read only */}
          <div className="border rounded-md p-4 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block text-sm font-medium">Name</Label>
                <div className="h-10 bg-gray-100 rounded-md flex items-center px-3 text-gray-500 text-sm border border-gray-300">
                  Will be captured electronically
                </div>
              </div>
              
              <div>
                <Label className="mb-2 block text-sm font-medium">Signature</Label>
                <div className="h-10 bg-gray-100 rounded-md flex items-center px-3 text-gray-500 text-sm border border-gray-300">
                  Will be captured electronically
                </div>
              </div>
              
              <div>
                <Label className="mb-2 block text-sm font-medium">Quality</Label>
                <div className="h-10 bg-gray-100 rounded-md flex items-center px-3 text-gray-500 text-sm border border-gray-300">
                  Will be captured electronically
                </div>
              </div>
              
              <div>
                <Label className="mb-2 block text-sm font-medium">Date</Label>
                <div className="h-10 bg-gray-100 rounded-md flex items-center px-3 text-gray-500 text-sm border border-gray-300">
                  mm/dd/yyyy
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Date will be recorded when signed electronically
                </p>
              </div>
              
              <div className="md:col-span-2">
                <Label className="mb-2 block text-sm font-medium">Address of signatory</Label>
                <div className="h-10 bg-gray-100 rounded-md flex items-center px-3 text-gray-500 text-sm border border-gray-300">
                  Will be captured electronically
                </div>
              </div>
            </div>
          </div>
          
          {/* Second other signatory - read only */}
          <div className="border rounded-md p-4 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block text-sm font-medium">Name</Label>
                <div className="h-10 bg-gray-100 rounded-md flex items-center px-3 text-gray-500 text-sm border border-gray-300">
                  Will be captured electronically
                </div>
              </div>
              
              <div>
                <Label className="mb-2 block text-sm font-medium">Signature</Label>
                <div className="h-10 bg-gray-100 rounded-md flex items-center px-3 text-gray-500 text-sm border border-gray-300">
                  Will be captured electronically
                </div>
              </div>
              
              <div>
                <Label className="mb-2 block text-sm font-medium">Quality</Label>
                <div className="h-10 bg-gray-100 rounded-md flex items-center px-3 text-gray-500 text-sm border border-gray-300">
                  Will be captured electronically
                </div>
              </div>
              
              <div>
                <Label className="mb-2 block text-sm font-medium">Date</Label>
                <div className="h-10 bg-gray-100 rounded-md flex items-center px-3 text-gray-500 text-sm border border-gray-300">
                  mm/dd/yyyy
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Date will be recorded when signed electronically
                </p>
              </div>
              
              <div className="md:col-span-2">
                <Label className="mb-2 block text-sm font-medium">Address of signatory</Label>
                <div className="h-10 bg-gray-100 rounded-md flex items-center px-3 text-gray-500 text-sm border border-gray-300">
                  Will be captured electronically
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground text-center mt-4">
            These fields will be recorded when signatories sign electronically
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
