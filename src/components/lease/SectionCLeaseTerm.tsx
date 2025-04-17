
import React from "react";
import { Lease, LeaseType, DurationUnit } from "@/types/lease";
import { FormInput } from "@/components/FormInput";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface SectionCLeaseTermProps {
  formData: Partial<Lease>;
  onChange: (data: Partial<Lease>) => void;
}

export function SectionCLeaseTerm({
  formData,
  onChange
}: SectionCLeaseTermProps) {
  const handleLeaseTypeChange = (value: LeaseType) => {
    onChange({
      leaseType: value
    });
  };

  const handleDurationUnitChange = (value: DurationUnit) => {
    onChange({
      durationUnit: value
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value
    } = e.target;
    onChange({
      [name]: value
    });
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value
    } = e.target;
    onChange({
      [name]: parseInt(value) || 0
    });
  };

  const handleStartDateChange = (date?: Date) => {
    if (date) {
      onChange({
        startDate: date.toISOString()
      });
    }
  };

  const handleEndDateChange = (date?: Date) => {
    if (date) {
      onChange({
        endDate: date.toISOString()
      });
    }
  };

  return <div className="space-y-6">
      <h2 className="text-xl font-semibold">Term of Lease (art. 1851 C.c.Q.)</h2>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lease Type</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={formData.leaseType || "fixed"} onValueChange={value => handleLeaseTypeChange(value as LeaseType)} className="space-y-4">
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="fixed" id="fixed" />
              <div className="grid gap-1.5">
                <Label htmlFor="fixed" className="font-medium">
                  Fixed-term lease
                </Label>
                
                {formData.leaseType === "fixed" && <div className="pl-1 mt-2 space-y-4">
                    <p className="text-sm text-muted-foreground">This lease has a duration of:</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FormInput label="Duration" type="number" min="1" name="durationValue" value={formData.durationValue || ""} onChange={handleNumberInputChange} />
                      </div>
                      <div>
                        <Label className="mb-2 block">Duration Unit</Label>
                        <Select value={formData.durationUnit || "months"} onValueChange={value => handleDurationUnitChange(value as DurationUnit)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weeks">Weeks</SelectItem>
                            <SelectItem value="months">Months</SelectItem>
                            <SelectItem value="years">Years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="mb-2 block">Start Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.startDate && "text-muted-foreground")}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.startDate ? format(new Date(formData.startDate), "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={formData.startDate ? new Date(formData.startDate) : undefined} onSelect={handleStartDateChange} initialFocus className="pointer-events-auto" />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div>
                        <Label className="mb-2 block">End Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.endDate && "text-muted-foreground")}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.endDate ? format(new Date(formData.endDate), "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={formData.endDate ? new Date(formData.endDate) : undefined} onSelect={handleEndDateChange} initialFocus className="pointer-events-auto" />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>}
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="indeterminate" id="indeterminate" />
              <div className="grid gap-1.5">
                <Label htmlFor="indeterminate" className="font-medium">
                  Indeterminate lease
                </Label>
                
                {formData.leaseType === "indeterminate" && <div className="pl-1 mt-2">
                    <p className="text-sm text-muted-foreground mb-3">This lease is for an indefinite term, beginning on:</p>
                    <Label className="mb-2 block">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.startDate && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.startDate ? format(new Date(formData.startDate), "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={formData.startDate ? new Date(formData.startDate) : undefined} onSelect={handleStartDateChange} initialFocus className="pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </div>}
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
        <p className="text-sm text-muted-foreground">
          <strong>Notice:</strong> Neither the lessor nor the lessee can terminate the lease unilaterally, 
          except for the exceptions provided by law (mentions 5, 9, 23, 24, 45, and 51). 
          However, they can terminate it by mutual consent.
        </p>
      </div>
    </div>;
}
