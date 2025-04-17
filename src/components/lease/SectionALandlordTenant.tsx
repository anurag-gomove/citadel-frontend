
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tenant } from "@/types/database";

interface SectionAProps {
  formData: any;
  tenant: Tenant | null;
  propertyId: string | null;
  onChange: (field: string, value: any) => void;
}

export function SectionALandlordTenant({ formData, tenant, propertyId, onChange }: SectionAProps) {
  const [loading, setLoading] = useState(false);
  
  // Debug logs
  console.log("SectionA Component - formData:", formData);
  console.log("SectionA Component - propertyId:", propertyId);
  
  useEffect(() => {
    setLoading(false);
  }, [formData, tenant]);

  if (loading) {
    return <div className="p-4 space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>;
  }

  return <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>A. Landlord Identification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Primary Landlord Information */}
            <div className="col-span-2">
              <h3 className="text-lg font-medium mb-2">Primary Landlord</h3>
            </div>

            {/* Landlord Name */}
            <div className="space-y-2">
              <Label htmlFor="landlordName">Landlord Name</Label>
              <Input
                id="landlordName"
                value={formData.landlordName || ""}
                onChange={e => onChange("landlordName", e.target.value)}
                placeholder="Enter landlord name"
              />
            </div>
            
            {/* Street Number */}
            <div className="space-y-2">
              <Label htmlFor="landlordStreetNumber">Street Number</Label>
              <Input
                id="landlordStreetNumber"
                value={formData.landlordStreetNumber || ""}
                onChange={e => onChange("landlordStreetNumber", e.target.value)}
                placeholder="Enter street number"
              />
            </div>
            
            {/* Street Name */}
            <div className="space-y-2">
              <Label htmlFor="landlordStreetName">Street Name</Label>
              <Input
                id="landlordStreetName"
                value={formData.landlordStreetName || ""}
                onChange={e => onChange("landlordStreetName", e.target.value)}
                placeholder="Enter street name"
              />
            </div>
            
            {/* Apartment */}
            <div className="space-y-2">
              <Label htmlFor="landlordApartment">Apartment/Suite</Label>
              <Input
                id="landlordApartment"
                value={formData.landlordApartment || ""}
                onChange={e => onChange("landlordApartment", e.target.value)}
                placeholder="Enter apartment or suite number (if applicable)"
              />
            </div>
            
            {/* Municipality */}
            <div className="space-y-2">
              <Label htmlFor="landlordMunicipality">Municipality</Label>
              <Input
                id="landlordMunicipality"
                value={formData.landlordMunicipality || ""}
                onChange={e => onChange("landlordMunicipality", e.target.value)}
                placeholder="Enter municipality"
              />
            </div>
            
            {/* Postal Code */}
            <div className="space-y-2">
              <Label htmlFor="landlordPostalCode">Postal Code</Label>
              <Input
                id="landlordPostalCode"
                value={formData.landlordPostalCode || ""}
                onChange={e => onChange("landlordPostalCode", e.target.value)}
                placeholder="Enter postal code"
              />
            </div>
            
            {/* Telephone */}
            <div className="space-y-2">
              <Label htmlFor="landlordTelephone">Telephone</Label>
              <Input
                id="landlordTelephone"
                value={formData.landlordTelephone || ""}
                onChange={e => onChange("landlordTelephone", e.target.value)}
                placeholder="Enter telephone number"
              />
            </div>
            
            {/* Cell Phone */}
            <div className="space-y-2">
              <Label htmlFor="landlordCellPhone">Cell Phone</Label>
              <Input
                id="landlordCellPhone"
                value={formData.landlordCellPhone || ""}
                onChange={e => onChange("landlordCellPhone", e.target.value)}
                placeholder="Enter cell phone number"
              />
            </div>
            
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="landlordEmail">Email</Label>
              <Input
                id="landlordEmail"
                value={formData.landlordEmail || ""}
                onChange={e => onChange("landlordEmail", e.target.value)}
                placeholder="Enter email address"
              />
            </div>
            
            {/* Second Landlord Section */}
            <div className="col-span-2 mt-6">
              <h3 className="text-lg font-medium mb-2">Second Landlord (if applicable)</h3>
            </div>

            {/* Second Landlord Name */}
            <div className="space-y-2">
              <Label htmlFor="secondLandlordName">Landlord Name</Label>
              <Input
                id="secondLandlordName"
                value={formData.secondLandlordName || ""}
                onChange={e => onChange("secondLandlordName", e.target.value)}
                placeholder="Enter second landlord name"
              />
            </div>
            
            {/* Second Landlord Street Number */}
            <div className="space-y-2">
              <Label htmlFor="secondLandlordStreetNumber">Street Number</Label>
              <Input
                id="secondLandlordStreetNumber"
                value={formData.secondLandlordStreetNumber || ""}
                onChange={e => onChange("secondLandlordStreetNumber", e.target.value)}
                placeholder="Enter street number"
              />
            </div>
            
            {/* Second Landlord Street Name */}
            <div className="space-y-2">
              <Label htmlFor="secondLandlordStreetName">Street Name</Label>
              <Input
                id="secondLandlordStreetName"
                value={formData.secondLandlordStreetName || ""}
                onChange={e => onChange("secondLandlordStreetName", e.target.value)}
                placeholder="Enter street name"
              />
            </div>
            
            {/* Second Landlord Apartment */}
            <div className="space-y-2">
              <Label htmlFor="secondLandlordApartment">Apartment/Suite</Label>
              <Input
                id="secondLandlordApartment"
                value={formData.secondLandlordApartment || ""}
                onChange={e => onChange("secondLandlordApartment", e.target.value)}
                placeholder="Enter apartment or suite number (if applicable)"
              />
            </div>
            
            {/* Second Landlord Municipality */}
            <div className="space-y-2">
              <Label htmlFor="secondLandlordMunicipality">Municipality</Label>
              <Input
                id="secondLandlordMunicipality"
                value={formData.secondLandlordMunicipality || ""}
                onChange={e => onChange("secondLandlordMunicipality", e.target.value)}
                placeholder="Enter municipality"
              />
            </div>
            
            {/* Second Landlord Postal Code */}
            <div className="space-y-2">
              <Label htmlFor="secondLandlordPostalCode">Postal Code</Label>
              <Input
                id="secondLandlordPostalCode"
                value={formData.secondLandlordPostalCode || ""}
                onChange={e => onChange("secondLandlordPostalCode", e.target.value)}
                placeholder="Enter postal code"
              />
            </div>
            
            {/* Second Landlord Telephone */}
            <div className="space-y-2">
              <Label htmlFor="secondLandlordTelephone">Telephone</Label>
              <Input
                id="secondLandlordTelephone"
                value={formData.secondLandlordTelephone || ""}
                onChange={e => onChange("secondLandlordTelephone", e.target.value)}
                placeholder="Enter telephone number"
              />
            </div>
            
            {/* Second Landlord Cell Phone */}
            <div className="space-y-2">
              <Label htmlFor="secondLandlordCellPhone">Cell Phone</Label>
              <Input
                id="secondLandlordCellPhone"
                value={formData.secondLandlordCellPhone || ""}
                onChange={e => onChange("secondLandlordCellPhone", e.target.value)}
                placeholder="Enter cell phone number"
              />
            </div>
            
            {/* Second Landlord Email */}
            <div className="space-y-2">
              <Label htmlFor="secondLandlordEmail">Email</Label>
              <Input
                id="secondLandlordEmail"
                value={formData.secondLandlordEmail || ""}
                onChange={e => onChange("secondLandlordEmail", e.target.value)}
                placeholder="Enter email address"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>A. Tenant Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Primary Tenant */}
            <div className="col-span-2">
              <h3 className="text-lg font-medium mb-2">Primary Tenant</h3>
            </div>
            
            {/* Tenant Name */}
            <div className="space-y-2">
              <Label htmlFor="tenantName">Tenant Name</Label>
              <Input
                id="tenantName"
                value={formData.tenantName || ""}
                onChange={e => onChange("tenantName", e.target.value)}
                placeholder="Enter tenant name"
              />
            </div>
            
            {/* Street Number */}
            <div className="space-y-2">
              <Label htmlFor="tenantStreetNumber">Street Number</Label>
              <Input
                id="tenantStreetNumber"
                value={formData.tenantStreetNumber || ""}
                onChange={e => onChange("tenantStreetNumber", e.target.value)}
                placeholder="Enter street number"
              />
            </div>
            
            {/* Street Name */}
            <div className="space-y-2">
              <Label htmlFor="tenantStreetName">Street Name</Label>
              <Input
                id="tenantStreetName"
                value={formData.tenantStreetName || ""}
                onChange={e => onChange("tenantStreetName", e.target.value)}
                placeholder="Enter street name"
              />
            </div>
            
            {/* Apartment */}
            <div className="space-y-2">
              <Label htmlFor="tenantApartment">Apartment/Suite</Label>
              <Input
                id="tenantApartment"
                value={formData.tenantApartment || ""}
                onChange={e => onChange("tenantApartment", e.target.value)}
                placeholder="Enter apartment or suite number (if applicable)"
              />
            </div>
            
            {/* Municipality */}
            <div className="space-y-2">
              <Label htmlFor="tenantMunicipality">Municipality</Label>
              <Input
                id="tenantMunicipality"
                value={formData.tenantMunicipality || ""}
                onChange={e => onChange("tenantMunicipality", e.target.value)}
                placeholder="Enter municipality"
              />
            </div>
            
            {/* Postal Code */}
            <div className="space-y-2">
              <Label htmlFor="tenantPostalCode">Postal Code</Label>
              <Input
                id="tenantPostalCode"
                value={formData.tenantPostalCode || ""}
                onChange={e => onChange("tenantPostalCode", e.target.value)}
                placeholder="Enter postal code"
              />
            </div>
            
            {/* Telephone */}
            <div className="space-y-2">
              <Label htmlFor="tenantTelephone">Telephone</Label>
              <Input
                id="tenantTelephone"
                value={formData.tenantTelephone || ""}
                onChange={e => onChange("tenantTelephone", e.target.value)}
                placeholder="Enter telephone number"
              />
            </div>
            
            {/* Cell Phone */}
            <div className="space-y-2">
              <Label htmlFor="tenantCellPhone">Cell Phone</Label>
              <Input
                id="tenantCellPhone"
                value={formData.tenantCellPhone || ""}
                onChange={e => onChange("tenantCellPhone", e.target.value)}
                placeholder="Enter cell phone number"
              />
            </div>
            
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="tenantEmail">Email</Label>
              <Input
                id="tenantEmail"
                value={formData.tenantEmail || ""}
                onChange={e => onChange("tenantEmail", e.target.value)}
                placeholder="Enter email address"
              />
            </div>

            {/* Second Tenant Section */}
            <div className="col-span-2 mt-6">
              <h3 className="text-lg font-medium mb-2">Second Tenant (if applicable)</h3>
            </div>
            
            {/* Second Tenant Name */}
            <div className="space-y-2">
              <Label htmlFor="secondTenantName">Tenant Name</Label>
              <Input
                id="secondTenantName"
                value={formData.secondTenantName || ""}
                onChange={e => onChange("secondTenantName", e.target.value)}
                placeholder="Enter second tenant name"
              />
            </div>
            
            {/* Second Tenant Street Number */}
            <div className="space-y-2">
              <Label htmlFor="secondTenantStreetNumber">Street Number</Label>
              <Input
                id="secondTenantStreetNumber"
                value={formData.secondTenantStreetNumber || ""}
                onChange={e => onChange("secondTenantStreetNumber", e.target.value)}
                placeholder="Enter street number"
              />
            </div>
            
            {/* Second Tenant Street Name */}
            <div className="space-y-2">
              <Label htmlFor="secondTenantStreetName">Street Name</Label>
              <Input
                id="secondTenantStreetName"
                value={formData.secondTenantStreetName || ""}
                onChange={e => onChange("secondTenantStreetName", e.target.value)}
                placeholder="Enter street name"
              />
            </div>
            
            {/* Second Tenant Apartment */}
            <div className="space-y-2">
              <Label htmlFor="secondTenantApartment">Apartment/Suite</Label>
              <Input
                id="secondTenantApartment"
                value={formData.secondTenantApartment || ""}
                onChange={e => onChange("secondTenantApartment", e.target.value)}
                placeholder="Enter apartment or suite number (if applicable)"
              />
            </div>
            
            {/* Second Tenant Municipality */}
            <div className="space-y-2">
              <Label htmlFor="secondTenantMunicipality">Municipality</Label>
              <Input
                id="secondTenantMunicipality"
                value={formData.secondTenantMunicipality || ""}
                onChange={e => onChange("secondTenantMunicipality", e.target.value)}
                placeholder="Enter municipality"
              />
            </div>
            
            {/* Second Tenant Postal Code */}
            <div className="space-y-2">
              <Label htmlFor="secondTenantPostalCode">Postal Code</Label>
              <Input
                id="secondTenantPostalCode"
                value={formData.secondTenantPostalCode || ""}
                onChange={e => onChange("secondTenantPostalCode", e.target.value)}
                placeholder="Enter postal code"
              />
            </div>
            
            {/* Second Tenant Telephone */}
            <div className="space-y-2">
              <Label htmlFor="secondTenantTelephone">Telephone</Label>
              <Input
                id="secondTenantTelephone"
                value={formData.secondTenantTelephone || ""}
                onChange={e => onChange("secondTenantTelephone", e.target.value)}
                placeholder="Enter telephone number"
              />
            </div>
            
            {/* Second Tenant Cell Phone */}
            <div className="space-y-2">
              <Label htmlFor="secondTenantCellPhone">Cell Phone</Label>
              <Input
                id="secondTenantCellPhone"
                value={formData.secondTenantCellPhone || ""}
                onChange={e => onChange("secondTenantCellPhone", e.target.value)}
                placeholder="Enter cell phone number"
              />
            </div>
            
            {/* Second Tenant Email */}
            <div className="space-y-2">
              <Label htmlFor="secondTenantEmail">Email</Label>
              <Input
                id="secondTenantEmail"
                value={formData.secondTenantEmail || ""}
                onChange={e => onChange("secondTenantEmail", e.target.value)}
                placeholder="Enter email address"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
}
