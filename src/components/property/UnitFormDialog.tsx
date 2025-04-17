
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UnitTemplate } from "@/types/unit-template";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";

interface UnitFormDialogProps {
  propertyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUnit?: any;
  isEditMode?: boolean;
  onUnitCreated: () => void;
  onUnitUpdated: () => void;
}

// Define our comprehensive form schema
const unitFormSchema = z.object({
  // Basic Unit Identification
  unit_number: z.string().min(1, { message: "Unit number is required" }),
  floor_number: z.string().optional(),
  unit_type: z.string().optional(),
  square_feet: z.string().optional(),
  
  // Physical Characteristics
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  other_rooms: z.string().optional(),
  has_balcony: z.boolean().default(false),
  balcony_size: z.string().optional(),
  has_storage: z.boolean().default(false),
  storage_location: z.string().optional(),
  storage_number: z.string().optional(),
  has_parking: z.boolean().default(false),
  parking_number: z.string().optional(),
  parking_location: z.string().optional(),
  parking_type: z.string().optional(),
  
  // Rental Terms
  monthly_rent: z.string().optional(),
  rent_due_date: z.string().default("1"),
  payment_method: z.string().optional(),
  additional_fees: z.string().optional(),
  rent_increase_history: z.string().optional(),
  previous_tenant_rent: z.string().optional(),
  
  // Utilities and Services
  heating_included: z.boolean().default(false),
  heating_type: z.string().optional(),
  electricity_included: z.boolean().default(false),
  water_included: z.boolean().default(false),
  internet_included: z.boolean().default(false),
  hot_water_included: z.boolean().default(false),
  air_conditioning_included: z.boolean().default(false),
  air_conditioning_type: z.string().optional(),
  other_services: z.string().optional(),
  
  // Appliances and Furnishings
  has_refrigerator: z.boolean().default(false),
  refrigerator_owner: z.string().optional(),
  has_stove: z.boolean().default(false),
  stove_owner: z.string().optional(),
  has_dishwasher: z.boolean().default(false),
  dishwasher_owner: z.string().optional(),
  has_washer: z.boolean().default(false),
  washer_owner: z.string().optional(),
  has_dryer: z.boolean().default(false),
  dryer_owner: z.string().optional(),
  has_microwave: z.boolean().default(false),
  microwave_owner: z.string().optional(),
  furniture_list: z.string().optional(),
  fixtures_inventory: z.string().optional(),
  
  // Access Details
  keys_provided: z.string().optional(),
  mailbox_number: z.string().optional(),
  entry_system_info: z.string().optional(),
  parking_spot_numbers: z.string().optional(),
  storage_locker_number: z.string().optional(),
  
  // Unit Condition
  last_renovation_date: z.string().optional(),
  condition_report: z.string().optional(),
  known_defects: z.string().optional(),
  maintenance_requirements: z.string().optional(),
  
  // Lease Restrictions
  unit_restrictions: z.string().optional(),
  pet_policy: z.string().optional(),
  smoking_policy: z.string().optional(),
  subletting_policy: z.string().optional(),
  
  // Additional Lease Terms
  lease_length: z.string().optional(),
  lease_start_date: z.string().optional(),
  lease_end_date: z.string().optional(),
  renewal_terms: z.string().optional(),
  special_conditions: z.string().optional(),
  
  // Tenant assignment (for edit mode)
  tenant_id: z.string().optional(),
});

type UnitFormValues = z.infer<typeof unitFormSchema>;

