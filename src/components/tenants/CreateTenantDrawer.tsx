import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormInput } from "@/components/FormInput";
import { Textarea } from "@/components/ui/textarea";

interface CreateTenantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTenantDrawer = ({
  isOpen,
  onClose,
}: CreateTenantDrawerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    credit_score: "",
    previous_address: "",
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      credit_score: "",
      previous_address: "",
      notes: "",
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateTenant = async () => {
    if (!formData.first_name || !formData.last_name || !formData.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("tenants")
        .insert({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone || null,
          property_id: null,
          status: "active",
          credit_score: formData.credit_score ? parseInt(formData.credit_score) : null,
          previous_address: formData.previous_address || null,
          notes: formData.notes || null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tenant has been created",
      });

      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["available-tenants"] });
      handleClose();
    } catch (error) {
      console.error("Error creating tenant:", error);
      toast({
        title: "Error",
        description: "Failed to create tenant",
        variant: "destructive",
      });
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={handleClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create New Tenant</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 py-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                placeholder="Enter first name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="credit_score">Credit Score</Label>
              <Input
                id="credit_score"
                name="credit_score"
                type="number"
                value={formData.credit_score}
                onChange={handleInputChange}
                placeholder="Enter credit score"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="previous_address">Previous Address</Label>
              <Input
                id="previous_address"
                name="previous_address"
                value={formData.previous_address}
                onChange={handleInputChange}
                placeholder="Enter previous address"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Additional notes"
              rows={3}
            />
          </div>
        </div>
        <DrawerFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleCreateTenant}>Create Tenant</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
