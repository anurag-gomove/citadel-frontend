
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PropertyImageUploadProps {
  imagePreview: string | null;
  onImageChange: (file: File) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function PropertyImageUpload({ 
  imagePreview, 
  onImageChange, 
  disabled = false, 
  isLoading = false 
}: PropertyImageUploadProps) {
  // Log when imagePreview changes with detailed information
  useEffect(() => {
    console.log("PropertyImageUpload - imagePreview changed:", imagePreview);
    
    // If the imagePreview is a URL, check if it's accessible
    if (imagePreview && imagePreview.startsWith('http')) {
      console.log("PropertyImageUpload - Verifying image URL accessibility:", imagePreview);
      fetch(imagePreview, { method: 'HEAD', cache: 'no-store' })
        .then(response => {
          console.log("PropertyImageUpload - Image URL verification response:", {
            status: response.status,
            ok: response.ok,
            headers: Array.from(response.headers.entries())
          });
        })
        .catch(error => {
          console.error("PropertyImageUpload - Image URL verification failed:", error);
        });
    }
  }, [imagePreview]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("PropertyImageUpload - Input file change detected");
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      console.log("PropertyImageUpload - File selected:", {
        name: file.name,
        type: file.type,
        size: file.size
      });
      
      // Check if it's an image file
      if (!file.type.startsWith('image/')) {
        console.error("PropertyImageUpload - Invalid file type:", file.type);
        toast.error("Please upload an image file");
        return;
      }
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        console.error("PropertyImageUpload - File too large:", file.size);
        toast.error("Image size should be less than 5MB");
        return;
      }
      
      console.log("PropertyImageUpload - Valid image selected, calling onImageChange");
      onImageChange(file);
    } else {
      console.log("PropertyImageUpload - No file selected");
    }
  };

  return (
    <div className="flex flex-col items-center mb-6">
      <div className="w-full max-w-md aspect-video relative rounded-lg overflow-hidden mb-4 bg-muted">
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="Property preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error("PropertyImageUpload - Image preview failed to load:", imagePreview);
              // Set a fallback image
              const img = e.target as HTMLImageElement;
              img.src = "/placeholder.svg";
            }}
            onLoad={() => {
              console.log("PropertyImageUpload - Image preview loaded successfully:", imagePreview);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Upload className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        id="property-image"
        onChange={handleImageChange}
        disabled={disabled}
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          console.log("PropertyImageUpload - Upload button clicked");
          document.getElementById('property-image')?.click();
        }}
        disabled={disabled}
        className="min-w-[150px]"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : imagePreview ? 'Change Image' : 'Upload Image'}
      </Button>
    </div>
  );
}
