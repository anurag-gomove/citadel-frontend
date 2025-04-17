
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tenant, LeaseStatus } from "@/types/database";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface TenantProfileProps {
  tenant: Tenant;
  property: any | null;
  isPropertyLoading?: boolean;
  alwaysEditable?: boolean;
  onSave?: (data: Partial<Tenant>) => void;
}

export const TenantProfile: React.FC<TenantProfileProps> = ({ 
  tenant, 
  property,
  isPropertyLoading = false,
  alwaysEditable = false,
  onSave
}) => {
  const [availableUnits, setAvailableUnits] = useState<{id: string, unit_number: string}[]>([]);
  const [formData, setFormData] = useState({
    first_name: tenant.first_name,
    last_name: tenant.last_name,
    email: tenant.email,
    phone: tenant.phone || "",
    other_phone: tenant.other_phone || "",
    unit_number: tenant.unit_number || "",
    preferred_language: tenant.preferred_language || "English",
    emergency_contact_name: tenant.emergency_contact_name || "",
    emergency_contact_phone: tenant.emergency_contact_phone || "",
    street_number: tenant.street_number || "",
    street_name: tenant.street_name || "",
    apartment: tenant.apartment || "",
    city: tenant.city || "",
    zipcode: tenant.zipcode || "",
  });

  useEffect(() => {
    if (tenant.property_id) {
      const fetchUnits = async () => {
        const { data, error } = await supabase
          .from('units')
          .select('id, unit_number')
          .eq('property_id', tenant.property_id);
        
        if (error) {
          console.error("Error fetching units:", error);
        } else {
          setAvailableUnits(data || []);
        }
      };
      
      fetchUnits();
    }
  }, [tenant.property_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    setFormData({
      first_name: tenant.first_name,
      last_name: tenant.last_name,
      email: tenant.email,
      phone: tenant.phone || "",
      other_phone: tenant.other_phone || "",
      unit_number: tenant.unit_number || "",
      preferred_language: tenant.preferred_language || "English",
      emergency_contact_name: tenant.emergency_contact_name || "",
      emergency_contact_phone: tenant.emergency_contact_phone || "",
      street_number: tenant.street_number || "",
      street_name: tenant.street_name || "",
      apartment: tenant.apartment || "",
      city: tenant.city || "",
      zipcode: tenant.zipcode || "",
    });
  }, [tenant]);

  const handleSave = () => {
    if (onSave) {
      onSave({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        other_phone: formData.other_phone,
        preferred_language: formData.preferred_language,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone,
        street_number: formData.street_number,
        street_name: formData.street_name,
        apartment: formData.apartment,
        city: formData.city,
        zipcode: formData.zipcode,
      });
    }
  };

  const getLeaseStatusBadge = (status: LeaseStatus) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Active
          </Badge>
        );
      case "inactive":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Inactive
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const getApplicationStatusBadge = (status?: string | null) => {
    if (!status) return (
      <Badge variant="outline" className="bg-gray-100 text-gray-800">
        Not Started
      </Badge>
    );

    switch (status) {
      case "not_sent":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            Not Sent
          </Badge>
        );
      case "sent":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            Sent
          </Badge>
        );
      case "received":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            Received
          </Badge>
        );
      case "under_review":
        return (
          <Badge className="bg-purple-100 text-purple-800">
            Under Review
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800">
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800">
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Tenant Details</CardTitle>
          {onSave && (
            <Button onClick={handleSave} size="sm">
              Save Changes
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Personal Information Section */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input 
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input 
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Current Address Section */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Current Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="street_number">Street No</Label>
                <Input 
                  id="street_number"
                  name="street_number"
                  value={formData.street_number}
                  onChange={handleChange}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="street_name">Street Name</Label>
                <Input 
                  id="street_name"
                  name="street_name"
                  value={formData.street_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="apartment">App.</Label>
                <Input 
                  id="apartment"
                  name="apartment"
                  value={formData.apartment}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input 
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="zipcode">Zipcode</Label>
                <Input 
                  id="zipcode"
                  name="zipcode"
                  value={formData.zipcode}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="other_phone">Other Phone</Label>
                <Input 
                  id="other_phone"
                  name="other_phone"
                  value={formData.other_phone}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="preferred_language">Preferred Language</Label>
                <Select 
                  value={formData.preferred_language} 
                  onValueChange={(value) => handleSelectChange('preferred_language', value)}
                >
                  <SelectTrigger id="preferred_language" className="w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Housing Information Section */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Housing Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="property">Property</Label>
                {isPropertyLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <div className="h-10 px-3 py-2 border rounded-md bg-muted text-muted-foreground">
                    {property?.name || "Not assigned"}
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="unit_number">Unit</Label>
                <div className="h-10 px-3 py-2 border rounded-md bg-muted text-muted-foreground">
                  {tenant.unit_number || "Not assigned"}
                </div>
              </div>
            </div>
          </div>

          {/* Status Information Section */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Status Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Lease Status</Label>
                <div className="h-10 flex items-center">
                  {getLeaseStatusBadge(tenant.lease_status)}
                </div>
              </div>
              <div>
                <Label>Application Status</Label>
                <div className="h-10 flex items-center">
                  {getApplicationStatusBadge(tenant.application_status)}
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergency_contact_name">Name</Label>
                <Input 
                  id="emergency_contact_name"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="emergency_contact_phone">Phone</Label>
                <Input 
                  id="emergency_contact_phone"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
