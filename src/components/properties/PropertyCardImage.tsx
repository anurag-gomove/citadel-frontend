
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface PropertyCardImageProps {
  imageUrl: string | null;
  propertyName: string;
}

export const PropertyCardImage = ({ imageUrl: imagePath, propertyName }: PropertyCardImageProps) => {
  const [displayUrl, setDisplayUrl] = useState<string>("/placeholder.svg");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      setIsLoading(true);
      
      // If no image path, use placeholder
      if (!imagePath) {
        console.log('PropertyCardImage - No image path provided, using placeholder');
        setDisplayUrl("/placeholder.svg");
        setIsLoading(false);
        return;
      }

      try {
        // If it's already a full URL, use it directly with cache busting
        if (imagePath.startsWith('http')) {
          console.log('PropertyCardImage - Using direct URL with cache busting:', imagePath);
          const timestamp = new Date().getTime(); // Use exact same timestamp format everywhere
          const cacheBustedUrl = `${imagePath}${imagePath.includes('?') ? '&' : '?'}t=${timestamp}`;
          setDisplayUrl(cacheBustedUrl);
          setIsLoading(false);
          return;
        }

        // Ensure the storage bucket exists
        console.log('PropertyCardImage - Checking storage bucket');
        await supabase.functions.invoke("check-storage-bucket");
        
        // Get public URL from Supabase Storage
        console.log('PropertyCardImage - Getting Supabase storage URL for:', imagePath);
        
        const { data } = supabase.storage
          .from('properties')
          .getPublicUrl(imagePath);
        
        if (data?.publicUrl) {
          // Add cache-busting parameter with a unique timestamp
          const timestamp = new Date().getTime();
          const cacheBustedUrl = `${data.publicUrl}${data.publicUrl.includes('?') ? '&' : '?'}t=${timestamp}`;
          console.log('PropertyCardImage - Successfully got public URL with cache busting:', cacheBustedUrl);
          
          // Perform a HEAD request to verify the image is accessible
          try {
            const response = await fetch(cacheBustedUrl, { 
              method: 'HEAD', 
              cache: 'no-store',
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
              }
            });
            
            console.log('PropertyCardImage - Image verification status:', response.status, response.ok);
            
            if (response.ok) {
              setDisplayUrl(cacheBustedUrl);
            } else {
              console.warn('PropertyCardImage - Image verification failed, using fallback');
              setDisplayUrl("/placeholder.svg");
            }
          } catch (verifyError) {
            console.error('PropertyCardImage - Error verifying image:', verifyError);
            setDisplayUrl("/placeholder.svg");
          }
        } else {
          console.error('PropertyCardImage - Failed to get public URL');
          setDisplayUrl("/placeholder.svg");
        }
      } catch (err) {
        console.error('PropertyCardImage - Error loading image:', err);
        setDisplayUrl("/placeholder.svg");
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [imagePath]);

  return (
    <AspectRatio ratio={16 / 9} className="bg-muted">
      {isLoading ? (
        <div className="flex items-center justify-center w-full h-full">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <img
          src={displayUrl}
          alt={propertyName}
          className="object-cover w-full h-full rounded-t-lg"
          onError={(e) => {
            console.error('PropertyCardImage - Image load error, falling back to placeholder');
            const img = e.target as HTMLImageElement;
            img.src = "/placeholder.svg";
          }}
          onLoad={() => {
            console.log('PropertyCardImage - Image loaded successfully:', displayUrl);
          }}
        />
      )}
    </AspectRatio>
  );
};
