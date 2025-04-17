
import { Property } from "@/types/database";
import { Card } from "@/components/ui/card";
import { Building2, Coins, MapPin, Navigation, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/format-currency";
import { Button } from "@/components/ui/button";

interface PropertyCardCompactProps {
  property: Property;
  isActive?: boolean;
  onClick?: () => void;
  propertyIndex?: number;
}

export function PropertyCardCompact({ 
  property, 
  isActive, 
  onClick, 
  propertyIndex 
}: PropertyCardCompactProps) {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

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

  const totalUnits = property.total_units || 0;
  const occupiedUnits = property.occupied_units || 0;
  const monthlyIncome = property.actual_income || 0;
  
  const hasCoordinates = Boolean(property.latitude && property.longitude);

  const handleCardClick = () => {
    console.log(`Property card clicked: ${property.name}`);
    if (onClick) {
      onClick();
    }
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card's onClick
    navigate(`/properties/${property.id}`);
  };

  return (
    <div className="p-1.5"> {/* Added padding container to ensure ring is visible */}
      <Card 
        className={`overflow-hidden transition-all hover:shadow-md cursor-pointer 
          ${isActive 
            ? 'ring-2 ring-primary shadow-lg' 
            : ''
          } relative`}
        onClick={handleCardClick}
      >
        {/* Property Index Badge */}
        {propertyIndex !== undefined && (
          <div className="absolute top-2 left-2 z-10 bg-white text-black px-2 py-1 rounded-full text-xs font-medium shadow-sm">
            {property.type || 'Property'}
          </div>
        )}

        {/* Property Image */}
        <div className="w-full h-32 bg-muted relative">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={property.name}
              className="w-full h-full object-cover"
              onError={() => setImageUrl(null)}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-muted">
              <Building2 className="w-10 h-10 text-muted-foreground" />
            </div>
          )}
        </div>
        
        {/* Property Information */}
        <div className="p-3">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-semibold mb-0.5 truncate">{property.name}</h3>
          </div>
          
          <div className="text-xs text-muted-foreground mb-1 truncate">
            {hasCoordinates ? (
              <div className="flex items-center">
                <span className="relative">
                  <Navigation className="w-3.5 h-3.5 text-[#8B5CF6] rotate-45" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full border border-white"></span>
                </span>
                <span className="ml-1 truncate">{property.address}</span>
              </div>
            ) : (
              <div className="flex items-center">
                <MapPin className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
                <span className="truncate">{property.address}</span>
              </div>
            )}
          </div>
          
          <div className="text-xs my-1">
            <div className="flex items-center text-muted-foreground">
              <Users className="w-3 h-3 text-primary mr-1" />
              <span>{occupiedUnits}/{totalUnits} units</span>
            </div>
          </div>

          <div className="flex justify-between items-center mt-2 text-sm">
            <div className="font-semibold">
              {formatCurrency(monthlyIncome)}<span className="text-xs text-muted-foreground">/mo</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {formatCurrency(monthlyIncome * 12)} total
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-3 text-xs h-8"
            onClick={handleViewDetails}
          >
            View Details
          </Button>
        </div>
      </Card>
    </div>
  );
}
