import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tenant } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const tenantFormSchema = z.object({
  first_name: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  last_name: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().optional(),
  property_id: z.string().optional().nullable(),
  unit_number: z.string().optional().nullable(),
  lease_status: z.string(),
  lease_start_date: z.string().optional().nullable(),
  lease_end_date: z.string().optional().nullable(),
  credit_score: z.string().optional(),
  previous_address: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  notes: z.string().optional(),
  preferred_language: z.string().default("English"),
});

type TenantFormValues = z.infer<typeof tenantFormSchema>;

interface TenantInfoFormProps {
  tenant: Tenant;
  onSuccess?: () => void;
}

export function TenantInfoForm({ tenant, onSuccess }: TenantInfoFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);

  // Get properties for organization
  const { data: profileData } = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user found");
      
      const { data, error } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Get properties for the current organization
  useQuery({
    queryKey: ["properties", profileData?.organization_id],
    queryFn: async () => {
      if (!profileData?.organization_id) return [];
      
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("organization_id", profileData.organization_id);
      
      if (error) throw error;
      setProperties(data);
      return data;
    },
    enabled: !!profileData?.organization_id,
  });

  // Get units for the selected property
  useQuery({
    queryKey: ["units", tenant.property_id],
    queryFn: async () => {
      if (!tenant.property_id) return [];
      const { data, error } = await supabase
        .from("units")
        .select("*")
        .eq("property_id", tenant.property_id);
      if (error) throw error;
      setUnits(data);
      return data;
    },
    enabled: !!tenant.property_id,
  });

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      first_name: tenant.first_name,
      last_name: tenant.last_name,
      email: tenant.email,
      phone: tenant.phone || "",
      property_id: tenant.property_id || null,
      unit_number: tenant.unit_number || null,
      lease_status: tenant.lease_status || "pending",
      lease_start_date: tenant.lease_start_date || "",
      lease_end_date: tenant.lease_end_date || "",
      credit_score: tenant.credit_score ? String(tenant.credit_score) : "",
      previous_address: tenant.previous_address || "",
      emergency_contact_name: tenant.emergency_contact_name || "",
      emergency_contact_phone: tenant.emergency_contact_phone || "",
      notes: tenant.notes || "",
      preferred_language: tenant.preferred_language || "English",
    },
  });

  const updateTenantMutation = useMutation({
    mutationFn: async (values: TenantFormValues) => {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from("tenants")
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          phone: values.phone || null,
          property_id: values.property_id || null,
          unit_number: values.unit_number || null,
          lease_status: values.lease_status,
          lease_start_date: values.lease_start_date || null,
          lease_end_date: values.lease_end_date || null,
          credit_score: values.credit_score ? parseInt(values.credit_score) : null,
          previous_address: values.previous_address || null,
          emergency_contact_name: values.emergency_contact_name || null,
          emergency_contact_phone: values.emergency_contact_phone || null,
          notes: values.notes || null,
          preferred_language: values.preferred_language || "English",
          updated_at: new Date().toISOString(),
        })
        .eq("id", tenant.id);

      if (error) throw error;
      return null;
    },
    onSuccess: () => {
      setIsSubmitting(false);
      toast({
        title: "Success",
        description: "Tenant information updated successfully",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      setIsSubmitting(false);
      console.error("Error updating tenant:", error);
      toast({
        title: "Error",
        description: "Failed to update tenant information",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: TenantFormValues) {
    updateTenantMutation.mutate(values);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-left">
          <CardTitle className="text-xl">Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Email" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="preferred_language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Language</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="French">French</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="credit_score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credit Score</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Credit score" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="previous_address"
                render={({ field }) => (
                  <FormItem className="text-left">
                    <FormLabel>Previous Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Previous address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="emergency_contact_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Emergency contact name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="emergency_contact_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Emergency contact phone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="property_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* Fix: Replace empty string with a non-empty value */}
                          <SelectItem value="none">None</SelectItem>
                          {properties.map((property) => (
                            <SelectItem key={property.id} value={property.id}>
                              {property.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="unit_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* Fix: Replace empty string with a non-empty value */}
                          <SelectItem value="none">None</SelectItem>
                          {units.map((unit) => (
                            <SelectItem key={unit.id} value={unit.unit_number}>
                              {unit.unit_number}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="lease_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lease Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lease_start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lease Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lease_end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lease End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="text-left">
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional notes about the tenant"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-start">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
