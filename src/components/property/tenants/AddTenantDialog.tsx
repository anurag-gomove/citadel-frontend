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
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calendar, 
  User, 
  Home, 
  CreditCard, 
  Phone,
  Languages,
  FileText,
  DollarSign,
  Lock,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { preserveExactDate } from "@/utils/timezone";

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
  const { toast } = useToast();
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
  
  const [formErrors, setFormErrors] = useState({
    tenant_id: false,
    unit_number: false,
    lease_start_date: false,
    lease_end_date: false,
  });

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
    setFormErrors({
      tenant_id: false,
      unit_number: false,
      lease_start_date: false,
      lease_end_date: false,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = () => {
    const errors = {
      tenant_id: !formData.tenant_id,
      unit_number: !formData.unit_number,
      lease_start_date: !formData.lease_start_date,
      lease_end_date: !formData.lease_end_date,
    };
    
    setFormErrors(errors);
    
    return !Object.values(errors).some(error => error);
  };

  const handleAdd = () => {
    if (!validateForm()) {
      toast({
        title: "Required fields missing",
        description: "Please fill in all required fields including lease dates.",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Raw form dates:", {
      start: formData.lease_start_date,
      end: formData.lease_end_date
    });
    
    const formattedData = {
      tenant_id: formData.tenant_id,
      unit_number: formData.unit_number,
      lease_start_date: preserveExactDate(formData.lease_start_date),
      lease_end_date: preserveExactDate(formData.lease_end_date),
      credit_score: formData.credit_score ? Number(formData.credit_score) : undefined,
      previous_address: formData.previous_address || undefined,
      monthly_rent: formData.monthly_rent ? Number(formData.monthly_rent) : undefined,
      security_deposit: formData.security_deposit ? Number(formData.security_deposit) : undefined,
      emergency_contact_name: formData.emergency_contact_name || undefined,
      emergency_contact_phone: formData.emergency_contact_phone || undefined,
      notes: formData.notes || undefined,
      preferred_language: formData.preferred_language || "English",
    };
    
    console.log("Submitting lease dates:", {
      start: formattedData.lease_start_date,
      end: formattedData.lease_end_date
    });
    
    onAdd(formattedData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name in formErrors) {
      setFormErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  const handleSendRentalApplication = () => {
    console.log("Send rental application to tenant:", formData.tenant_id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Tenant to Property</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4 max-h-[calc(90vh-12rem)]">
          <div className="grid grid-cols-1 gap-6 py-6">
            <div className="space-y-4 border rounded-md p-4 bg-slate-50">
              <h3 className="text-md font-medium flex items-center gap-2">
                <User size={18} className="text-primary" />
                Tenant & Unit Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center">
                    Select Tenant <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Select
                    value={formData.tenant_id}
                    onValueChange={(value) => {
                      setFormData({ ...formData, tenant_id: value });
                      setFormErrors(prev => ({ ...prev, tenant_id: false }));
                    }}
                  >
                    <SelectTrigger className={formErrors.tenant_id ? "border-destructive" : ""}>
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
                  {formErrors.tenant_id && (
                    <p className="text-destructive text-sm">Tenant is required</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center">
                    Unit Number <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Select
                    value={formData.unit_number}
                    onValueChange={(value) => {
                      setFormData({ ...formData, unit_number: value });
                      setFormErrors(prev => ({ ...prev, unit_number: false }));
                    }}
                  >
                    <SelectTrigger className={formErrors.unit_number ? "border-destructive" : ""}>
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
                  {formErrors.unit_number && (
                    <p className="text-destructive text-sm">Unit is required</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 border rounded-md p-4 bg-slate-50">
              <h3 className="text-md font-medium flex items-center gap-2">
                <Calendar size={18} className="text-primary" />
                Lease Terms
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center">
                    Lease Start Date <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Input
                    type="date"
                    name="lease_start_date"
                    value={formData.lease_start_date}
                    onChange={handleInputChange}
                    className={formErrors.lease_start_date ? "border-destructive" : ""}
                  />
                  {formErrors.lease_start_date && (
                    <p className="text-destructive text-sm">Start date is required</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center">
                    Lease End Date <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Input
                    type="date"
                    name="lease_end_date"
                    value={formData.lease_end_date}
                    onChange={handleInputChange}
                    className={formErrors.lease_end_date ? "border-destructive" : ""}
                  />
                  {formErrors.lease_end_date && (
                    <p className="text-destructive text-sm">End date is required</p>
                  )}
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

            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <AlertCircle size={16} className="text-destructive" />
              Fields marked with <span className="text-destructive">*</span> are required
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t mt-2">
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
