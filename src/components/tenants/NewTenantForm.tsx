
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tenant, LeaseStatus } from "@/types/database";
import { FormInput } from "@/components/FormInput";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useQuery } from "@tanstack/react-query";

interface NewTenantFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function NewTenantForm({ onSuccess, onCancel }: NewTenantFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    other_phone: "",
    lease_status: "pending" as LeaseStatus,
    credit_score: "",
    previous_address: "",
    street_number: "",
    street_name: "",
    apartment: "",
    city: "",
    zipcode: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    notes: "",
    preferred_language: "",
    status: "active", // Default status for new tenants
  });

  // Fetch the user's organization ID
  const { data: userOrgData } = useQuery({
    queryKey: ["userOrganization"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user found");
      
      const { data, error } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();
      
      if (error) throw error;
      console.log("User organization data:", data);
      return data;
    }
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!userOrgData?.organization_id) {
        throw new Error("No organization ID found for current user");
      }

      // Process numeric values
      const processedData = {
        ...formData,
        organization_id: userOrgData.organization_id, // Add the organization_id
        credit_score: formData.credit_score 
          ? parseInt(formData.credit_score) 
          : null,
        // Explicitly ensure all fields are included with proper null handling
        emergency_contact_name: formData.emergency_contact_name || null,
        emergency_contact_phone: formData.emergency_contact_phone || null,
        notes: formData.notes || null,
        preferred_language: formData.preferred_language || null,
        street_number: formData.street_number || null,
        street_name: formData.street_name || null,
        apartment: formData.apartment || null,
        city: formData.city || null,
        zipcode: formData.zipcode || null,
        other_phone: formData.other_phone || null
      };

      console.log("Submitting tenant data:", processedData);

      const { data, error } = await supabase.from("tenants").insert(processedData).select();

      if (error) {
        console.error("Detailed error:", error);
        throw error;
      }

      console.log("Tenant created successfully:", data);

      toast({
        title: "Success",
        description: "Tenant created successfully",
      });

      // Refresh tenants data
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      onSuccess();
    } catch (error) {
      console.error("Error creating tenant:", error);
      toast({
        title: "Error",
        description: "Failed to create tenant",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="First Name"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          required
        />
        <FormInput
          label="Last Name"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          required
        />
        <FormInput
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <FormInput
          label="Phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />
        <FormInput
          label="Other Phone"
          name="other_phone"
          value={formData.other_phone}
          onChange={handleChange}
        />
        
        {/* Current Address Fields */}
        <div className="col-span-1 md:col-span-2">
          <h3 className="text-sm font-medium mb-2">Current Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="Street No"
              name="street_number"
              value={formData.street_number}
              onChange={handleChange}
            />
            <div className="md:col-span-2">
              <FormInput
                label="Street Name"
                name="street_name"
                value={formData.street_name}
                onChange={handleChange}
              />
            </div>
            <FormInput
              label="App."
              name="apartment"
              value={formData.apartment}
              onChange={handleChange}
            />
            <FormInput
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
            <FormInput
              label="Zipcode"
              name="zipcode"
              value={formData.zipcode}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Lease Status</Label>
          <Select
            value={formData.lease_status}
            onValueChange={(value) => handleSelectChange("lease_status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <FormInput
          label="Credit Score"
          type="number"
          name="credit_score"
          value={formData.credit_score}
          onChange={handleChange}
        />
        <div className="col-span-1 md:col-span-2">
          <FormInput
            label="Previous Address"
            name="previous_address"
            value={formData.previous_address}
            onChange={handleChange}
          />
        </div>
        <FormInput
          label="Emergency Contact Name"
          name="emergency_contact_name"
          value={formData.emergency_contact_name}
          onChange={handleChange}
        />
        <FormInput
          label="Emergency Contact Phone"
          name="emergency_contact_phone"
          value={formData.emergency_contact_phone}
          onChange={handleChange}
        />
        <div className="space-y-2">
          <Label>Preferred Language</Label>
          <Select
            value={formData.preferred_language}
            onValueChange={(value) => handleSelectChange("preferred_language", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="French">French</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-1 md:col-span-2">
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="resize-none"
              placeholder="Additional information about the tenant"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="ml-2"
        >
          {isSubmitting ? "Creating..." : "Create Tenant"}
        </Button>
        <Button 
          type="button"
          variant="secondary"
          disabled={isSubmitting}
          onClick={() => {
            console.log("Send rental application clicked");
            toast({
              title: "Feature Coming Soon",
              description: "Rental application sending will be available in a future update.",
            });
          }}
        >
          Send Application
        </Button>
      </div>
    </form>
  );
}
