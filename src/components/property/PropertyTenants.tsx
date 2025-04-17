import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { TenantListHeader } from "./tenants/TenantListHeader";
import { TenantList } from "./tenants/TenantList";
import { AddTenantDialog } from "./tenants/AddTenantDialog";
import { RemoveTenantDialog } from "./tenants/RemoveTenantDialog";
import { Tenant } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { formatLocalDate } from "@/utils/timezone";

export const PropertyTenants = ({ propertyId }: { propertyId: string }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tenantToRemove, setTenantToRemove] = useState<{id: string, name: string} | null>(null);
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: propertyOrgData } = useQuery({
    queryKey: ["property-organization", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("organization_id")
        .eq("id", propertyId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: tenantsData, isLoading: tenantsLoading } = useQuery({
    queryKey: ["property-tenants", propertyId],
    queryFn: async () => {
      console.log("Fetching tenants for property:", propertyId);

      const { data: propertyTenants, error: tenantsError } = await supabase
        .from("tenants")
        .select(`
          *,
          properties (
            name,
            address
          )
        `)
        .eq("property_id", propertyId)
        .order("last_name");

      if (tenantsError) {
        console.error("Error fetching property tenants:", tenantsError);
        throw tenantsError;
      }
      
      const { data: units, error: unitError } = await supabase
        .from("units")
        .select(`
          unit_number,
          tenant_id
        `)
        .eq("property_id", propertyId)
        .not("tenant_id", "is", null);

      if (unitError) {
        console.error("Error fetching units with tenants:", unitError);
        throw unitError;
      }

      const tenantIds = units.map(unit => unit.tenant_id);
      
      let unitTenants: any[] = [];
      if (tenantIds.length > 0) {
        const { data: fetchedUnitTenants, error: fetchTenantError } = await supabase
          .from("tenants")
          .select('*')
          .in('id', tenantIds);
          
        if (fetchTenantError) {
          console.error("Error fetching tenants by ID:", fetchTenantError);
          throw fetchTenantError;
        }
        
        unitTenants = fetchedUnitTenants || [];
        
        unitTenants = unitTenants.map(tenant => {
          const matchingUnit = units.find(unit => unit.tenant_id === tenant.id);
          return {
            ...tenant,
            unit_number: matchingUnit ? matchingUnit.unit_number : null
          };
        });
      }

      console.log("Direct property tenants:", propertyTenants);
      console.log("Unit tenants:", unitTenants);
      
      const tenantsMap = new Map();
      
      propertyTenants.forEach(tenant => {
        tenantsMap.set(tenant.id, tenant);
      });
      
      unitTenants.forEach(tenant => {
        if (tenantsMap.has(tenant.id)) {
          const existingTenant = tenantsMap.get(tenant.id);
          existingTenant.unit_number = tenant.unit_number;
          tenantsMap.set(tenant.id, existingTenant);
        } else {
          tenantsMap.set(tenant.id, tenant);
        }
      });
      
      const combinedTenants = Array.from(tenantsMap.values());
      console.log("Combined tenants:", combinedTenants);
      
      return combinedTenants;
    },
  });

  const tenants: Tenant[] = (tenantsData || []).map(tenant => ({
    id: tenant.id,
    first_name: tenant.first_name,
    last_name: tenant.last_name,
    email: tenant.email,
    phone: tenant.phone || null,
    property_id: tenant.property_id,
    unit_id: tenant.unit_id || null,
    unit_number: tenant.unit_number || null,
    lease_status: tenant.lease_status as any || 'pending',
    lease_start_date: tenant.lease_start_date || null,
    lease_end_date: tenant.lease_end_date || null,
    status: tenant.status,
    created_at: tenant.created_at || null,
    updated_at: tenant.updated_at || null,
    credit_score: tenant.credit_score || null,
    previous_address: tenant.previous_address || null,
    emergency_contact_name: tenant.emergency_contact_name || null,
    emergency_contact_phone: tenant.emergency_contact_phone || null,
    notes: tenant.notes || null,
    preferred_language: tenant.preferred_language || null,
    application_status: tenant.application_status || null,
    application_sent_date: tenant.application_sent_date || null,
    application_received_date: tenant.application_received_date || null,
    application_reviewed_date: tenant.application_reviewed_date || null,
    can_send_new_application: tenant.can_send_new_application !== false,
    properties: tenant.properties
  }));

  const { data: availableTenants = [] } = useQuery({
    queryKey: ["available-tenants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select(`
          id,
          first_name,
          last_name,
          credit_score,
          previous_address,
          emergency_contact_name,
          emergency_contact_phone,
          preferred_language,
          notes,
          phone
        `)
        .is("property_id", null)
        .order("last_name");

      if (error) throw error;
      return data;
    },
  });

  const { data: availableUnits = [] } = useQuery({
    queryKey: ["available-units", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("units")
        .select("*")
        .eq("property_id", propertyId)
        .eq("status", "vacant")
        .order("unit_number");

      if (error) throw error;
      return data;
    },
  });

  const addTenantMutation = useMutation({
    mutationFn: async (data: {
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
    }) => {
      if (!propertyOrgData?.organization_id) {
        throw new Error("No organization ID found for this property");
      }

      const {
        tenant_id,
        unit_number,
        lease_start_date,
        lease_end_date,
        ...otherData
      } = data;

      const updateData = {
        property_id: propertyId,
        unit_number,
        lease_start_date,
        lease_end_date,
        lease_status: "active",
        organization_id: propertyOrgData.organization_id,
        ...otherData,
      };

      console.log("Updating tenant with data:", updateData);

      const { data: updatedTenant, error } = await supabase
        .from("tenants")
        .update(updateData)
        .eq("id", tenant_id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return updatedTenant;
    },
    
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["property-tenants", propertyId],
      });
      
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Tenant added to property successfully",
      });
    },
    
    onError: (error) => {
      console.error("Error adding tenant:", error);
      toast({
        title: "Error",
        description: "Failed to add tenant to property",
        variant: "destructive",
      });
    },
  });

  const handleRemoveTenant = async () => {
    if (!tenantToRemove) return;

    try {
      const { data: tenant } = await supabase
        .from("tenants")
        .select("unit_number")
        .eq("id", tenantToRemove.id)
        .single();

      const { error: tenantError } = await supabase
        .from("tenants")
        .update({
          property_id: null,
          unit_number: null,
          lease_status: 'inactive',
          lease_start_date: null,
          lease_end_date: null
        })
        .eq("id", tenantToRemove.id);

      if (tenantError) throw tenantError;

      if (tenant?.unit_number) {
        const { error: unitError } = await supabase
          .from("units")
          .update({ 
            status: 'vacant',
            tenant_id: null
          })
          .eq("property_id", propertyId)
          .eq("unit_number", tenant.unit_number);

        if (unitError) throw unitError;
      }

      toast({
        title: "Success",
        description: `${tenantToRemove.name} has been removed from this property`,
      });

      queryClient.invalidateQueries({ queryKey: ["property-tenants"] });
      queryClient.invalidateQueries({ queryKey: ["available-units"] });
    } catch (error) {
      console.error("Error removing tenant:", error);
      toast({
        title: "Error",
        description: "Failed to remove tenant from property",
        variant: "destructive",
      });
    } finally {
      setTenantToRemove(null);
    }
  };

  const handleAddTenant = async (formData: {
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
  }) => {
    if (!formData.tenant_id || !formData.unit_number) {
      toast({
        title: "Error",
        description: "Please select a tenant and unit",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!formData.monthly_rent) {
        const { data: unitData } = await supabase
          .from("units")
          .select("monthly_rent")
          .eq("property_id", propertyId)
          .eq("unit_number", formData.unit_number)
          .single();
        
        if (unitData?.monthly_rent) {
          formData.monthly_rent = unitData.monthly_rent;
        }
      }

      console.log("Submitting tenant with lease dates:", {
        start: formData.lease_start_date,
        end: formData.lease_end_date
      });

      const { error: tenantError } = await supabase
        .from("tenants")
        .update({
          property_id: propertyId,
          unit_number: formData.unit_number,
          lease_status: 'active',
          lease_start_date: formData.lease_start_date,
          lease_end_date: formData.lease_end_date,
          credit_score: formData.credit_score || null,
          previous_address: formData.previous_address || null,
          emergency_contact_name: formData.emergency_contact_name || null,
          emergency_contact_phone: formData.emergency_contact_phone || null,
          notes: formData.notes || null,
          preferred_language: formData.preferred_language || "English"
        })
        .eq("id", formData.tenant_id);

      if (tenantError) throw tenantError;

      const updateObject: any = { 
        status: 'occupied',
        tenant_id: formData.tenant_id
      };
      
      if (formData.monthly_rent) {
        updateObject.monthly_rent = formData.monthly_rent;
      }

      const { error: unitError } = await supabase
        .from("units")
        .update(updateObject)
        .eq("property_id", propertyId)
        .eq("unit_number", formData.unit_number);

      if (unitError) throw unitError;

      toast({
        title: "Success",
        description: "Tenant has been added to the property",
      });

      queryClient.invalidateQueries({ queryKey: ["property-tenants"] });
      queryClient.invalidateQueries({ queryKey: ["available-tenants"] });
      queryClient.invalidateQueries({ queryKey: ["available-units"] });
      setIsAddTenantOpen(false);
    } catch (error) {
      console.error("Error adding tenant:", error);
      toast({
        title: "Error",
        description: "Failed to add tenant to property",
        variant: "destructive",
      });
    }
  };

  if (tenantsLoading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <TenantListHeader onAddTenant={() => setIsAddTenantOpen(true)} />
      
      <TenantList
        tenants={tenants}
        onRemoveTenant={setTenantToRemove}
      />

      <AddTenantDialog
        isOpen={isAddTenantOpen}
        onClose={() => setIsAddTenantOpen(false)}
        onAdd={handleAddTenant}
        availableTenants={availableTenants}
        availableUnits={availableUnits}
      />

      <RemoveTenantDialog
        isOpen={!!tenantToRemove}
        onClose={() => setTenantToRemove(null)}
        onConfirm={handleRemoveTenant}
        tenantName={tenantToRemove?.name || ""}
      />
    </div>
  );
};
