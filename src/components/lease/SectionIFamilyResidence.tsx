
import React from "react";
import { Lease } from "@/types/lease";
import { FormInput } from "@/components/FormInput";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SectionIFamilyResidenceProps {
  formData: Partial<Lease>;
  onChange: (data: Partial<Lease>) => void;
}

export function SectionIFamilyResidence({ formData, onChange }: SectionIFamilyResidenceProps) {
  const handleCheckboxChange = (name: string, checked: boolean) => {
    onChange({ [name]: checked });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Notice of Family Residence (art. 403 et 521.6 C.c.Q.)</h2>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Family Residence Declaration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-md border mb-4">
            <p className="text-sm text-muted-foreground">
              A married or civilly united tenant cannot, without the written consent of their spouse, sublet their dwelling, assign their lease, or terminate it when the landlord has been notified by either spouse that the rented dwelling serves as the family residence.
            </p>
          </div>
          
          <div className="mt-4 mb-2">
            <p className="font-medium">Notice to the landlord</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="familyResidenceDeclaration" 
              checked={formData.familyResidenceDeclaration || false}
              onCheckedChange={(checked) => 
                handleCheckboxChange("familyResidenceDeclaration", checked === true)
              }
            />
            <Label htmlFor="familyResidenceDeclaration">
              I declare that I am married or civilly united to
            </Label>
          </div>
          
          {formData.familyResidenceDeclaration && (
            <div className="ml-6 mt-2 space-y-4">
              <FormInput
                label="Spouse's Name"
                name="spouseName"
                value={formData.spouseName || ""}
                onChange={handleInputChange}
                required={formData.familyResidenceDeclaration}
              />
              
              <div className="mt-4 bg-slate-50 p-4 rounded-md border">
                <p className="text-sm text-muted-foreground">
                  By checking this box, the tenant declares that this dwelling will serve as the family residence.
                  This declaration has important legal implications regarding the rights of both spouses in relation to this property.
                </p>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Label className="mb-2 block text-sm font-medium">Tenant's signature or tenant's spouse's signature</Label>
                <div className="h-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-sm border border-gray-300">
                  Signature will be captured electronically
                </div>
                <div className="mt-2">
                  <Label className="mb-2 block text-sm font-medium">Date</Label>
                  <div className="h-10 bg-gray-100 rounded-md flex items-center px-3 text-gray-500 text-sm border border-gray-300">
                    mm/dd/yyyy
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Date will be recorded when signed electronically
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
