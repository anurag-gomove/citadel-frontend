
import React, { useState, useEffect } from "react";
import { PropertyImageUpload } from "../properties/PropertyImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PropertyImageManagerProps {
  property: any;
  isEditing: boolean;
  onImageChange: (file: File) => void;
}

export function PropertyImageManager({ 
  property, 
  isEditing, 
  onImageChange 
}: PropertyImageManagerProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Load the image when the component mounts or property changes
  useEffect(() => {
    const loadImage = async () => {
      setIsLoading(true);
      
      if (!property?.image_url) {
        console.log("PropertyImageManager - No image URL available");
        setImagePreview(null);
        setIsLoading(false);
        return;
      }
      
      try {
        console.log("PropertyImageManager - Loading image:", property.image_url);
        
        // If it's already a full URL, use it directly
        if (property.image_url.startsWith('http')) {
          console.log("PropertyImageManager - Using direct URL with cache busting");
          const timestamp = new Date().getTime();
          const cacheBustedUrl = `${property.image_url}${property.image_url.includes('?') ? '&' : '?'}t=${timestamp}`;
          setImagePreview(cacheBustedUrl);
          setIsLoading(false);
          return;
        }
        
        // Ensure the storage bucket exists before trying to get the public URL
        console.log("PropertyImageManager - Checking storage bucket");
        await supabase.functions.invoke("check-storage-bucket");
        
        // Generate public URL with cache-busting
        const timestamp = new Date().getTime();
        console.log("PropertyImageManager - Getting public URL with timestamp:", timestamp);
        
        const { data } = supabase.storage
          .from("properties")
          .getPublicUrl(property.image_url);
        
        if (data?.publicUrl) {
          // Add cache-busting parameter to URL
          const cacheBustedUrl = `${data.publicUrl}${data.publicUrl.includes('?') ? '&' : '?'}t=${timestamp}`;
          console.log("PropertyImageManager - Image public URL with cache busting:", cacheBustedUrl);
          
          // Verify the image is accessible with forced cache bypass
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
            
            console.log("PropertyImageManager - Image verification status:", response.status, response.ok);
            
            if (response.ok) {
              setImagePreview(cacheBustedUrl);
            } else {
              console.warn("PropertyImageManager - Image verification failed, trying without cache busting");
              setImagePreview(data.publicUrl);
            }
          } catch (error) {
            console.error("PropertyImageManager - Error verifying image:", error);
            setImagePreview(data.publicUrl);
          }
        } else {
          console.log("PropertyImageManager - No public URL returned");
          setImagePreview(null);
        }
      } catch (error) {
        console.error("PropertyImageManager - Error loading image:", error);
        setImagePreview(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [property?.id, property?.image_url]);

  const handleImageChange = (file: File) => {
    if (!file) return;
    
    try {
      // Create a local preview
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
      
      // Pass the file up to the parent component
      onImageChange(file);
      
      console.log("PropertyImageManager - Image selected:", file.name, file.size, file.type);
    } catch (error) {
      console.error("PropertyImageManager - Error selecting image:", error);
      toast.error("Error selecting image");
    }
  };

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <PropertyImageUpload 
      imagePreview={imagePreview}
      onImageChange={handleImageChange}
      disabled={!isEditing}
      isLoading={isLoading}
    />
  );
}
