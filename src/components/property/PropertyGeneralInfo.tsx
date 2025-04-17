import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PropertyAddressForm } from "../properties/PropertyAddressForm";
import { PropertyDetailsForm } from "../properties/PropertyDetailsForm";
import { PropertyEditor } from "./PropertyEditor";
import { PropertyImageManager } from "./PropertyImageManager";
import { PropertyNameField } from "./PropertyNameField";

interface PropertyGeneralInfoProps {
  property: any;
}

export function PropertyGeneralInfo({ property }: PropertyGeneralInfoProps) {
  const [isEditing, setIsEditing] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: property.name || "",
    street_number: property.street_number || "",
    street_name: property.street_name || "",
    apartment_unit: property.apartment_unit || "",
    municipality: property.municipality || "",
    province: property.province || "",
    postal_code: property.postal_code || "",
    country: property.country || "Canada",
    type: property.type || "",
    primary_classification: property.primary_classification || "",
    secondary_classification: property.secondary_classification || "",
    year_built: property.year_built?.toString() || "",
    year_occupied: property.year_occupied?.toString() || "",
    total_units: property.total_units || 0,
    occupied_units: property.occupied_units || 0,
    status: property.status || "active",
    latitude: property.latitude?.toString() || "",
    longitude: property.longitude?.toString() || "",
  });

  const queryClient = useQueryClient();

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedImage) {
      console.log("No image selected for upload");
      return property.image_url;
    }
    
    console.log("Starting image upload process...");
    
    try {
      await supabase.functions.invoke("check-storage-bucket");
      
      console.log("Storage bucket check completed");

      const fileExt = selectedImage.name.split('.').pop();
      const timestamp = new Date().getTime();
      
      const fileName = `${property.id}_${timestamp}.${fileExt}`;
      
      console.log("Uploading image with filename:", fileName);
      
      if (property.image_url) {
        try {
          console.log("Removing old image:", property.image_url);
          await supabase.storage
            .from("properties")
            .remove([property.image_url]);
        } catch (removeErr) {
          console.warn("Error removing old image (continuing anyway):", removeErr);
        }
      }
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("properties")
        .upload(fileName, selectedImage, {
          cacheControl: "3600",
          upsert: true,
          contentType: selectedImage.type
        });
        
      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        console.error("Upload error message:", uploadError.message || "Unknown error");
        toast.error("Failed to upload image: " + (uploadError.message || "Unknown error"));
        return null;
      }
      
      if (!uploadData?.path) {
        console.error("Upload successful but no path returned");
        return null;
      }
      
      console.log("Image uploaded successfully to path:", uploadData.path);
      
      try {
        const { data: publicUrlData } = supabase.storage
          .from("properties")
          .getPublicUrl(fileName);
          
        if (publicUrlData?.publicUrl) {
          console.log("Pre-warming URL:", publicUrlData.publicUrl);
          
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const response = await fetch(publicUrlData.publicUrl, { 
            method: 'HEAD', 
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
          
          console.log("Pre-warming response:", response.status, response.ok);
        }
      } catch (warmErr) {
        console.warn("Error pre-warming URL (non-critical):", warmErr);
      }
      
      return fileName;
    } catch (err: any) {
      console.error("Exception during image upload:", err);
      toast.error("Image upload failed: " + (err.message || "Unknown error"));
      return null;
    }
  };

  const updatePropertyMutation = useMutation({
    mutationFn: async () => {
      try {
        let imagePath = property.image_url;
        
        if (selectedImage) {
          imagePath = await uploadImage();
          
          if (!imagePath && property.image_url) {
            console.log("Image upload failed, keeping existing image:", property.image_url);
            imagePath = property.image_url;
          }
        }
        
        const fullAddress = `${formData.street_number} ${formData.street_name}, ${formData.municipality}, ${formData.province} ${formData.postal_code}`;
        
        const propertyData: any = {
          name: formData.name,
          address: fullAddress,
          street_number: formData.street_number,
          street_name: formData.street_name,
          apartment_unit: formData.apartment_unit,
          municipality: formData.municipality,
          province: formData.province,
          postal_code: formData.postal_code,
          country: formData.country,
          type: formData.secondary_classification || formData.type,
          primary_classification: formData.primary_classification,
          secondary_classification: formData.secondary_classification,
          year_built: formData.year_built ? parseInt(formData.year_built) : null,
          year_occupied: formData.year_occupied ? parseInt(formData.year_occupied) : null,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          image_url: imagePath
        };

        console.log("Updating property with data:", propertyData);
        const { data, error } = await supabase
          .from("properties")
          .update(propertyData)
          .eq("id", property.id)
          .select();

        if (error) {
          console.error("Error updating property:", error);
          throw error;
        }
        
        console.log("Property updated successfully:", data);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return property.id;
      } catch (error: any) {
        console.error("Error in mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property", property.id] });
      toast.success("Property updated successfully");
      setIsEditing(false);
      setSelectedImage(null);
    },
    onError: (error: any) => {
      console.error("Mutation error details:", error);
      toast.error(`Failed to update property: ${error.message || "Unknown error"}`);
    },
  });

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updatePropertyMutation.mutate();
  };

  const handleCancel = () => {
    setFormData({
      name: property.name || "",
      street_number: property.street_number || "",
      street_name: property.street_name || "",
      apartment_unit: property.apartment_unit || "",
      municipality: property.municipality || "",
      province: property.province || "",
      postal_code: property.postal_code || "",
      country: property.country || "Canada",
      type: property.type || "",
      primary_classification: property.primary_classification || "",
      secondary_classification: property.secondary_classification || "",
      year_built: property.year_built?.toString() || "",
      year_occupied: property.year_occupied?.toString() || "",
      total_units: property.total_units || 0,
      occupied_units: property.occupied_units || 0,
      status: property.status || "active",
      latitude: property.latitude?.toString() || "",
      longitude: property.longitude?.toString() || "",
    });
    
    setSelectedImage(null);
    setIsEditing(false);
  };

  const handleImageChange = (file: File) => {
    console.log("Image change detected:", file.name, file.size, file.type);
    setSelectedImage(file);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <form className="space-y-8">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Property Information</h3>
                <PropertyEditor 
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  isPending={updatePropertyMutation.isPending}
                  alwaysEdit={true}
                />
              </div>
              
              <PropertyImageManager 
                property={property}
                isEditing={isEditing}
                onImageChange={handleImageChange}
              />

              <PropertyNameField 
                name={formData.name}
                onChange={(value) => handleFieldChange("name", value)}
                disabled={false}
              />
            </div>

            <PropertyAddressForm 
              formData={formData}
              onFieldChange={handleFieldChange}
              disabled={false}
            />

            <PropertyDetailsForm 
              formData={formData}
              onFieldChange={handleFieldChange}
              disabled={false}
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
