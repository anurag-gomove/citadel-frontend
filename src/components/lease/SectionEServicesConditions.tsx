
import React from "react";
import { Lease, ServiceResponsibilities, HeatingSourceType } from "@/types/lease";
import { FormInput } from "@/components/FormInput";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { CalendarIcon, Flame, Zap, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface SectionEServicesConditionsProps {
  formData: Partial<Lease>;
  onChange: (data: Partial<Lease>) => void;
}

export function SectionEServicesConditions({
  formData,
  onChange
}: SectionEServicesConditionsProps) {
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
  
  const handleBuildingRegulationsDateChange = (date?: Date) => {
    if (date) {
      onChange({
        buildingRegulationsDate: date.toISOString(),
        buildingRegulationsAcknowledged: true
      });
    }
  };
  
  const handleCondominiumRegulationsDateChange = (date?: Date) => {
    if (date) {
      onChange({
        condominiumRegulationsDate: date.toISOString(),
        condominiumRegulationsProvided: true
      });
    }
  };
  
  const handleServiceResponsibilityChange = (service: keyof ServiceResponsibilities, value: "landlord" | "tenant") => {
    const serviceResponsibilities = {
      ...formData.serviceResponsibilities,
      [service]: value
    };
    onChange({
      serviceResponsibilities
    });
  };
  
  const handleHeatingSourceTypeChange = (value: HeatingSourceType) => {
    onChange({
      heatingSourceType: value
    });
  };
  
  React.useEffect(() => {
    if (!formData.serviceResponsibilities) {
      onChange({
        serviceResponsibilities: {
          heating: "landlord",
          gas: "landlord",
          electricity: "landlord",
          waterHeaterRental: "landlord",
          hotWater: "landlord",
          waterTax: "landlord",
          snowRemovalParking: "landlord",
          snowRemovalBalcony: "landlord",
          snowRemovalEntrance: "landlord",
          snowRemovalWalkway: "landlord",
          snowRemovalStairs: "landlord"
        }
      });
    }
  }, []);
  
  return <div className="space-y-6">
      <h2 className="text-xl font-semibold">Services and Conditions</h2>
      <p className="text-gray-700 mb-4">The work and repairs to be carried out by the landlord and their timelines are described below:</p>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Building Regulations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded">
            <div className="font-medium text-sm text-gray-700 mb-2">LEGAL NOTICE</div>
            <p className="text-sm mb-3">A copy of the building's regulations was given to the tenant before the lease was concluded.</p>
            
            <div>
              <Label className="mb-2 block">Building Regulations Provided Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal md:w-auto", !formData.buildingRegulationsDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.buildingRegulationsDate ? format(new Date(formData.buildingRegulationsDate), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={formData.buildingRegulationsDate ? new Date(formData.buildingRegulationsDate) : undefined} onSelect={handleBuildingRegulationsDateChange} initialFocus className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex justify-end mt-4 text-xs text-gray-500">
              <div className="flex space-x-4">
                <div>
                  <div className="border-b border-gray-300 w-24 mb-1"></div>
                  <span>Tenant's initials</span>
                </div>
                <div>
                  <div className="border-b border-gray-300 w-24 mb-1"></div>
                  <span>Tenant's initials</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 border border-gray-200 rounded">
            <div className="font-medium text-sm text-gray-700 mb-2">LEGAL NOTICE</div>
            <p className="text-sm mb-3">A copy of the condominium's regulations was given to the tenant before the lease was concluded.</p>
            
            <div>
              <Label className="mb-2 block">Condominium Regulations Provided Date</Label>
              <Popover>
                <PopoverTrigger asChild disabled={!formData.isCondominium}>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal md:w-auto", !formData.condominiumRegulationsDate && "text-muted-foreground", !formData.isCondominium && "opacity-70 cursor-not-allowed")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.condominiumRegulationsDate ? format(new Date(formData.condominiumRegulationsDate), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={formData.condominiumRegulationsDate ? new Date(formData.condominiumRegulationsDate) : undefined} onSelect={handleCondominiumRegulationsDateChange} initialFocus className="pointer-events-auto" disabled={!formData.isCondominium} />
                </PopoverContent>
              </Popover>
              {!formData.isCondominium && <p className="text-xs text-muted-foreground mt-1">This section is disabled because the property is not marked as a condominium in Section B.</p>}
            </div>
            
            <div className="flex justify-end mt-4 text-xs text-gray-500">
              <div className="flex space-x-4">
                <div>
                  <div className="border-b border-gray-300 w-24 mb-1"></div>
                  <span>Tenant's initials</span>
                </div>
                <div>
                  <div className="border-b border-gray-300 w-24 mb-1"></div>
                  <span>Tenant's initials</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Work and Repairs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block">Work and Repairs to be Done (Before Delivery)</Label>
            <Textarea name="repairsBeforeDelivery" value={formData.repairsBeforeDelivery || ""} onChange={handleInputChange} className="min-h-[100px]" />
          </div>
          
          <div>
            <Label className="mb-2 block">Work and Repairs to be Done (During Lease)</Label>
            <Textarea name="repairsDuringLease" value={formData.repairsDuringLease || ""} onChange={handleInputChange} className="min-h-[100px]" />
          </div>
          
          <div className="space-y-3">
            <Label className="block">The contact details of the concierge or the person to contact in case of need are:</Label>
            
            <FormInput 
              label="Name" 
              name="superintendentName" 
              value={formData.superintendentName || ""} 
              onChange={handleInputChange} 
            />
            
            <FormInput 
              label="Phone" 
              name="superintendentPhone" 
              value={formData.superintendentPhone || ""} 
              onChange={handleInputChange} 
            />
            
            <FormInput 
              label="Email" 
              name="superintendentEmail" 
              value={formData.superintendentEmail || ""} 
              onChange={handleInputChange} 
            />
            
            <FormInput 
              label="Other Phone" 
              name="superintendentOtherPhone" 
              value={formData.superintendentOtherPhone || ""} 
              onChange={handleInputChange} 
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Services, Taxes and Consumption Costs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Responsibility Chart</h3>
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-2 text-left font-medium">Service</th>
                    <th className="px-4 py-2 text-center font-medium">Landlord</th>
                    <th className="px-4 py-2 text-center font-medium">Tenant</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="px-4 py-2">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center">
                          <span>Heating</span>
                        </div>
                        <div className="ml-2">
                          <ToggleGroup 
                            type="single" 
                            value={formData.heatingSourceType || 'electricity'} 
                            onValueChange={(value) => handleHeatingSourceTypeChange(value as HeatingSourceType)}
                            className="justify-start"
                          >
                            <ToggleGroupItem value="electricity" size="sm" className="px-2 py-1 text-xs">
                              <Zap className="h-3 w-3 mr-1" />
                              Electricity
                            </ToggleGroupItem>
                            <ToggleGroupItem value="gas" size="sm" className="px-2 py-1 text-xs">
                              <Flame className="h-3 w-3 mr-1" />
                              Gas
                            </ToggleGroupItem>
                            <ToggleGroupItem value="oil" size="sm" className="px-2 py-1 text-xs">
                              <Droplets className="h-3 w-3 mr-1" />
                              Oil
                            </ToggleGroupItem>
                          </ToggleGroup>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <RadioGroup value={formData.serviceResponsibilities?.heating || "landlord"} onValueChange={value => handleServiceResponsibilityChange("heating", value as "landlord" | "tenant")} className="flex justify-center">
                        <RadioGroupItem id="heating-landlord" value="landlord" />
                      </RadioGroup>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <RadioGroup value={formData.serviceResponsibilities?.heating || "landlord"} onValueChange={value => handleServiceResponsibilityChange("heating", value as "landlord" | "tenant")} className="flex justify-center">
                        <RadioGroupItem id="heating-tenant" value="tenant" />
                      </RadioGroup>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">Gas (other than heating)</td>
                    <td className="px-4 py-2 text-center">
                      <RadioGroup value={formData.serviceResponsibilities?.gas || "landlord"} onValueChange={value => handleServiceResponsibilityChange("gas", value as "landlord" | "tenant")} className="flex justify-center">
                        <RadioGroupItem id="gas-landlord" value="landlord" />
                      </RadioGroup>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <RadioGroup value={formData.serviceResponsibilities?.gas || "landlord"} onValueChange={value => handleServiceResponsibilityChange("gas", value as "landlord" | "tenant")} className="flex justify-center">
                        <RadioGroupItem id="gas-tenant" value="tenant" />
                      </RadioGroup>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">Electricity (other than heating)</td>
                    <td className="px-4 py-2 text-center">
                      <RadioGroup value={formData.serviceResponsibilities?.electricity || "landlord"} onValueChange={value => handleServiceResponsibilityChange("electricity", value as "landlord" | "tenant")} className="flex justify-center">
                        <RadioGroupItem id="electricity-landlord" value="landlord" />
                      </RadioGroup>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <RadioGroup value={formData.serviceResponsibilities?.electricity || "landlord"} onValueChange={value => handleServiceResponsibilityChange("electricity", value as "landlord" | "tenant")} className="flex justify-center">
                        <RadioGroupItem id="electricity-tenant" value="tenant" />
                      </RadioGroup>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">Water Heater Rental</td>
                    <td className="px-4 py-2 text-center">
                      <RadioGroup value={formData.serviceResponsibilities?.waterHeaterRental || "landlord"} onValueChange={value => handleServiceResponsibilityChange("waterHeaterRental", value as "landlord" | "tenant")} className="flex justify-center">
                        <RadioGroupItem id="waterHeaterRental-landlord" value="landlord" />
                      </RadioGroup>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <RadioGroup value={formData.serviceResponsibilities?.waterHeaterRental || "landlord"} onValueChange={value => handleServiceResponsibilityChange("waterHeaterRental", value as "landlord" | "tenant")} className="flex justify-center">
                        <RadioGroupItem id="waterHeaterRental-tenant" value="tenant" />
                      </RadioGroup>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">Hot Water Usage</td>
                    <td className="px-4 py-2 text-center">
                      <RadioGroup value={formData.serviceResponsibilities?.hotWater || "landlord"} onValueChange={value => handleServiceResponsibilityChange("hotWater", value as "landlord" | "tenant")} className="flex justify-center">
                        <RadioGroupItem id="hotWater-landlord" value="landlord" />
                      </RadioGroup>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <RadioGroup value={formData.serviceResponsibilities?.hotWater || "landlord"} onValueChange={value => handleServiceResponsibilityChange("hotWater", value as "landlord" | "tenant")} className="flex justify-center">
                        <RadioGroupItem id="hotWater-tenant" value="tenant" />
                      </RadioGroup>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">Water Consumption Tax</td>
                    <td className="px-4 py-2 text-center">
                      <RadioGroup value={formData.serviceResponsibilities?.waterTax || "landlord"} onValueChange={value => handleServiceResponsibilityChange("waterTax", value as "landlord" | "tenant")} className="flex justify-center">
                        <RadioGroupItem id="waterTax-landlord" value="landlord" />
                      </RadioGroup>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <RadioGroup value={formData.serviceResponsibilities?.waterTax || "landlord"} onValueChange={value => handleServiceResponsibilityChange("waterTax", value as "landlord" | "tenant")} className="flex justify-center">
                        <RadioGroupItem id="waterTax-tenant" value="tenant" />
                      </RadioGroup>
                    </td>
                  </tr>
                  <tr className="bg-muted/20">
                    <td className="px-4 py-2 font-medium" colSpan={3}>Snow Removal</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 pl-8">Parking</td>
                    <td className="px-4 py-2 text-center">
                      <RadioGroup value={formData.serviceResponsibilities?.snowRemovalParking || "landlord"} onValueChange={value => handleServiceResponsibilityChange("snowRemovalParking", value as "landlord" | "tenant")} className="flex justify-center">
                        <RadioGroupItem id="snowRemovalParking-landlord" value="landlord" />
                      </RadioGroup>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <RadioGroup value={formData.serviceResponsibilities?.snowRemovalParking || "landlord"} onValueChange={value => handleServiceResponsibilityChange("snowRemovalParking", value as "landlord" | "tenant")} className="flex justify-center">
                        <RadioGroupItem id="snowRemovalParking-tenant" value="tenant" />
                      </RadioGroup>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 pl-8">Balcony</td>
                    <td className="px-4 py-2 text-center">
                      <RadioGroup value={formData.serviceResponsibilities?.snowRemovalBalcony || "tenant"} onValueChange={value => handleServiceResponsibilityChange("snowRemovalBalcony", value as "landlord" | "tenant")} className="flex justify-center">
                        <RadioGroupItem id="snowRemovalBalcony-landlord" value="landlord" />
                      </RadioGroup>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <RadioGroup value={formData.serviceResponsibilities?.snowRemovalBalcony || "tenant"} onValueChange={value => handleServiceResponsibilityChange("snowRemovalBalcony", value as "landlord" | "tenant")} className="flex justify-center">
                        <RadioGroupItem id="snowRemovalBalcony-tenant" value="tenant" />
                      </RadioGroup>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 pl-8">Entrance</td>
                    <td className="px-4 py-2 text-center">
                      <RadioGroup value={formData.serviceResponsibilities?.snowRemovalEntrance || "landlord"} onValueChange={value => handleServiceResponsibilityChange("snowRemovalEntrance", value as "landlord" | "tenant")} className="flex justify-center">
                        <RadioGroupItem id="snowRemovalEntrance-landlord" value="landlord" />
                      </RadioGroup>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <RadioGroup value={formData.serviceResponsibilities?.snowRemovalEntrance || "landlord"} onValueChange={value => handleServiceResponsibilityChange("snowRemovalEntrance", value as "landlord" | "tenant")} className="flex justify-center">
                        <RadioGroupItem id="snowRemovalEntrance-tenant" value="tenant" />
                      </RadioGroup>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 pl-8">Walkway</td>
                    <td className="px-4 py-2 text-center">
                      <RadioGroup value={formData.serviceResponsibilities?.snowRemovalWalkway || "landlord"} onValueChange={value => handleServiceResponsibilityChange("snowRemovalWalkway", value as "landlord" | "tenant")} className="flex justify-center">
                        <RadioGroupItem id="snowRemovalWalkway-landlord" value="landlord" />
                      </RadioGroup>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <RadioGroup value={formData.serviceResponsibilities?.snowRemovalWalkway || "landlord"} onValueChange={value => handleServiceResponsibilityChange("snowRemovalWalkway", value as "landlord" | "tenant")} className="flex justify-center">
                        <RadioGroupItem id="snowRemovalWalkway-tenant" value="tenant" />
                      </RadioGroup>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 pl-8">Stairs</td>
                    <td className="px-4 py-2 text-center">
                      <RadioGroup value={formData.serviceResponsibilities?.snowRemovalStairs || "landlord"} onValueChange={value => handleServiceResponsibilityChange("snowRemovalStairs", value as "landlord" | "tenant")} className="flex justify-center">
                        <RadioGroupItem id="snowRemovalStairs-landlord" value="landlord" />
                      </RadioGroup>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <RadioGroup value={formData.serviceResponsibilities?.snowRemovalStairs || "landlord"} onValueChange={value => handleServiceResponsibilityChange("snowRemovalStairs", value as "landlord" | "tenant")} className="flex justify-center">
                        <RadioGroupItem id="snowRemovalStairs-tenant" value="tenant" />
                      </RadioGroup>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Additional Conditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="accessToLand" checked={formData.accessToLand || false} onCheckedChange={checked => handleCheckboxChange("accessToLand", checked === true)} />
              <Label htmlFor="accessToLand">Access to land</Label>
            </div>
            
            {formData.accessToLand && (
              <div className="pl-6">
                <Textarea 
                  name="accessToLandDetails" 
                  value={formData.accessToLandDetails || ""} 
                  onChange={handleInputChange} 
                  placeholder="Add precisions" 
                  className="mt-2" 
                />
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="animalsAllowed" checked={formData.animalsAllowed || false} onCheckedChange={checked => handleCheckboxChange("animalsAllowed", checked === true)} />
              <Label htmlFor="animalsAllowed">Right to keep animals</Label>
            </div>
            
            {formData.animalsAllowed && (
              <div className="pl-6">
                <Textarea 
                  name="animalsAllowedDetails" 
                  value={formData.animalsAllowedDetails || ""} 
                  onChange={handleInputChange} 
                  placeholder="Add precisions" 
                  className="mt-2" 
                />
              </div>
            )}
          </div>
          
          <div>
            <Label className="mb-2 block">Other Services and Restrictions</Label>
            <Textarea 
              name="otherConditions" 
              value={formData.otherConditions || ""} 
              onChange={handleInputChange} 
              className="min-h-[100px]" 
              placeholder="(examples: antenna, barbecue, air conditioner, clothesline, painting, swimming pool, laundry room)" 
            />
          </div>
        </CardContent>
      </Card>
    </div>;
}
