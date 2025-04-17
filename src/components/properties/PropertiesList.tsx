
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Property } from "@/types/database";
import { supabase } from "@/integrations/supabase/client";
import { PropertyListLoading } from "./PropertyListLoading";
import { PropertyListEmpty } from "./PropertyListEmpty";
import { PropertyTable } from "./PropertyTable";
import { PropertySearchBar } from "./PropertySearchBar";
import { useNavigate } from "react-router-dom";
import { PropertyCard } from "./PropertyCard";
import { Button } from "@/components/ui/button";
import { Grid, List, Map } from "lucide-react";
import { DeletePropertyConfirmation } from "./DeletePropertyConfirmation";
import { useToast } from "@/hooks/use-toast";
import { PropertyMap } from "./PropertyMap";
import { PropertyCardCompact } from "./PropertyCardCompact";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function PropertiesList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("map");
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      console.log("Starting properties fetch...");
      
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        console.log("No active session found, redirecting to login...");
        navigate("/auth");
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

      const { data: properties, error: fetchError } = await supabase
        .from("properties")
        .select("*")
        .eq('organization_id', profile.organization_id);

      if (fetchError) {
        console.error("Error fetching properties:", fetchError);
        throw fetchError;
      }

      const propertiesWithUnitInfo = await Promise.all((properties || []).map(async (property) => {
        const { data: units, error: unitsError } = await supabase
          .from("units")
          .select("id, status, monthly_rent")
          .eq("property_id", property.id);

        if (unitsError) {
          console.error(`Error fetching units for property ${property.id}:`, unitsError);
          return property;
        }

        const totalUnits = units?.length || 0;
        const occupiedUnits = units?.filter(unit => unit.status === 'occupied').length || 0;
        
        const monthlyIncome = units
          ?.filter(unit => unit.status === 'occupied')
          .reduce((sum, unit) => sum + (Number(unit.monthly_rent) || 0), 0) || 0;

        return {
          ...property,
          total_units: totalUnits,
          occupied_units: occupiedUnits,
          actual_income: monthlyIncome,
          potential_income: units?.reduce((sum, unit) => sum + (Number(unit.monthly_rent) || 0), 0) || 0
        };
      }));
      
      console.log("Properties with unit info:", propertiesWithUnitInfo);
      
      const transformedProperties = propertiesWithUnitInfo.map(p => ({
        ...p,
        state: p.province || "",
        zip: p.postal_code || "",
        rent: 0,
        bedrooms: 0,
        bathrooms: 0,
        square_feet: 0,
        property_type: p.type || "",
        description: "",
        amenities: [],
        images: p.image_url ? [p.image_url] : [],
        status: p.status || "active",
        number_of_units: p.total_units || 0
      })) as Property[];
      
      return transformedProperties;
    },
    retry: false,
    refetchOnWindowFocus: false
  });

  const [search, setSearch] = useState("");
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);

  useEffect(() => {
    const properties = data || [];
    console.log("Filtering properties:", properties, "with search:", search);
    const filtered = properties.filter((property) =>
      property.name.toLowerCase().includes(search.toLowerCase()) ||
      property.address.toLowerCase().includes(search.toLowerCase())
    );
    console.log("Filtered properties:", filtered);
    setFilteredProperties(filtered);
  }, [data, search]);

  useEffect(() => {
    if (viewMode !== "map") {
      setSelectedProperty(null);
    }
  }, [viewMode]);

  const handlePropertySelect = (property: Property) => {
    console.log(`Property selected in list: ${property.name}`);
    setSelectedProperty(property);
  };

  const handleDeleteProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", propertyId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["properties"] });
      
      toast({
        title: "Property deleted",
        description: "The property has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting property:", error);
      toast({
        title: "Error",
        description: "Failed to delete property. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <PropertyListLoading />;
  }

  if (error) {
    console.error("Query error:", error);
    return <PropertyListEmpty />;
  }

  if (!data || data.length === 0) {
    return <PropertyListEmpty />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full">
        <Card className="shadow-sm border-0">
          <CardHeader className="py-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Properties</CardTitle>
                <CardDescription>
                  Manage your properties and view details
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as "grid" | "list" | "map")}>
                  <ToggleGroupItem value="grid" aria-label="Grid view">
                    <Grid className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="list" aria-label="List view">
                    <List className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="map" aria-label="Map view">
                    <Map className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            <PropertySearchBar
              search={search}
              onSearchChange={setSearch}
            />
            
            {viewMode === "map" ? (
              <div className="flex min-h-[calc(100vh-16rem)] gap-4">
                <div className="w-1/5 h-full overflow-y-auto max-h-[calc(100vh-16rem)] pr-2">
                  <div className="grid grid-cols-1 gap-3">
                    {filteredProperties.map((property, index) => (
                      <PropertyCardCompact
                        key={property.id}
                        property={property}
                        isActive={selectedProperty?.id === property.id}
                        onClick={() => handlePropertySelect(property)}
                        propertyIndex={index}
                      />
                    ))}
                  </div>
                </div>
                <div className="w-4/5 h-full">
                  <PropertyMap 
                    properties={filteredProperties}
                    onPropertySelect={handlePropertySelect}
                    selectedProperty={selectedProperty}
                  />
                </div>
              </div>
            ) : viewMode === "list" ? (
              <PropertyTable properties={filteredProperties} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {filteredProperties.map((property) => (
                  <PropertyCard 
                    key={property.id} 
                    property={property} 
                    onDeleteClick={setPropertyToDelete}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <DeletePropertyConfirmation
        property={propertyToDelete}
        isOpen={!!propertyToDelete}
        onClose={() => setPropertyToDelete(null)}
        onConfirm={handleDeleteProperty}
      />
    </div>
  );
}
