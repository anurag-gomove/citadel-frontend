import React, { useEffect } from "react";
import { Lease, RentFrequency } from "@/types/lease";
import { FormInput } from "@/components/FormInput";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { CalendarIcon, DollarSign, Signature } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SectionDRentProps {
  formData: Partial<Lease>;
  onChange: (data: Partial<Lease>) => void;
}

export function SectionDRent({
  formData,
  onChange
}: SectionDRentProps) {
  const handleRentFrequencyChange = (value: RentFrequency) => {
    onChange({
      rentFrequency: value
    });
  };
  
  const handleCheckboxChange = (name: string, checked: boolean) => {
    onChange({
      [name]: checked
    });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    const numericValue = parseFloat(value) || 0;
    onChange({
      [name]: numericValue
    });
  };
  
  const handleFirstPaymentDateChange = (date?: Date) => {
    if (date) {
      onChange({
        firstPaymentDate: date.toISOString()
      });
    }
  };

  const handlePostdatedChecksChange = (value: string) => {
    onChange({
      postdatedChecks: value === "yes"
    });
  };

  const handlePaymentDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const numericValue = parseInt(value) || 0;
    
    const maxDay = formData.rentFrequency === "weekly" ? 7 : 31;
    
    const validatedValue = Math.min(Math.max(1, numericValue), maxDay);
    
    onChange({
      paymentDay: validatedValue
    });
  };

  const preventWheelScroll = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
  };

  useEffect(() => {
    const baseRent = formData.baseRent || 0;
    const servicesCost = formData.servicesCost || 0;
    const calculatedTotal = baseRent + servicesCost;
    
    if (formData.totalRent === undefined || formData.totalRent === (formData.baseRent || 0) + (formData.servicesCost || 0) - baseRent - servicesCost) {
      onChange({
        totalRent: calculatedTotal
      });
    }
  }, [formData.baseRent, formData.servicesCost]);
  
  return <div className="space-y-6">
      <h2 className="text-xl font-semibold">Rent (art. 1855, 1903 et 1904 C.c.Q.)</h2>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rent Amount</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="w-40 flex-shrink-0">
                <span className="font-medium">The base rent is</span>
              </div>
              <div className="flex items-center w-48">
                <DollarSign className="h-5 w-5 text-muted-foreground mr-1" />
                <Input 
                  type="number" 
                  name="baseRent" 
                  min="0" 
                  step="0.01" 
                  value={formData.baseRent || ""} 
                  onChange={handleNumberInputChange}
                  onWheel={preventWheelScroll}
                  required 
                  className="w-full border-b border-t-0 border-l-0 border-r-0 rounded-none px-0 text-center focus-visible:ring-0 focus-visible:border-b-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="flex items-center gap-4">
                <RadioGroup value={formData.rentFrequency || "monthly"} onValueChange={value => handleRentFrequencyChange(value as RentFrequency)} className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <RadioGroupItem value="monthly" id="baseMonthly" />
                    <Label htmlFor="baseMonthly" className="ml-2">Per month</Label>
                  </div>
                  <div className="flex items-center">
                    <RadioGroupItem value="weekly" id="baseWeekly" />
                    <Label htmlFor="baseWeekly" className="ml-2">Per week</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="w-40 flex-shrink-0">
                <span className="font-medium">The cost of services is</span>
              </div>
              <div className="flex items-center w-48">
                <DollarSign className="h-5 w-5 text-muted-foreground mr-1" />
                <Input 
                  type="number" 
                  name="servicesCost" 
                  min="0" 
                  step="0.01" 
                  value={formData.servicesCost || ""} 
                  onChange={handleNumberInputChange}
                  onWheel={preventWheelScroll}
                  className="w-full border-b border-t-0 border-l-0 border-r-0 rounded-none px-0 text-center focus-visible:ring-0 focus-visible:border-b-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="flex items-center gap-4">
                <RadioGroup value={formData.rentFrequency || "monthly"} onValueChange={value => handleRentFrequencyChange(value as RentFrequency)} className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <RadioGroupItem value="monthly" id="servicesMonthly" />
                    <Label htmlFor="servicesMonthly" className="ml-2">Per month</Label>
                  </div>
                  <div className="flex items-center">
                    <RadioGroupItem value="weekly" id="servicesWeekly" />
                    <Label htmlFor="servicesWeekly" className="ml-2">Per week</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-gray-50 p-3 rounded-md">
              <div className="w-40 flex-shrink-0">
                <span className="font-medium">The total rent is</span>
              </div>
              <div className="flex items-center w-48">
                <DollarSign className="h-5 w-5 text-muted-foreground mr-1" />
                <Input 
                  type="number" 
                  name="totalRent" 
                  min="0"
                  step="0.01"
                  value={formData.totalRent || ""} 
                  onChange={handleNumberInputChange}
                  onWheel={preventWheelScroll}
                  className="w-full bg-transparent border-b border-t-0 border-l-0 border-r-0 rounded-none px-0 text-center focus-visible:ring-0 focus-visible:border-b-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="flex items-center gap-4">
                <RadioGroup value={formData.rentFrequency || "monthly"} onValueChange={value => handleRentFrequencyChange(value as RentFrequency)} className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <RadioGroupItem value="monthly" id="totalMonthly" />
                    <Label htmlFor="totalMonthly" className="ml-2">Per month</Label>
                  </div>
                  <div className="flex items-center">
                    <RadioGroupItem value="weekly" id="totalWeekly" />
                    <Label htmlFor="totalWeekly" className="ml-2">Per week</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            <div className="pl-3 text-sm text-gray-600 italic">
              If applicable, enter the cost of personal services in Schedule 6 of the lease: services offered to the tenant by the lessor.
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="subsidyProgram" 
                checked={formData.subsidyProgram || false} 
                onCheckedChange={checked => handleCheckboxChange("subsidyProgram", checked === true)} 
              />
              <Label htmlFor="subsidyProgram">The tenant benefits from a subsidy program for rent payment.</Label>
            </div>
            
            {formData.subsidyProgram && (
              <div className="ml-6">
                <Textarea
                  name="subsidyProgramDetails"
                  placeholder="Add precision here"
                  value={formData.subsidyProgramDetails || ""}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block">First Payment Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.firstPaymentDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.firstPaymentDate ? format(new Date(formData.firstPaymentDate), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={formData.firstPaymentDate ? new Date(formData.firstPaymentDate) : undefined} onSelect={handleFirstPaymentDateChange} initialFocus className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Label htmlFor="paymentDay" className="mb-2 block">
                        Payment Day <span className="text-sm text-muted-foreground">({formData.rentFrequency === "monthly" ? "1-31" : "1-7"})</span>
                      </Label>
                      <Input
                        id="paymentDay"
                        type="number"
                        name="paymentDay"
                        min="1"
                        max={formData.rentFrequency === "monthly" ? "31" : "7"}
                        value={formData.paymentDay || "1"}
                        onChange={handlePaymentDayChange}
                        onWheel={preventWheelScroll}
                        className="w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>The day of the {formData.rentFrequency || 'month'} when payment is due</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block">Payment Method</Label>
              <Select value={formData.paymentMethod || ""} onValueChange={value => onChange({
              paymentMethod: value
            })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="electronic">Electronic Bank Transfer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="paymentLocation" className="mb-2 block">Payment Location</Label>
              <Input 
                id="paymentLocation"
                name="paymentLocation"
                value={formData.paymentLocation || ""}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded">
            <div className="text-sm mb-3">
              <p className="font-medium mb-2">Post-dated Checks Notice</p>
              <p className="text-muted-foreground text-xs">
                The tenant agrees to provide post-dated checks to the landlord for the duration of the lease.
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mb-3">
              <ToggleGroup type="single" value={formData.postdatedChecks ? "yes" : "no"} onValueChange={handlePostdatedChecksChange}>
                <ToggleGroupItem value="yes" size="sm" className="px-3 py-1">Yes</ToggleGroupItem>
                <ToggleGroupItem value="no" size="sm" className="px-3 py-1">No</ToggleGroupItem>
              </ToggleGroup>
            </div>
            
            <div className="mt-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-dashed border-gray-300 p-2 rounded bg-gray-50">
                  <div className="flex items-center mb-1">
                    <Signature className="h-4 w-4 text-gray-400 mr-1" />
                    <p className="text-xs text-gray-500 font-medium">Tenant 1 Initials</p>
                  </div>
                  <div className="h-7 bg-white border border-gray-200 rounded"></div>
                  <p className="text-[10px] text-gray-400 mt-1 italic">Will be recorded when tenant signs electronically</p>
                </div>
                
                <div className="border border-dashed border-gray-300 p-2 rounded bg-gray-50">
                  <div className="flex items-center mb-1">
                    <Signature className="h-4 w-4 text-gray-400 mr-1" />
                    <p className="text-xs text-gray-500 font-medium">Tenant 2 Initials</p>
                  </div>
                  <div className="h-7 bg-white border border-gray-200 rounded"></div>
                  <p className="text-[10px] text-gray-400 mt-1 italic">Will be recorded when tenant signs electronically</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
}
