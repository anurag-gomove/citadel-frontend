
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { 
  Calendar, 
  User, 
  Home, 
  CreditCard, 
  Phone,
  Languages,
  FileText,
  DollarSign,
  Lock
} from "lucide-react";

interface Tenant {
  id: string;
  first_name: string;
  last_name: string;
  credit_score?: number | null;
  previous_address?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  preferred_language?: string | null;
  notes?: string | null;
  phone?: string | null;
}

interface Unit {
  id: string;
  unit_number: string;
  monthly_rent?: number;
}

interface AddTenantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    tenant_id: string;
    unit_number: string;
    lease_start_date: string;
    lease_end_date: string;
    credit_score?: number;
    previous_address?: string;
    monthly_rent?: number;
    security_deposit?: number;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    notes?: string;
    preferred_language?: string;
  }) => void;
  availableTenants: Tenant[];
  availableUnits: Unit[];
}

export const AddTenantDialog = ({
  isOpen,
  onClose,
  onAdd,
  availableTenants,
  availableUnits,
}: AddTenantDialogProps) => {
  const [formData, setFormData] = useState({
    tenant_id: "",
    unit_number: "",
    lease_start_date: "",
    lease_end_date: "",
    credit_score: "",
    previous_address: "",
    monthly_rent: "",
    security_deposit: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    notes: "",
    preferred_language: "English",
  });

  // Update monthly rent when unit changes
  useEffect(() => {
    if (formData.unit_number) {
      const selectedUnit = availableUnits.find(unit => unit.unit_number === formData.unit_number);
      if (selectedUnit?.monthly_rent) {
        setFormData(prev => ({
          ...prev,
          monthly_rent: selectedUnit.monthly_rent?.toString() || ""
        }));
      }
    }
  }, [formData.unit_number, availableUnits]);

  // Autopopulate tenant details when tenant is selected
  useEffect(() => {
    if (formData.tenant_id) {
      const selectedTenant = availableTenants.find(tenant => tenant.id === formData.tenant_id);
      
      if (selectedTenant) {
        setFormData(prev => ({
          ...prev,
          credit_score: selectedTenant.credit_score?.toString() || "",
          previous_address: selectedTenant.previous_address || "",
          emergency_contact_name: selectedTenant.emergency_contact_name || "",
          emergency_contact_phone: selectedTenant.emergency_contact_phone || "",
          notes: selectedTenant.notes || "",
          preferred_language: selectedTenant.preferred_language || "English",
        }));
      }
    }
  }, [formData.tenant_id, availableTenants]);

  const resetForm = () => {
    setFormData({
      tenant_id: "",
      unit_number: "",
      lease_start_date: "",
      lease_end_date: "",
      credit_score: "",
      previous_address: "",
      monthly_rent: "",
      security_deposit: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      notes: "",
      preferred_language: "English",
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAdd = () => {
    // Convert numeric fields
    const formattedData = {
      ...formData,
      credit_score: formData.credit_score ? parseInt(formData.credit_score) : undefined,
      monthly_rent: formData.monthly_rent ? parseFloat(formData.monthly_rent) : undefined,
      security_deposit: formData.security_deposit ? parseFloat(formData.security_deposit) : undefined,
    };
    
    onAdd(formattedData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSendRentalApplication = () => {
    // This function will be implemented later to send a rental application
    console.log("Send rental application to tenant:", formData.tenant_id);
    // For now it just logs to the console
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add Tenant to Property</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-6 py-6 max-h-[calc(90vh-12rem)] overflow-y-auto pr-2">
          {/* Tenant & Unit Selection Section */}
          <div className="space-y-4 border rounded-md p-4 bg-slate-50">
            <h3 className="text-md font-medium flex items-center gap-2">
              <User size={18} className="text-primary" />
              Tenant & Unit Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Select Tenant</Label>
                <Select
                  value={formData.tenant_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tenant_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTenants.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {`${tenant.first_name} ${tenant.last_name}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Unit Number</Label>
                <Select
                  value={formData.unit_number}
                  onValueChange={(value) =>
                    setFormData({ ...formData, unit_number: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUnits.map((unit) => (
                      <SelectItem key={unit.id} value={unit.unit_number}>
                        Unit {unit.unit_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Lease Terms Section */}
          <div className="space-y-4 border rounded-md p-4 bg-slate-50">
            <h3 className="text-md font-medium flex items-center gap-2">
              <Calendar size={18} className="text-primary" />
              Lease Terms
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lease Start Date</Label>
                <Input
                  type="date"
                  name="lease_start_date"
                  value={formData.lease_start_date}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Lease End Date</Label>
                <Input
                  type="date"
                  name="lease_end_date"
                  value={formData.lease_end_date}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  Monthly Rent
                  <Lock size={14} className="text-muted-foreground" />
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    <DollarSign size={16} />
                  </span>
                  <Input
                    type="text"
                    name="monthly_rent"
                    placeholder="0.00"
                    value={formData.monthly_rent}
                    readOnly
                    className="pl-8 text-right bg-gray-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Security Deposit</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    <DollarSign size={16} />
                  </span>
                  <Input
                    type="number"
                    name="security_deposit"
                    placeholder="0.00"
                    value={formData.security_deposit}
                    onChange={handleInputChange}
                    className="pl-8 text-right"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tenant Details Section */}
          <div className="space-y-4 border rounded-md p-4 bg-slate-50">
            <h3 className="text-md font-medium flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              Tenant Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Credit Score</Label>
                <Input
                  type="number"
                  name="credit_score"
                  placeholder="Enter credit score"
                  value={formData.credit_score}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Previous Address</Label>
                <Input
                  type="text"
                  name="previous_address"
                  placeholder="Enter previous address"
                  value={formData.previous_address}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Preferred Language</Label>
                <Select
                  value={formData.preferred_language}
                  onValueChange={(value) =>
                    setFormData({ ...formData, preferred_language: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div className="space-y-4 border rounded-md p-4 bg-slate-50">
            <h3 className="text-md font-medium flex items-center gap-2">
              <Phone size={18} className="text-primary" />
              Emergency Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Emergency Contact Name</Label>
                <Input
                  type="text"
                  name="emergency_contact_name"
                  placeholder="Enter emergency contact name"
                  value={formData.emergency_contact_name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Emergency Contact Phone</Label>
                <Input
                  type="text"
                  name="emergency_contact_phone"
                  placeholder="Enter emergency contact phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-4 border rounded-md p-4 bg-slate-50">
            <h3 className="text-md font-medium flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              Additional Notes
            </h3>
            <div>
              <Textarea
                name="notes"
                placeholder="Additional notes about the tenant or lease"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="sm:order-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAdd}
            className="sm:order-2"
          >
            Add Tenant
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleSendRentalApplication}
            className="sm:order-3"
          >
            Send Rental Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Define and export the PropertyOverview component
export const PropertyOverview = ({ property }: { property: any }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Property Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 border rounded-md bg-card">
          <h3 className="font-medium mb-2">Property Information</h3>
          <p className="text-sm text-muted-foreground">{property.address}</p>
        </div>
      </div>
    </div>
  );
};
