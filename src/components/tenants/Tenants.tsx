import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { Tenant, LeaseStatus, ApplicationStatus } from "@/types/database";
import { supabase } from "@/integrations/supabase/client";
import { TenantList } from "./TenantList";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { NewTenantForm } from "./NewTenantForm";

export function Tenants() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.openAddTenantForm) {
      setIsCreateDialogOpen(true);
      
      window.history.replaceState(
        { ...window.history.state, state: undefined }, 
        document.title
      );
    }
  }, [location]);

  const { data: tenantsData = [], isLoading, error } = useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      console.log("Fetching all tenants with organization information");
      
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        console.log("No active session found");
        return [];
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', session.session.user.id)
        .single();

      if (!profile?.organization_id) {
        console.error("No organization ID found for user");
        throw new Error("No organization ID found");
      }

      console.log("Fetching tenants for organization:", profile.organization_id);
      
      const { data: tenantsRaw, error: tenantsError } = await supabase
        .from("tenants")
        .select("*")
        .eq('organization_id', profile.organization_id);
      
      if (tenantsError) {
        console.error("Error fetching tenants:", tenantsError);
        throw tenantsError;
      }
      
      console.log("Raw tenants data:", tenantsRaw);
      
      let workingTenants = [...tenantsRaw];
      
      let propertyIds = workingTenants
        .filter(tenant => tenant.property_id)
        .map(tenant => tenant.property_id);
      
      console.log("Property IDs directly from tenants:", propertyIds);
      
      const tenantsWithUnitNoProperty = workingTenants.filter(
        tenant => tenant.unit_number && !tenant.property_id
      );
      
      console.log("Tenants with unit numbers but no property_id:", tenantsWithUnitNoProperty);
      
      if (tenantsWithUnitNoProperty.length > 0) {
        const unitNumbers = [...new Set(tenantsWithUnitNoProperty.map(t => t.unit_number))];
        console.log("Unit numbers to look up:", unitNumbers);
        
        const { data: unitsData, error: unitsError } = await supabase
          .from("units")
          .select("unit_number, property_id")
          .in("unit_number", unitNumbers);
        
        if (unitsError) {
          console.error("Error fetching units:", unitsError);
          throw unitsError;
        }
        
        console.log("Units data found:", unitsData);
        
        const unitToPropertyMap: Record<string, string> = {};
        unitsData.forEach(unit => {
          if (unit.property_id) {
            unitToPropertyMap[unit.unit_number] = unit.property_id;
          }
        });
        
        console.log("Unit to property map:", unitToPropertyMap);
        
        workingTenants = workingTenants.map(tenant => {
          if (!tenant.property_id && tenant.unit_number && unitToPropertyMap[tenant.unit_number]) {
            return {
              ...tenant,
              property_id: unitToPropertyMap[tenant.unit_number]
            };
          }
          return tenant;
        });
        
        const additionalPropertyIds = Object.values(unitToPropertyMap) as string[];
        propertyIds = [...new Set([...propertyIds, ...additionalPropertyIds])];
      }
      
      console.log("Final property IDs to fetch:", propertyIds);
      
      let propertiesMap: Record<string, string> = {};
      if (propertyIds.length > 0) {
        console.log("Fetching properties for tenants:", propertyIds);
        
        const { data: properties, error: propertiesError } = await supabase
          .from("properties")
          .select("id, name")
          .in("id", propertyIds);
        
        if (propertiesError) {
          console.error("Error fetching properties:", propertiesError);
          throw propertiesError;
        }
        
        console.log("Properties fetched:", properties);
        
        propertiesMap = properties.reduce((acc: Record<string, string>, property) => {
          acc[property.id] = property.name;
          return acc;
        }, {});
        
        console.log("Properties map:", propertiesMap);
      }
      
      const enhancedTenants = workingTenants.map(tenant => {
        const propertyName = tenant.property_id && propertiesMap[tenant.property_id] 
          ? propertiesMap[tenant.property_id] 
          : null;
          
        console.log(`Tenant: ${tenant.first_name} ${tenant.last_name}, Property ID: ${tenant.property_id}, Property Name: ${propertyName}`);
        
        return {
          ...tenant,
          property_name: propertyName
        };
      });
      
      console.log("Enhanced tenants with property names:", enhancedTenants);
      return enhancedTenants;
    },
  });

  const tenants: Tenant[] = tenantsData.map(tenant => ({
    id: tenant.id,
    first_name: tenant.first_name,
    last_name: tenant.last_name,
    email: tenant.email,
    phone: tenant.phone || null,
    other_phone: tenant.other_phone || null,
    property_id: tenant.property_id,
    unit_id: tenant.unit_id || null,
    unit_number: tenant.unit_number || null,
    lease_status: (tenant.lease_status || 'pending') as LeaseStatus,
    lease_start_date: tenant.lease_start_date || null,
    lease_end_date: tenant.lease_end_date || null,
    status: tenant.status as 'active' | 'inactive',
    created_at: tenant.created_at || null,
    updated_at: tenant.updated_at || null,
    credit_score: tenant.credit_score || null,
    previous_address: tenant.previous_address || null,
    street_number: tenant.street_number || null,
    street_name: tenant.street_name || null,
    apartment: tenant.apartment || null,
    city: tenant.city || null,
    zipcode: tenant.zipcode || null,
    emergency_contact_name: tenant.emergency_contact_name || null,
    emergency_contact_phone: tenant.emergency_contact_phone || null,
    notes: tenant.notes || null,
    preferred_language: tenant.preferred_language || "English",
    application_status: (tenant.application_status || null) as ApplicationStatus | null,
    application_sent_date: tenant.application_sent_date || null,
    application_received_date: tenant.application_received_date || null,
    application_reviewed_date: tenant.application_reviewed_date || null,
    can_send_new_application: tenant.can_send_new_application !== false,
    property_name: tenant.property_name || null
  }));

  const filteredTenants = tenants.filter((tenant) => {
    const fullName = `${tenant.first_name} ${tenant.last_name}`.toLowerCase();
    return (
      fullName.includes(searchQuery.toLowerCase()) ||
      tenant.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["tenants"] });
  };

  if (isLoading) {
    return <div>Loading tenants...</div>;
  }

  if (error) {
    return <div>Error fetching tenants: {(error as Error).message}</div>;
  }

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Tenants</h1>
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Search tenants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Tenant
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>Add Tenant</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new tenant.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 overflow-y-auto max-h-[calc(90vh-10rem)]">
                <NewTenantForm 
                  onSuccess={() => setIsCreateDialogOpen(false)}
                  onCancel={() => setIsCreateDialogOpen(false)}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Tenants</CardTitle>
          <CardDescription>
            Manage your property tenants and their information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TenantList tenants={filteredTenants} onRefresh={refreshData} />
        </CardContent>
      </Card>
    </div>
  );
}