export function UnitFormDialog({
  propertyId,
  open,
  onOpenChange,
  selectedUnit,
  isEditMode = false,
  onUnitCreated,
  onUnitUpdated,
}: UnitFormDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");
  
  // Setup form with default values
  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: {
      unit_number: "",
      floor_number: "",
      unit_type: "",
      square_feet: "",
      bedrooms: "",
      bathrooms: "",
      other_rooms: "",
      has_balcony: false,
      balcony_size: "",
      has_storage: false,
      storage_location: "",
      storage_number: "",
      has_parking: false,
      parking_number: "",
      parking_location: "",
      parking_type: "",
      monthly_rent: "",
      rent_due_date: "1",
      payment_method: "",
      additional_fees: "",
      rent_increase_history: "",
      previous_tenant_rent: "",
      heating_included: false,
      heating_type: "",
      electricity_included: false,
      water_included: false,
      internet_included: false,
      hot_water_included: false,
      air_conditioning_included: false,
      air_conditioning_type: "",
      other_services: "",
      has_refrigerator: false,
      refrigerator_owner: "",
      has_stove: false,
      stove_owner: "",
      has_dishwasher: false,
      dishwasher_owner: "",
      has_washer: false,
      washer_owner: "",
      has_dryer: false,
      dryer_owner: "",
      has_microwave: false,
      microwave_owner: "",
      furniture_list: "",
      fixtures_inventory: "",
      keys_provided: "",
      mailbox_number: "",
      entry_system_info: "",
      parking_spot_numbers: "",
      storage_locker_number: "",
      last_renovation_date: "",
      condition_report: "",
      known_defects: "",
      maintenance_requirements: "",
      unit_restrictions: "",
      pet_policy: "",
      smoking_policy: "",
      subletting_policy: "",
      lease_length: "",
      lease_start_date: "",
      lease_end_date: "",
      renewal_terms: "",
      special_conditions: "",
      tenant_id: undefined,
    },
  });

  // Load unit templates for dropdown
  const { data: templates = [] } = useQuery({
    queryKey: ["unit-templates", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("unit_templates")
        .select("*")
        .eq("property_id", propertyId)
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  // Load available tenants for dropdown (only in edit mode)
  const { data: availableTenants = [] } = useQuery({
    queryKey: ["available-tenants", propertyId, selectedUnit?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("id, first_name, last_name, lease_status")
        .eq("property_id", propertyId)
        .or('unit_number.is.null,and(id.eq.' + (selectedUnit?.tenant_id || 'null') + ')');

      if (error) throw error;
      return data || [];
    },
    enabled: isEditMode,
  });

  // Get user profile for organization_id
  const { data: userProfile } = useQuery({
    queryKey: ["user-profile"],
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

  // Populate form with selected unit data when editing
  useEffect(() => {
    if (selectedUnit && isEditMode) {
      // Reset form with selected unit values
      form.reset({
        unit_number: selectedUnit.unit_number || "",
        floor_number: selectedUnit.floor_number?.toString() || "",
        unit_type: selectedUnit.unit_type || "",
        square_feet: selectedUnit.square_feet?.toString() || "",
        bedrooms: selectedUnit.bedrooms?.toString() || "",
        bathrooms: selectedUnit.bathrooms?.toString() || "",
        // ... populate all other fields from selectedUnit
        monthly_rent: selectedUnit.monthly_rent?.toString() || "",
        rent_due_date: selectedUnit.rent_due_date?.toString() || "1",
        tenant_id: selectedUnit.tenant_id || undefined,
        // Any existing fields from the database
      });
    }
  }, [selectedUnit, isEditMode, form]);

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    if (templateId === "none") return;
    
    const template = templates.find(t => t.id === templateId);
    if (template) {
      // Apply template values to form
      form.setValue("bedrooms", template.bedrooms?.toString() || "");
      form.setValue("bathrooms", template.bathrooms?.toString() || "");
      form.setValue("square_feet", template.square_feet?.toString() || "");
      form.setValue("monthly_rent", template.monthly_rent?.toString() || "");
      form.setValue("rent_due_date", template.rent_due_date?.toString() || "1");
      form.setValue("unit_type", template.unit_type || "");
      form.setValue("floor_number", template.floor_number?.toString() || "");
      
      toast({
        title: "Template Applied",
        description: `The template "${template.name}" has been applied to this unit.`,
      });
    }
  };

  // Form submission handler
  const onSubmit = async (values: UnitFormValues) => {
    try {
      if (!userProfile?.organization_id) {
        throw new Error("No organization found");
      }

      // Convert form values to appropriate types
      const unitData = {
        property_id: propertyId,
        organization_id: userProfile.organization_id,
        unit_number: values.unit_number,
        floor_number: values.floor_number ? parseInt(values.floor_number) : null,
        unit_type: values.unit_type || null,
        square_feet: values.square_feet ? parseInt(values.square_feet) : null,
        bedrooms: values.bedrooms ? parseInt(values.bedrooms) : null,
        bathrooms: values.bathrooms ? parseFloat(values.bathrooms) : null,
        monthly_rent: values.monthly_rent ? parseFloat(values.monthly_rent) : null,
        rent_due_date: values.rent_due_date ? parseInt(values.rent_due_date) : 1,
        // Additional properties from the form
        // You'll want to add additional database columns for all these new fields
        status: values.tenant_id ? 'occupied' : 'vacant',
      };

      if (isEditMode && selectedUnit) {
        // Check if unit number is already in use by another unit
        const { data: existingUnit } = await supabase
          .from("units")
          .select("id")
          .eq("property_id", propertyId)
          .eq("unit_number", values.unit_number)
          .neq("id", selectedUnit.id)
          .maybeSingle();

        if (existingUnit) {
          toast({
            title: "Error",
            description: `Unit number ${values.unit_number} already exists in this property`,
            variant: "destructive",
          });
          return;
        }

        // Update existing unit
        const { error } = await supabase
          .from("units")
          .update({
            ...unitData,
            tenant_id: values.tenant_id || null,
          })
          .eq("id", selectedUnit.id);

        if (error) throw error;

        // Update tenant's unit_number if a tenant is assigned
        if (values.tenant_id) {
          await supabase
            .from("tenants")
            .update({ unit_number: values.unit_number })
            .eq("id", values.tenant_id);
        }

        toast({
          title: "Success",
          description: "Unit updated successfully",
        });

        onUnitUpdated();
      } else {
        // Check if unit number is already in use
        const { data: existingUnit } = await supabase
          .from("units")
          .select("id")
          .eq("property_id", propertyId)
          .eq("unit_number", values.unit_number)
          .maybeSingle();

        if (existingUnit) {
          toast({
            title: "Error",
            description: `Unit number ${values.unit_number} already exists in this property`,
            variant: "destructive",
          });
          return;
        }

        // Create new unit
        const { error } = await supabase
          .from("units")
          .insert(unitData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Unit created successfully",
        });

        onUnitCreated();
      }

      // Close dialog and reset form
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error saving unit:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save unit",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) {
        form.reset();
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[1100px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Unit" : "Add New Unit"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the unit details." : "Enter the details for the new unit."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {!isEditMode && (
              <div className="grid gap-2">
                <Label htmlFor="template">Use Template</Label>
                <Select
                  onValueChange={handleTemplateSelect}
                  defaultValue="none"
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select a template</SelectItem>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                        {template.bedrooms && template.bathrooms && (
                          <span className="text-muted-foreground ml-2">
                            ({template.bedrooms} bed / {template.bathrooms} bath)
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="physical">Physical</TabsTrigger>
                <TabsTrigger value="rental">Rental Terms</TabsTrigger>
                <TabsTrigger value="other">Additional Info</TabsTrigger>
              </TabsList>

              {/* Creating a fixed height container for all tab content */}
              <div className="relative min-h-[600px]">
                {/* Basic Unit Information */}
                <TabsContent value="basic" className="space-y-6 absolute w-full">
                  <div className="grid grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="unit_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit Number*</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="floor_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Floor Number</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="square_feet"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Square Feet</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="unit_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select unit type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="apartment">Apartment</SelectItem>
                              <SelectItem value="studio">Studio</SelectItem>
                              <SelectItem value="loft">Loft</SelectItem>
                              <SelectItem value="duplex">Duplex</SelectItem>
                              <SelectItem value="penthouse">Penthouse</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="other_rooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Other Rooms</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* Physical Characteristics */}
                <TabsContent value="physical" className="space-y-6 absolute w-full">
                  <div className="grid grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bedrooms</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bathrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bathrooms</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.5" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="border rounded-md p-6">
                      <h3 className="font-medium mb-4">Balcony/Terrace</h3>
                      <div className="grid grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="has_balcony"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox 
                                  checked={field.value} 
                                  onCheckedChange={field.onChange} 
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Has Balcony/Terrace</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="balcony_size"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Balcony Size</FormLabel>
                              <FormControl>
                                <Input {...field} disabled={!form.watch("has_balcony")} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="border rounded-md p-6">
                      <h3 className="font-medium mb-4">Storage Space</h3>
                      <div className="grid grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="has_storage"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox 
                                  checked={field.value} 
                                  onCheckedChange={field.onChange} 
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Has Storage</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="storage_location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input {...field} disabled={!form.watch("has_storage")} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="mt-4">
                        <FormField
                          control={form.control}
                          name="storage_number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Storage Number</FormLabel>
                              <FormControl>
                                <Input {...field} disabled={!form.watch("has_storage")} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-6">
                    <h3 className="font-medium mb-4">Parking Space</h3>
                    <div className="grid grid-cols-4 gap-6">
                      <FormField
                        control={form.control}
                        name="has_parking"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox 
                                checked={field.value} 
                                onCheckedChange={field.onChange} 
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Has Parking</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="parking_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={!form.watch("has_parking")} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="parking_location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={!form.watch("has_parking")} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="parking_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              disabled={!form.watch("has_parking")}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="indoor">Indoor</SelectItem>
                                <SelectItem value="outdoor">Outdoor</SelectItem>
                                <SelectItem value="covered">Covered</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Rental Terms */}
                <TabsContent value="rental" className="space-y-6 absolute w-full">
                  <div className="grid grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="monthly_rent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Rent</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.01" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="rent_due_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rent Due Date</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose a date" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                <SelectItem key={day} value={day.toString()}>
                                  {day} of each month
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
                      name="payment_method"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="check">Check</SelectItem>
                              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                              <SelectItem value="credit_card">Credit Card</SelectItem>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="additional_fees"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Fees</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="previous_tenant_rent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Previous Tenant's Rent</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.01" />
                          </FormControl>
                          <FormDescription>
                            Required for buildings less than 5 years old
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="rent_increase_history"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rent Increase History</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {isEditMode && (
                      <FormField
                        control={form.control}
                        name="tenant_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assign Tenant</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a tenant" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">None</SelectItem>
                                {availableTenants.map((tenant) => (
                                  <SelectItem key={tenant.id} value={tenant.id}>
                                    {tenant.first_name} {tenant.last_name}
                                    {tenant.lease_status !== 'active' && (
                                      <span className="ml-2 text-xs text-muted-foreground">
                                        ({tenant.lease_status})
                                      </span>
                                    )}
                                  </SelectItem>
                                ))}
                                {selectedUnit?.tenant_id && selectedUnit?.tenants && (
                                  <SelectItem value={selectedUnit.tenant_id}>
                                    {selectedUnit.tenants.first_name} {selectedUnit.tenants.last_name} (Current)
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </TabsContent>

                {/* Additional Info (this tab contains multiple sections) */}
                <TabsContent value="other" className="space-y-6 absolute w-full">
                  {/* Utilities and Services */}
                  <div className="border rounded-md p-6">
                    <h3 className="font-medium mb-4">Utilities and Services</h3>
                    <div className="grid grid-cols-4 gap-6">
                      <FormField
                        control={form.control}
                        name="heating_included"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox 
                                checked={field.value} 
                                onCheckedChange={field.onChange} 
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Heating Included</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="electricity_included"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox 
                                checked={field.value} 
                                onCheckedChange={field.onChange} 
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Electricity Included</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="water_included"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox 
                                checked={field.value} 
                                onCheckedChange={field.onChange} 
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Water Included</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="internet_included"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox 
                                checked={field.value} 
                                onCheckedChange={field.onChange} 
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Internet Included</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="hot_water_included"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox 
                                checked={field.value} 
                                onCheckedChange={field.onChange} 
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Hot Water Included</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="air_conditioning_included"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox 
                                checked={field.value} 
                                onCheckedChange={field.onChange} 
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>A/C Included</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 mt-6">
                      <FormField
                        control={form.control}
                        name="heating_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Heating Type</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="air_conditioning_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>A/C Type</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="mt-6">
                      <FormField
                        control={form.control}
                        name="other_services"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Other Services</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  {/* Appliances */}
                  <div className="border rounded-md p-6">
                    <h3 className="font-medium mb-4">Appliances and Furnishings</h3>
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <FormField
                          control={form.control}
                          name="has_refrigerator"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-3">
                              <FormControl>
                                <Checkbox 
                                  checked={field.value} 
                                  onCheckedChange={field.onChange} 
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Refrigerator</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        {form.watch("has_refrigerator") && (
                          <FormField
                            control={form.control}
                            name="refrigerator_owner"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Owner</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select owner" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="landlord">Landlord</SelectItem>
                                    <SelectItem value="tenant">Tenant</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                      
                      <div>
                        <FormField
                          control={form.control}
                          name="has_stove"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-3">
                              <FormControl>
                                <Checkbox 
                                  checked={field.value} 
                                  onCheckedChange={field.onChange} 
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Stove</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        {form.watch("has_stove") && (
                          <FormField
                            control={form.control}
                            name="stove_owner"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Owner</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select owner" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="landlord">Landlord</SelectItem>
                                    <SelectItem value="tenant">Tenant</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                      
                      <div>
                        <FormField
                          control={form.control}
                          name="has_dishwasher"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-3">
                              <FormControl>
                                <Checkbox 
                                  checked={field.value} 
                                  onCheckedChange={field.onChange} 
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Dishwasher</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        {form.watch("has_dishwasher") && (
                          <FormField
                            control={form.control}
                            name="dishwasher_owner"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Owner</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select owner" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="landlord">Landlord</SelectItem>
                                    <SelectItem value="tenant">Tenant</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <FormField
                        control={form.control}
                        name="furniture_list"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Furniture List</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  {/* Lease Restrictions */}
                  <div className="border rounded-md p-6">
                    <h3 className="font-medium mb-4">Lease Restrictions</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="pet_policy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pet Policy</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="smoking_policy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Smoking Policy</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditMode ? "Update Unit" : "Create Unit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
