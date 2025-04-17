import React from "react";
import { Lease, MixedPurposeType } from "@/types/lease";
import { FormInput } from "@/components/FormInput";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Signature } from "lucide-react";

interface SectionBDwellingDescriptionProps {
  formData: Partial<Lease>;
  onChange: (data: Partial<Lease>) => void;
}

export function SectionBDwellingDescription({
  formData,
  onChange
}: SectionBDwellingDescriptionProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {
      name,
      value
    } = e.target;
    onChange({
      [name]: value
    });
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    onChange({
      [name]: checked
    });
  };

  const handleApplianceChange = (name: keyof Lease['appliances'], checked: boolean) => {
    const appliances = {
      ...formData.appliances,
      [name]: checked
    };
    onChange({
      appliances
    });
  };

  const handleFurnitureChange = (name: keyof Lease['furniture'], value: any) => {
    if (typeof value === 'boolean') {
      const furniture = {
        ...formData.furniture,
        [name]: value
      };
      if (!value && name.toString().endsWith('Count') === false) {
        const countPropertyName = `${name}Count`;
        if (countPropertyName in furniture) {
          (furniture as any)[countPropertyName] = 0;
        }
      }
      onChange({
        furniture
      });
    } else if (typeof value === 'string' || typeof value === 'number') {
      const furniture = {
        ...formData.furniture,
        [name]: value
      };
      onChange({
        furniture
      });
    }
  };

  const handleResidentialPurposeChange = (value: string) => {
    const isResidentialOnly = value === "yes";
    onChange({
      residentialPurposeOnly: isResidentialOnly,
      purpose: isResidentialOnly ? "residential" : "mixed",
      mixedPurposeTypes: isResidentialOnly ? [] : formData.mixedPurposeTypes
    });
  };

  const handleMixedPurposeTypeChange = (type: MixedPurposeType, checked: boolean) => {
    const currentTypes = formData.mixedPurposeTypes || [];
    let newTypes: MixedPurposeType[];
    if (checked) {
      newTypes = currentTypes.includes(type) ? currentTypes : [...currentTypes, type];
    } else {
      newTypes = currentTypes.filter(t => t !== type);
    }
    onChange({
      mixedPurposeTypes: newTypes
    });
  };

  const handleParkingChange = (type: 'indoor' | 'outdoor', checked: boolean) => {
    if (type === 'outdoor') {
      const updates: Partial<Lease> = {
        hasOutdoorParking: checked
      };
      
      if (!checked) {
        updates.outdoorParkingSpaces = 0;
        updates.outdoorParkingLocation = '';
      }
      
      onChange(updates);
    } else {
      const updates: Partial<Lease> = {
        hasIndoorParking: checked
      };
      
      if (!checked) {
        updates.indoorParkingSpaces = 0;
        updates.indoorParkingLocation = '';
      }
      
      onChange(updates);
    }
  };

  const handleStorageDetailsChange = (checked: boolean) => {
    const updates: Partial<Lease> = {
      storageDetails: checked ? formData.storageDetails || "Storage available" : ""
    };
    onChange(updates);
  };

  const handleOtherAccessoriesChange = (checked: boolean) => {
    const updates: Partial<Lease> = {
      otherAccessories: checked ? formData.otherAccessories || "Additional accessories" : ""
    };
    onChange(updates);
  };

  return <div className="space-y-6">
      <h2 className="text-xl font-semibold">Description and destination of leased property, accessories and depedencies (art. 1892 C.c.Q.)</h2>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dwelling Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <FormInput label="Street No." name="dwellingStreetNumber" value={formData.dwellingStreetNumber || ""} onChange={handleChange} required />
            <FormInput label="Street" name="dwellingStreet" value={formData.dwellingStreet || ""} onChange={handleChange} required />
            <FormInput label="Apt." name="dwellingApt" value={formData.dwellingApt || ""} onChange={handleChange} />
          </div>
          
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <FormInput label="Municipality" name="dwellingMunicipality" value={formData.dwellingMunicipality || ""} onChange={handleChange} required />
            <FormInput label="Zipcode" name="dwellingZipcode" value={formData.dwellingZipcode || ""} onChange={handleChange} required />
            <FormInput label="Number of Rooms" type="number" name="numberOfRooms" value={formData.numberOfRooms || ""} onChange={handleChange} required />
          </div>
          
          <div className="space-y-3 mt-4">
            <Label className="text-base font-medium">The rental is intended for residential purposes only.</Label>
            <RadioGroup value={formData.residentialPurposeOnly ? "yes" : "no"} onValueChange={handleResidentialPurposeChange} className="flex space-x-6">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="residential-yes" />
                <Label htmlFor="residential-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="residential-no" />
                <Label htmlFor="residential-no">No</Label>
              </div>
            </RadioGroup>
          </div>
          
          {!formData.residentialPurposeOnly && <div className="pl-6 py-3 border-l-2 border-gray-200">
              <div className="space-y-3">
                <p className="text-sm">If the "No" box has been checked, the accommodation is rented for mixed purposes of habitation and:</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="purpose-professional" checked={(formData.mixedPurposeTypes || []).includes('professional')} onCheckedChange={checked => handleMixedPurposeTypeChange('professional', checked === true)} />
                    <Label htmlFor="purpose-professional">Professional</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="purpose-commercial" checked={(formData.mixedPurposeTypes || []).includes('commercial')} onCheckedChange={checked => handleMixedPurposeTypeChange('commercial', checked === true)} />
                    <Label htmlFor="purpose-commercial">Commercial</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="purpose-industrial" checked={(formData.mixedPurposeTypes || []).includes('industrial')} onCheckedChange={checked => handleMixedPurposeTypeChange('industrial', checked === true)} />
                    <Label htmlFor="purpose-industrial">Industrial</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="purpose-other" checked={(formData.mixedPurposeTypes || []).includes('other')} onCheckedChange={checked => handleMixedPurposeTypeChange('other', checked === true)} />
                    <Label htmlFor="purpose-other">Other</Label>
                  </div>
                </div>
                <p className="text-sm">but no more than one-third of the total area will be used for the latter purpose (art. 1892 C.c.Q.).</p>
              </div>
            </div>}
          
          <div className="flex items-center space-x-2 mt-4">
            <Checkbox id="isCondominium" checked={formData.isCondominium || false} onCheckedChange={checked => handleCheckboxChange("isCondominium", checked === true)} />
            <Label htmlFor="isCondominium">Located in condominium</Label>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Parking and Storage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 mb-3">
            <Checkbox 
              id="hasOutdoorParking" 
              checked={formData.hasOutdoorParking || false} 
              onCheckedChange={checked => handleParkingChange("outdoor", checked === true)} 
            />
            <Label htmlFor="hasOutdoorParking">Outdoor Parking</Label>
          </div>
          
          {formData.hasOutdoorParking && <div className="grid gap-4 grid-cols-1 md:grid-cols-2 pl-6 mb-4">
              <FormInput label="Number of Spaces" type="number" name="outdoorParkingSpaces" value={formData.outdoorParkingSpaces || ""} onChange={handleChange} />
              <FormInput label="Location" name="outdoorParkingLocation" value={formData.outdoorParkingLocation || ""} onChange={handleChange} />
            </div>}
          
          <div className="flex items-center space-x-2 mb-3">
            <Checkbox 
              id="hasIndoorParking" 
              checked={formData.hasIndoorParking || false} 
              onCheckedChange={checked => handleParkingChange("indoor", checked === true)} 
            />
            <Label htmlFor="hasIndoorParking">Indoor Parking</Label>
          </div>
          
          {formData.hasIndoorParking && <div className="grid gap-4 grid-cols-1 md:grid-cols-2 pl-6 mb-4">
              <FormInput label="Number of Spaces" type="number" name="indoorParkingSpaces" value={formData.indoorParkingSpaces || ""} onChange={handleChange} />
              <FormInput label="Location" name="indoorParkingLocation" value={formData.indoorParkingLocation || ""} onChange={handleChange} />
            </div>}
          
          <div className="flex items-center space-x-2 mb-3">
            <Checkbox 
              id="hasStorageDetails" 
              checked={formData.storageDetails !== ""} 
              onCheckedChange={checked => handleStorageDetailsChange(checked === true)} 
            />
            <Label htmlFor="hasStorageDetails">Storage Details</Label>
          </div>
          
          {formData.storageDetails !== "" && <div className="pl-6">
              <Label className="mb-2 block">Details</Label>
              <Textarea name="storageDetails" value={formData.storageDetails || ""} onChange={handleChange} className="min-h-[100px]" />
            </div>}
          
          <div className="flex items-center space-x-2 mb-3">
            <Checkbox 
              id="hasOtherAccessories" 
              checked={formData.otherAccessories !== ""} 
              onCheckedChange={checked => handleOtherAccessoriesChange(checked === true)} 
            />
            <Label htmlFor="hasOtherAccessories">Other Accessories and Dependencies</Label>
          </div>
          
          {formData.otherAccessories !== "" && <div className="pl-6">
              <Label className="mb-2 block">Details</Label>
              <Textarea name="otherAccessories" value={formData.otherAccessories || ""} onChange={handleChange} placeholder="Specify other accessories and dependencies" className="min-h-[100px]" />
            </div>}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Furniture and Appliances</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2 mb-1">
            <Checkbox 
              id="furnitureIncluded" 
              checked={formData.furnitureIncluded || false} 
              onCheckedChange={checked => handleCheckboxChange("furnitureIncluded", checked === true)} 
            />
            <Label htmlFor="furnitureIncluded">Furniture included in rent</Label>
          </div>
          
          {formData.furnitureIncluded && <>
              <div className="mb-2 pt-1 border-t">
                <h4 className="text-sm font-medium mb-1">Appliances</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-2 gap-y-1">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="appliance-stove" checked={formData.appliances?.stove || false} onCheckedChange={checked => handleApplianceChange("stove", checked === true)} />
                    <Label htmlFor="appliance-stove" className="text-xs sm:text-sm">Stove</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="appliance-microwave" checked={formData.appliances?.microwave || false} onCheckedChange={checked => handleApplianceChange("microwave", checked === true)} />
                    <Label htmlFor="appliance-microwave" className="text-xs sm:text-sm">Microwave</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="appliance-dishwasher" checked={formData.appliances?.dishwasher || false} onCheckedChange={checked => handleApplianceChange("dishwasher", checked === true)} />
                    <Label htmlFor="appliance-dishwasher" className="text-xs sm:text-sm">Dishwasher</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="appliance-refrigerator" checked={formData.appliances?.refrigerator || false} onCheckedChange={checked => handleApplianceChange("refrigerator", checked === true)} />
                    <Label htmlFor="appliance-refrigerator" className="text-xs sm:text-sm">Refrigerator</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="appliance-washer" checked={formData.appliances?.washer || false} onCheckedChange={checked => handleApplianceChange("washer", checked === true)} />
                    <Label htmlFor="appliance-washer" className="text-xs sm:text-sm">Washer</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="appliance-dryer" checked={formData.appliances?.dryer || false} onCheckedChange={checked => handleApplianceChange("dryer", checked === true)} />
                    <Label htmlFor="appliance-dryer" className="text-xs sm:text-sm">Dryer</Label>
                  </div>
                </div>
              </div>
              
              <div className="pt-1 border-t">
                <h4 className="text-sm font-medium mb-1">Furniture</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                  <div className="flex items-center">
                    <div className="flex items-center space-x-2 w-1/3">
                      <Checkbox id="furniture-tables" checked={formData.furniture?.tables || false} onCheckedChange={checked => handleFurnitureChange("tables", checked === true)} />
                      <Label htmlFor="furniture-tables" className="text-xs sm:text-sm">Tables</Label>
                    </div>
                    {formData.furniture?.tables && <div className="ml-auto w-2/3 flex items-center">
                        <Label htmlFor="tables-count" className="text-xs w-8 mr-1">Qty:</Label>
                        <Input id="tables-count" type="number" value={formData.furniture?.tablesCount || 0} onChange={e => handleFurnitureChange("tablesCount", parseInt(e.target.value) || 0)} min={0} className="h-7 text-xs" />
                      </div>}
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex items-center space-x-2 w-1/3">
                      <Checkbox id="furniture-chairs" checked={formData.furniture?.chairs || false} onCheckedChange={checked => handleFurnitureChange("chairs", checked === true)} />
                      <Label htmlFor="furniture-chairs" className="text-xs sm:text-sm">Chairs</Label>
                    </div>
                    {formData.furniture?.chairs && <div className="ml-auto w-2/3 flex items-center">
                        <Label htmlFor="chairs-count" className="text-xs w-8 mr-1">Qty:</Label>
                        <Input id="chairs-count" type="number" value={formData.furniture?.chairsCount || 0} onChange={e => handleFurnitureChange("chairsCount", parseInt(e.target.value) || 0)} min={0} className="h-7 text-xs" />
                      </div>}
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex items-center space-x-2 w-1/3">
                      <Checkbox id="furniture-dresser" checked={formData.furniture?.dresser || false} onCheckedChange={checked => handleFurnitureChange("dresser", checked === true)} />
                      <Label htmlFor="furniture-dresser" className="text-xs sm:text-sm">Dresser</Label>
                    </div>
                    {formData.furniture?.dresser && <div className="ml-auto w-2/3 flex items-center">
                        <Label htmlFor="dresser-count" className="text-xs w-8 mr-1">Qty:</Label>
                        <Input id="dresser-count" type="number" value={formData.furniture?.dresserCount || 0} onChange={e => handleFurnitureChange("dresserCount", parseInt(e.target.value) || 0)} min={0} className="h-7 text-xs" />
                      </div>}
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex items-center space-x-2 w-1/3">
                      <Checkbox id="furniture-sofa" checked={formData.furniture?.sofa || false} onCheckedChange={checked => handleFurnitureChange("sofa", checked === true)} />
                      <Label htmlFor="furniture-sofa" className="text-xs sm:text-sm">Sofa</Label>
                    </div>
                    {formData.furniture?.sofa && <div className="ml-auto w-2/3 flex items-center">
                        <Label htmlFor="sofa-count" className="text-xs w-8 mr-1">Qty:</Label>
                        <Input id="sofa-count" type="number" value={formData.furniture?.sofaCount || 0} onChange={e => handleFurnitureChange("sofaCount", parseInt(e.target.value) || 0)} min={0} className="h-7 text-xs" />
                      </div>}
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex items-center space-x-2 w-1/3">
                      <Checkbox id="furniture-armchair" checked={formData.furniture?.armchair || false} onCheckedChange={checked => handleFurnitureChange("armchair", checked === true)} />
                      <Label htmlFor="furniture-armchair" className="text-xs sm:text-sm">Armchair</Label>
                    </div>
                    {formData.furniture?.armchair && <div className="ml-auto w-2/3 flex items-center">
                        <Label htmlFor="armchair-count" className="text-xs w-8 mr-1">Qty:</Label>
                        <Input id="armchair-count" type="number" value={formData.furniture?.armchairCount || 0} onChange={e => handleFurnitureChange("armchairCount", parseInt(e.target.value) || 0)} min={0} className="h-7 text-xs" />
                      </div>}
                  </div>
                  
                  <div className="flex items-center sm:col-span-2">
                    <div className="flex items-center space-x-2 w-[15%]">
                      <Checkbox id="furniture-bed" checked={formData.furniture?.bed || false} onCheckedChange={checked => handleFurnitureChange("bed", checked === true)} />
                      <Label htmlFor="furniture-bed" className="text-xs sm:text-sm">Bed</Label>
                    </div>
                    {formData.furniture?.bed && <div className="flex ml-auto w-[85%] gap-2">
                        <div className="flex items-center w-1/3">
                          <Label htmlFor="bed-count" className="text-xs w-8 mr-1">Qty:</Label>
                          <Input id="bed-count" type="number" value={formData.furniture?.bedCount || 0} onChange={e => handleFurnitureChange("bedCount", parseInt(e.target.value) || 0)} min={0} className="h-7 text-xs" />
                        </div>
                        <div className="flex items-center w-2/3">
                          <Label htmlFor="bed-size" className="text-xs w-12 mr-1">Size:</Label>
                          <Input id="bed-size" value={formData.furniture?.bedWithSize || ""} onChange={e => handleFurnitureChange("bedWithSize", e.target.value)} placeholder="e.g., Queen, King, Twin" className="h-7 text-xs" />
                        </div>
                      </div>}
                  </div>
                </div>
                
                <div className="mt-2">
                  <Label htmlFor="other-furnishings" className="text-xs font-medium">Other Furnishings</Label>
                  <Textarea id="other-furnishings" name="otherFurnishings" value={formData.otherFurnishings || ""} onChange={handleChange} className="min-h-[60px] text-sm mt-1" placeholder="Describe any other furniture included in the rent" />
                </div>
              </div>
            </>}
          
          <div className="mt-3 pt-3 border-t">
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <div className="text-sm mb-3">
                <p className="font-medium mb-2">Smoke Detector Statement</p>
                <p className="text-muted-foreground text-xs">
                  The landlord and the tenant agree, according to their respective responsibilities, to comply with the regulations relating to the presence and proper functioning of smoke detectors in the dwelling and in the building.
                </p>
              </div>
              
              <div className="mt-3">
                <p className="text-xs font-medium mb-2">Landlord Signatures</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="border border-dashed border-gray-300 p-2 rounded bg-gray-50">
                    <div className="flex items-center mb-1">
                      <Signature className="h-4 w-4 text-gray-400 mr-1" />
                      <p className="text-xs text-gray-500 font-medium">Landlord 1 Initials</p>
                    </div>
                    <div className="h-7 bg-white border border-gray-200 rounded mb-1"></div>
                    
                    <div className="flex items-center mb-1">
                      <p className="text-xs text-gray-500 font-medium">Date</p>
                    </div>
                    <div className="h-7 bg-white border border-gray-200 rounded"></div>
                    
                    <p className="text-[10px] text-gray-400 mt-1 italic">Signature required on printed form</p>
                  </div>
                  
                  <div className="border border-dashed border-gray-300 p-2 rounded bg-gray-50">
                    <div className="flex items-center mb-1">
                      <Signature className="h-4 w-4 text-gray-400 mr-1" />
                      <p className="text-xs text-gray-500 font-medium">Landlord 2 Initials</p>
                    </div>
                    <div className="h-7 bg-white border border-gray-200 rounded mb-1"></div>
                    
                    <div className="flex items-center mb-1">
                      <p className="text-xs text-gray-500 font-medium">Date</p>
                    </div>
                    <div className="h-7 bg-white border border-gray-200 rounded"></div>
                    
                    <p className="text-[10px] text-gray-400 mt-1 italic">Optional - if applicable</p>
                  </div>
                </div>
                
                <p className="text-xs font-medium mb-2">Tenant Signatures</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-dashed border-gray-300 p-2 rounded bg-gray-50">
                    <div className="flex items-center mb-1">
                      <Signature className="h-4 w-4 text-gray-400 mr-1" />
                      <p className="text-xs text-gray-500 font-medium">Tenant 1 Initials</p>
                    </div>
                    <div className="h-7 bg-white border border-gray-200 rounded mb-1"></div>
                    
                    <div className="flex items-center mb-1">
                      <p className="text-xs text-gray-500 font-medium">Date</p>
                    </div>
                    <div className="h-7 bg-white border border-gray-200 rounded"></div>
                    
                    <p className="text-[10px] text-gray-400 mt-1 italic">Signature required on printed form</p>
                  </div>
                  
                  <div className="border border-dashed border-gray-300 p-2 rounded bg-gray-50">
                    <div className="flex items-center mb-1">
                      <Signature className="h-4 w-4 text-gray-400 mr-1" />
                      <p className="text-xs text-gray-500 font-medium">Tenant 2 Initials</p>
                    </div>
                    <div className="h-7 bg-white border border-gray-200 rounded mb-1"></div>
                    
                    <div className="flex items-center mb-1">
                      <p className="text-xs text-gray-500 font-medium">Date</p>
                    </div>
                    <div className="h-7 bg-white border border-gray-200 rounded"></div>
                    
                    <p className="text-[10px] text-gray-400 mt-1 italic">Optional - if applicable</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
}
