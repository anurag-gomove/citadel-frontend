import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FormInput } from "@/components/FormInput";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { PropertyImageUpload } from "./PropertyImageUpload";
import { PropertyAddressForm } from "./PropertyAddressForm";
import { PropertyDetailsForm } from "./PropertyDetailsForm";
import { PROPERTY_TYPES, PropertyType, PropertyFormData } from "./types";

export function CreatePropertyForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});
  const [formData, setFormData] = React.useState<PropertyFormData>({
    name: "",
    street_number: "",
    street_name: "",
    apartment_unit: "",
    municipality: "",
    province: "",
    postal_code: "",
    country: "Canada",
    type: 'residential',
    year_built: "",
    year_occupied: "",
    total_units: 0,
    occupied_units: 0,
    status: "active" as const,
    latitude: "",
    longitude: "",
  });
  
  const { toast } = useToast();

  const { data: userData, error: userError } = useQuery({
    queryKey: ['userData'],
    queryFn: async () => {
      console.log("Fetching user data...");
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Not authenticated');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      if (!profile?.organization_id) {
        throw new Error('No organization associated with profile');
      }

      console.log("User data fetched successfully:", { userId: user.id, orgId: profile.organization_id });
      return {
        userId: user.id,
        organizationId: profile.organization_id
      };
    },
    meta: {
      errorMessage: "Unable to load user profile"
    }
  });

  React.useEffect(() => {
    if (userError) {
      console.error('Profile fetch error:', userError);
      toast({
        title: "Error",
        description: "Unable to load user profile",
        variant: "destructive",
      });
      
      if (!location.pathname.includes("/new") && !location.pathname.includes("/edit")) {
        navigate("/properties");
      }
    }
  }, [userError, toast, navigate, location]);

  const { data: property } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: isEditMode,
  });

  React.useEffect(() => {
    if (property) {
      setFormData({
        name: property.name || "",
        street_number: property.street_number || "",
        street_name: property.street_name || "",
        apartment_unit: property.apartment_unit || "",
        municipality: property.municipality || "",
        province: property.province || "",
        postal_code: property.postal_code || "",
        country: property.country || "Canada",
        type: property.type as PropertyType,
        year_built: property.year_built?.toString() || "",
        year_occupied: property.year_occupied?.toString() || "",
        total_units: property.total_units || 0,
        occupied_units: property.occupied_units || 0,
        status: property.status as "active" | "inactive" | "pending" || "active",
        latitude: property.latitude?.toString() || "",
        longitude: property.longitude?.toString() || "",
      });

      if (property.image_url) {
        console.log("CreatePropertyForm - Property has image_url:", property.image_url);
        
        try {
          supabase.functions.invoke("check-storage-bucket")
            .then(({ data, error }) => {
              if (error) {
                console.error("CreatePropertyForm - Error checking bucket:", error);
              } else {
                console.log("CreatePropertyForm - Bucket check result:", data);
              }
            })
            .catch(error => {
              console.error("CreatePropertyForm - Exception checking bucket:", error);
            });
          
          const { data: publicUrlData } = supabase.storage
            .from('properties')
            .getPublicUrl(property.image_url);
          
          if (publicUrlData?.publicUrl) {
            const cacheBustedUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
            console.log("CreatePropertyForm - Setting image preview to cache-busted URL:", cacheBustedUrl);
            
            fetch(cacheBustedUrl, { method: 'HEAD', cache: 'no-store' })
              .then(response => {
                console.log("CreatePropertyForm - Image URL check response:", response.status, response.ok);
                if (response.ok) {
                  setImagePreview(cacheBustedUrl);
                } else {
                  console.warn("CreatePropertyForm - Image URL might not be accessible");
                  setImagePreview(publicUrlData.publicUrl);
                }
              })
              .catch(error => {
                console.warn("CreatePropertyForm - Error checking image URL:", error);
                setImagePreview(publicUrlData.publicUrl);
              });
          } else {
            console.error("CreatePropertyForm - Failed to get public URL for image");
          }
        } catch (error) {
          console.error("CreatePropertyForm - Error setting image preview:", error);
        }
      }
    }
  }, [property]);

  const handleFieldChange = (field: keyof PropertyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (value && errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleImageChange = (file: File) => {
    console.log("CreatePropertyForm - handleImageChange called with file:", file.name);
    setSelectedImage(file);
    
    const localPreviewUrl = URL.createObjectURL(file);
    console.log("CreatePropertyForm - Created local preview URL:", localPreviewUrl);
    setImagePreview(localPreviewUrl);
  };

  const mutateProperty = useMutation({
    mutationFn: async (data: PropertyFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        throw new Error("Organization not available");
      }

      const fullAddress = `${data.street_number} ${data.street_name}, ${data.municipality}, ${data.province} ${data.postal_code}`;

      const propertyData = {
        name: data.name,
        address: fullAddress,
        street_number: data.street_number,
        street_name: data.street_name,
        apartment_unit: data.apartment_unit,
        municipality: data.municipality,
        province: data.province,
        postal_code: data.postal_code,
        country: data.country || 'Canada',
        type: data.secondary_classification || data.type,
        primary_classification: data.primary_classification,
        secondary_classification: data.secondary_classification,
        year_built: data.year_built ? parseInt(data.year_built) : null,
        year_occupied: data.year_occupied ? parseInt(data.year_occupied) : null,
        status: 'active' as const,
        total_units: data.total_units || 0,
        occupied_units: data.occupied_units || 0,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        owner_id: user.id,
        organization_id: profile.organization_id
      };

      if (isEditMode && id) {
        const { error: updateError } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', id);
        
        if (updateError) throw updateError;
        return id;
      } else {
        const { data: newProperty, error: insertError } = await supabase
          .from('properties')
          .insert([propertyData])
          .select()
          .single();
        
        if (insertError) throw insertError;
        if (!newProperty) throw new Error('Property created but no data returned');
        return newProperty.id;
      }
    },
    onSuccess: async (propertyId) => {
      if (selectedImage && propertyId) {
        console.log("CreatePropertyForm - Starting image upload process for property:", propertyId);
        try {
          const bucketResult = await supabase.functions.invoke("check-storage-bucket");
          console.log("CreatePropertyForm - Bucket check result:", bucketResult);
          
          if (isEditMode && property?.image_url) {
            console.log("CreatePropertyForm - In edit mode with existing image, removing:", property.image_url);
            const { error: removeError } = await supabase.storage
              .from('properties')
              .remove([property.image_url]);
              
            if (removeError) {
              console.warn("CreatePropertyForm - Error removing existing image:", removeError);
            } else {
              console.log("CreatePropertyForm - Existing image removed successfully");
            }
          }

          const fileExt = selectedImage.name.split('.').pop();
          const timestamp = Date.now();
          const fileName = `${propertyId}_${timestamp}.${fileExt}`;
          console.log("CreatePropertyForm - Generated unique filename:", fileName);

          const { error: uploadError, data: uploadData } = await supabase.storage
            .from('properties')
            .upload(fileName, selectedImage, { 
              upsert: true,
              cacheControl: 'no-cache, no-store',
              contentType: selectedImage.type
            });

          if (uploadError) {
            console.error('CreatePropertyForm - Image upload error:', uploadError);
            toast({
              title: "Warning",
              description: "Property saved but image upload failed",
              variant: "destructive",
            });
            return;
          }
          
          console.log("CreatePropertyForm - Image upload successful:", uploadData);

          await new Promise(resolve => setTimeout(resolve, 1000));

          const { error: updateError } = await supabase
            .from('properties')
            .update({ image_url: fileName })
            .eq('id', propertyId);
            
          if (updateError) {
            console.error("CreatePropertyForm - Error updating property with image_url:", updateError);
            toast({
              title: "Warning",
              description: "Property image reference update failed",
              variant: "destructive",
            });
            return;
          }
          
          console.log("CreatePropertyForm - Property record updated with image_url");

          const { data: publicUrlData } = supabase.storage
            .from('properties')
            .getPublicUrl(fileName);
            
          if (publicUrlData?.publicUrl) {
            console.log("CreatePropertyForm - Generated public URL:", publicUrlData.publicUrl);
            
            fetch(publicUrlData.publicUrl, { method: 'HEAD', cache: 'no-store' })
              .then(response => {
                console.log("CreatePropertyForm - Cache warming response:", response.status);
              })
              .catch(error => {
                console.warn("CreatePropertyForm - Cache warming failed:", error);
              });
          }

        } catch (error) {
          console.error('CreatePropertyForm - Image handling error:', error);
          toast({
            title: "Warning",
            description: "Property saved but image handling failed",
            variant: "destructive",
          });
        }
      } else {
        console.log("CreatePropertyForm - No image to upload or no property ID");
      }

      toast({
        title: "Success",
        description: `Property ${isEditMode ? 'updated' : 'created'} successfully`,
      });
      navigate("/properties");
    },
    onError: (error) => {
      console.error('Property operation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save property",
        variant: "destructive",
      });
    },
  });

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Property Name is required";
    }
    if (!formData.street_number.trim()) {
      newErrors.street_number = "Street Number is required";
    }
    if (!formData.street_name.trim()) {
      newErrors.street_name = "Street Name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      mutateProperty.mutate(formData);
    } else {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-left">
            {isEditMode ? 'Edit' : 'Create New'} Property
          </h1>
        </div>
        <Button variant="outline" onClick={() => navigate("/properties")}>
          Cancel
        </Button>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-8 text-left">
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Property Information</h2>
              
              <PropertyImageUpload 
                imagePreview={imagePreview}
                onImageChange={handleImageChange}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <FormInput
                    label="Property Name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    error={errors.name}
                    required
                  />
                </div>
              </div>
            </div>

            <PropertyAddressForm 
              formData={formData}
              onFieldChange={handleFieldChange}
              errors={errors}
            />

            <PropertyDetailsForm 
              formData={formData}
              onFieldChange={handleFieldChange}
            />

            <div className="flex justify-end gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={mutateProperty.isPending}
              >
                {mutateProperty.isPending 
                  ? (isEditMode ? "Updating..." : "Creating...") 
                  : (isEditMode ? "Update Property" : "Create Property")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
