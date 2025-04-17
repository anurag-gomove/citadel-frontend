
import React from "react";
import { Lease } from "@/types/lease";
import { FormInput } from "@/components/FormInput";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format-currency";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SectionGNewTenantNoticeProps {
  formData: Partial<Lease>;
  onChange: (data: Partial<Lease>) => void;
}

export function SectionGNewTenantNotice({ formData, onChange }: SectionGNewTenantNoticeProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle empty values and conversion to number
    let parsedValue: number | undefined;
    
    if (value === "" || value === ".") {
      parsedValue = undefined;
    } else {
      // Only parse if it's a valid number
      const numberValue = parseFloat(value);
      parsedValue = isNaN(numberValue) ? undefined : numberValue;
    }
    
    onChange({ [name]: parsedValue });
  };

  const handleSamePropertyServicesChange = (value: string) => {
    onChange({ samePropertyServices: value === "yes" });
  };

  const handleFrequencyChange = (value: string) => {
    onChange({ previousRentFrequency: value as 'weekly' | 'monthly' | 'other' });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Notice to the new tenant or subtenant (art. 1896 et 1950 C.c.Q.)</h2>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Previous Rental Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Mandatory notice from the landlord when concluding the lease or sublease, except when one of the two boxes in section F is checked.
          </p>
          
          <div className="space-y-4">
            <Label className="block mb-2">
              I am notifying you that the lowest rent paid for your dwelling during the twelve months preceding the start of your lease, or the rent set by the Tribunal administratif du logement during that period, was:
            </Label>
            
            <div className="flex flex-wrap items-start gap-2">
              <div className="w-full md:w-auto">
                <div className="flex items-center space-x-2">
                  <div className="flex-grow md:max-w-40">
                    <input
                      type="number"
                      name="previousLowestRent"
                      min="0"
                      step="0.01"
                      value={formData.previousLowestRent !== undefined ? String(formData.previousLowestRent) : ""}
                      onChange={handleNumberInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Select 
                      value={formData.previousRentFrequency || "monthly"} 
                      onValueChange={handleFrequencyChange}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">per week</SelectItem>
                        <SelectItem value="monthly">per month</SelectItem>
                        <SelectItem value="other">other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {formData.previousLowestRent !== undefined && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatCurrency(formData.previousLowestRent)}
                  </p>
                )}
              </div>
            </div>
            
            {formData.previousRentFrequency === "other" && (
              <div className="mt-2">
                <FormInput
                  label="Specify frequency"
                  type="text"
                  name="previousRentFrequencyOther"
                  value={formData.previousRentFrequencyOther || ""}
                  onChange={handleInputChange}
                  className="w-full md:max-w-xs"
                  placeholder="e.g., annually, bi-weekly"
                />
              </div>
            )}
          </div>
          
          <div className="mt-6">
            <Label className="mb-2 block">The rented property, the services offered by the landlord, and the conditions of your lease are the same.</Label>
            <RadioGroup
              value={formData.samePropertyServices ? "yes" : "no"}
              onValueChange={handleSamePropertyServicesChange}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="same-yes" />
                <Label htmlFor="same-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="same-no" />
                <Label htmlFor="same-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          
          {formData.samePropertyServices === false && (
            <div>
              <Label className="mb-2 block">Modifications Made</Label>
              <p className="text-sm text-muted-foreground mb-2">
                (examples: addition of personal services, personal assistance and nursing care, parking, heating)
              </p>
              <Textarea
                name="propertyModifications"
                value={formData.propertyModifications || ""}
                onChange={handleInputChange}
                className="min-h-[100px]"
                placeholder="Describe the modifications made to the property or services since the previous tenant"
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t pt-6">
          <div className="w-full">
            <p className="text-sm font-medium mb-4">
              I acknowledge that I have read and understood the information provided above regarding the previous rental terms.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="mb-2 block text-sm font-medium">Tenant Signature</Label>
                <div className="h-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-sm border border-gray-300">
                  Signature will be captured electronically
                </div>
              </div>
              <div>
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
        </CardFooter>
      </Card>
    </div>
  );
}
