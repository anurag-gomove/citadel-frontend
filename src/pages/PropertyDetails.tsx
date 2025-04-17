import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PropertyTenants } from "@/components/property/PropertyTenants";
import { PropertyMaintenance } from "@/components/property/PropertyMaintenance";
import { PropertyUnits } from "@/components/property/PropertyUnits";
import { PropertyPayments } from "@/components/property/PropertyPayments";
import { PropertyFinancialOverview } from "@/components/property/PropertyFinancialOverview";
import { PropertyBills } from "@/components/property/PropertyBills";
import { PropertyGeneralInfo } from "@/components/property/PropertyGeneralInfo";
import { PropertyOwnerInfo } from "@/components/property/PropertyOwnerInfo";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Home, Building2, Users, Wrench, User, Receipt } from "lucide-react";
import { format } from "date-fns";
import { useEffect } from "react";
import { toast } from "sonner";

export const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const subtabParam = searchParams.get("subtab");
  
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        console.log("Initializing storage bucket via edge function");
        const { error } = await supabase.functions.invoke("check-storage-bucket");
        
        if (error) {
          console.error("Error initializing storage bucket:", error);
          toast.error("Failed to initialize storage for property images");
        } else {
          console.log("Storage bucket initialization successful");
        }
      } catch (error) {
        console.error("Exception initializing storage:", error);
      }
    };
    
    initializeStorage();
  }, []);
  
  const {
    data: property,
    isLoading
  } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      console.log("Fetching property data for ID:", id);
      const {
        data,
        error
      } = await supabase.from("properties").select("*").eq("id", id).single();
      
      if (error) {
        console.error("Error fetching property:", error);
        throw error;
      }
      
      console.log("Fetched property data:", data);
      return data;
    }
  });

  const {
    data: creatorProfile
  } = useQuery({
    queryKey: ["creator-profile", property?.owner_id],
    queryFn: async () => {
      if (!property?.owner_id) return null;
      
      const {
        data,
        error
      } = await supabase.from("profiles").select("first_name, last_name").eq("id", property?.owner_id).single();
      
      if (error) {
        console.error("Error fetching creator profile:", error);
        throw error;
      }
      
      return data;
    },
    enabled: !!property?.owner_id
  });
  
  useEffect(() => {
    if (tabParam && ["general", "units", "tenants", "maintenance", "owners", "finances"].includes(tabParam)) {
      // The tab param is valid, no need to do anything
    } else {
      setSearchParams(params => {
        params.set("tab", "general");
        return params;
      });
    }
  }, [tabParam, setSearchParams]);
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!property) {
    return <div>Property not found</div>;
  }
  
  const activeTab = tabParam && ["general", "units", "tenants", "maintenance", "owners", "finances"].includes(tabParam) 
    ? tabParam 
    : "general";
  
  const handleTabChange = (value: string) => {
    setSearchParams(params => {
      params.set("tab", value);
      return params;
    });
  };
  
  const activeFinancesSubtab = subtabParam && ["budget", "rent", "bills"].includes(subtabParam) 
    ? subtabParam 
    : "budget";
  
  return (
    <div className="p-2">
      <div className="flex items-center gap-2 mb-6 border-b pb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/properties")} className="h-8 w-8 mr-2">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <h1 className="text-xl font-semibold truncate">{property.name}</h1>
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Created {format(new Date(property.created_at), "MMMM d, yyyy")} by{" "}
              {creatorProfile ? `${creatorProfile.first_name} ${creatorProfile.last_name}` : "Unknown"}
            </span>
          </div>
          <p className="text-muted-foreground text-sm">{property.address}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-4 bg-background border-b w-full flex justify-start rounded-none p-0 h-auto">
          <TabsTrigger 
            value="general" 
            className="flex items-center gap-2 px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none"
          >
            <Home className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger 
            value="units" 
            className="flex items-center gap-2 px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none"
          >
            <Building2 className="h-4 w-4" />
            Units
          </TabsTrigger>
          <TabsTrigger 
            value="tenants" 
            className="flex items-center gap-2 px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none"
          >
            <Users className="h-4 w-4" />
            Tenants
          </TabsTrigger>
          <TabsTrigger 
            value="maintenance" 
            className="flex items-center gap-2 px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none"
          >
            <Wrench className="h-4 w-4" />
            Maintenance
          </TabsTrigger>
          <TabsTrigger 
            value="owners" 
            className="flex items-center gap-2 px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none"
          >
            <User className="h-4 w-4" />
            Owners
          </TabsTrigger>
          <TabsTrigger 
            value="finances" 
            className="flex items-center gap-2 px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-background data-[state=active]:shadow-none rounded-none"
          >
            <Receipt className="h-4 w-4" />
            Income & Expenses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 mt-0">
          <PropertyGeneralInfo property={property} />
        </TabsContent>

        <TabsContent value="units" className="space-y-6 mt-0">
          <PropertyUnits propertyId={property.id} />
        </TabsContent>

        <TabsContent value="tenants" className="space-y-6 mt-0">
          <PropertyTenants propertyId={property.id} />
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6 mt-0">
          <PropertyMaintenance property={property.id} />
        </TabsContent>

        <TabsContent value="owners" className="space-y-6 mt-0">
          <PropertyOwnerInfo propertyId={property.id} isEditing={false} />
        </TabsContent>

        <TabsContent value="finances" className="space-y-6 mt-0">
          <Tabs defaultValue={activeFinancesSubtab} className="space-y-6">
            <TabsList className="bg-muted grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="budget" className="flex-1 px-6 py-2">Budget</TabsTrigger>
              <TabsTrigger value="rent" className="flex-1 px-6 py-2">Rent</TabsTrigger>
              <TabsTrigger value="bills" className="flex-1 px-6 py-2">Bills</TabsTrigger>
            </TabsList>

            <TabsContent value="budget">
              <PropertyFinancialOverview propertyId={property.id} />
            </TabsContent>

            <TabsContent value="rent">
              <PropertyPayments propertyId={property.id} />
            </TabsContent>

            <TabsContent value="bills">
              <PropertyBills propertyId={property.id} />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
};
