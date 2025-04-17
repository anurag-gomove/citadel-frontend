
import React from "react";
import { Lease } from "@/types/lease";
import { FormInput } from "@/components/FormInput";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface SectionFRentRestrictionsProps {
  formData: Partial<Lease>;
  onChange: (data: Partial<Lease>) => void;
}

export function SectionFRentRestrictions({ formData, onChange }: SectionFRentRestrictionsProps) {
  const handleCheckboxChange = (name: string, checked: boolean) => {
    if (checked) {
      if (name === "propertyBuiltLast5Years") {
        onChange({ 
          propertyBuiltLast5Years: true,
          propertyConvertedLast5Years: false 
        });
      } else if (name === "propertyConvertedLast5Years") {
        onChange({ 
          propertyBuiltLast5Years: false,
          propertyConvertedLast5Years: true 
        });
      }
    } else {
      onChange({ [name]: checked });
    }
  };

  const handlePropertyBuiltDateChange = (date?: Date) => {
    if (date) {
      onChange({ propertyBuiltDate: date.toISOString() });
    }
  };

  const handlePropertyConvertedDateChange = (date?: Date) => {
    if (date) {
      onChange({ propertyConvertedDate: date.toISOString() });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Restrictions on the right to set rent and modify the lease (art. 1955 C.c.Q.)</h2>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Property Age and Conversion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            The landlord and the tenant cannot ask the Tribunal administratif du logement to set the rent or to modify another condition of the lease if one of the following situations applies:
          </p>
          
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="propertyBuiltLast5Years" 
              checked={formData.propertyBuiltLast5Years || false}
              onCheckedChange={(checked) => 
                handleCheckboxChange("propertyBuiltLast5Years", checked === true)
              }
            />
            <div>
              <Label htmlFor="propertyBuiltLast5Years" className="block mb-2">
                Property built within last 5 years
              </Label>
              
              {formData.propertyBuiltLast5Years && (
                <div className="ml-1">
                  <Label className="mb-2 block text-sm">The building was ready for occupancy on</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full md:w-auto justify-start text-left font-normal",
                          !formData.propertyBuiltDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.propertyBuiltDate ? (
                          format(new Date(formData.propertyBuiltDate), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.propertyBuiltDate ? new Date(formData.propertyBuiltDate) : undefined}
                        onSelect={handlePropertyBuiltDateChange}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="propertyConvertedLast5Years" 
              checked={formData.propertyConvertedLast5Years || false}
              onCheckedChange={(checked) => 
                handleCheckboxChange("propertyConvertedLast5Years", checked === true)
              }
            />
            <div>
              <Label htmlFor="propertyConvertedLast5Years" className="block mb-2">
                The dwelling is located in a building whose residential use results from a change of purpose for five years or less.
              </Label>
              
              {formData.propertyConvertedLast5Years && (
                <div className="ml-1">
                  <Label className="mb-2 block text-sm">The building was ready for occupancy on</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full md:w-auto justify-start text-left font-normal",
                          !formData.propertyConvertedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.propertyConvertedDate ? (
                          format(new Date(formData.propertyConvertedDate), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.propertyConvertedDate ? new Date(formData.propertyConvertedDate) : undefined}
                        onSelect={handlePropertyConvertedDateChange}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mt-4 pt-2 border-t border-border">
            The tribunal may, however, rule on any other application relating to the lease (example: rent reduction).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
