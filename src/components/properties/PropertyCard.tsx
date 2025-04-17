
import { Property } from "@/types/database";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Building2, Calendar, Coins, Home, MapPin, Navigation, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/format-currency";
import { useQuery } from "@tanstack/react-query";

interface PropertyCardProps {
  property: Property;
  onDeleteClick: (property: Property) => void;
}

export function PropertyCard({ property, onDeleteClick }: PropertyCardProps) {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Fetch maintenance requests for this property
  const { data: maintenanceRequests = [] } = useQuery({
    queryKey: ["property-maintenance", property.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select("*")
        .eq("property_id", property.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching maintenance requests:", error);
        throw error;
      }
      
      return data || [];
    },
  });

  // Fetch units with active tenants/occupied status to get accurate counts and income
  const { data: unitsData } = useQuery({
    queryKey: ["property-units-summary", property.id],
    queryFn: async () => {
      // Get all units for this property
      const { data: allUnits, error: unitsError } = await supabase
        .from("units")
        .select("id, status, monthly_rent")
        .eq("property_id", property.id);

      if (unitsError) {
        console.error("Error fetching units:", unitsError);
        throw unitsError;
      }

      // Calculate total units and occupied units
      const totalUnits = allUnits?.length || 0;
      const occupiedUnits = allUnits?.filter(unit => unit.status === 'occupied').length || 0;
      
      // Calculate monthly income from occupied units
      const monthlyIncome = allUnits
        ?.filter(unit => unit.status === 'occupied')
        .reduce((sum, unit) => sum + (Number(unit.monthly_rent) || 0), 0) || 0;

      console.log("Property units summary:", {
        propertyId: property.id,
        totalUnits,
        occupiedUnits,
        monthlyIncome,
        allUnits
      });

      return {
        totalUnits,
        occupiedUnits,
        monthlyIncome
      };
    },
  });

  useEffect(() => {
    const loadImage = async () => {
      if (!property.image_url) return;

      // Check if it's already a full URL
      if (property.image_url.startsWith('http')) {
        setImageUrl(property.image_url);
        return;
      }

      try {
        // If it's a storage path, get the public URL
        const { data } = supabase.storage
          .from('properties')
          .getPublicUrl(property.image_url);
          
        if (data?.publicUrl) {
          setImageUrl(data.publicUrl);
        }
      } catch (error) {
        console.error("Error loading image:", error);
      }
    };

    loadImage();
  }, [property.image_url]);

  // Use the fetched data or fallback to property values
  const totalUnits = unitsData?.totalUnits ?? property.total_units;
  const occupiedUnits = unitsData?.occupiedUnits ?? property.occupied_units;
  const monthlyIncome = unitsData?.monthlyIncome ?? 0;
  
  // Check if coordinates exist
  const hasCoordinates = Boolean(property.latitude && property.longitude);

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg group relative h-full flex flex-col">
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="destructive"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteClick(property);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="relative aspect-[16/9] overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={property.name}
            className="object-cover w-full h-full transition-transform hover:scale-105"
            onError={() => setImageUrl(null)}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Home className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
      </div>
      <CardContent className="p-4 flex-grow">
        <h3 className="text-lg font-semibold mb-1 truncate">{property.name}</h3>
        
        <div className="flex items-start gap-1 text-sm text-muted-foreground mb-3">
          {hasCoordinates ? (
            <div className="flex items-center">
              <span className="relative inline-flex">
                <Navigation className="w-4 h-4 text-[#8B5CF6] rotate-45" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full border border-white"></span>
              </span>
              <span className="ml-1 truncate">{property.address}</span>
            </div>
          ) : (
            <div className="flex items-center">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="truncate">{property.address}</span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm mt-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <span>{property.type}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span>
              <span className="font-medium">{occupiedUnits}/{totalUnits}</span> 
              <span className="text-xs ml-1">
                ({totalUnits > 0 
                  ? Math.round((occupiedUnits / totalUnits) * 100) 
                  : 0}% occupied)
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-600" />
            <span className="font-medium">
              {formatCurrency(monthlyIncome)}/mo
            </span>
          </div>
          <div className="flex items-center gap-2">
            {maintenanceRequests.length > 0 ? (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-amber-700 font-medium">
                  {maintenanceRequests.length} issue{maintenanceRequests.length !== 1 ? 's' : ''}
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-muted-foreground opacity-50" />
                <span className="text-muted-foreground">No issues</span>
              </>
            )}
          </div>
          {property.created_at && (
            <div className="flex items-center gap-2 col-span-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span>Added {format(new Date(property.created_at), "MMM d, yyyy")}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="px-4 pb-4 pt-0">
        <Button 
          variant="secondary" 
          className="w-full"
          onClick={() => navigate(`/properties/${property.id}`)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
