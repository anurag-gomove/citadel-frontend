
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface DeletePropertyDialogProps {
  propertyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export const DeletePropertyDialog = ({
  propertyId,
  open,
  onOpenChange,
  onConfirm,
}: DeletePropertyDialogProps) => {
  const { data: tenants, isLoading } = useQuery({
    queryKey: ["property-tenants-delete", propertyId],
    queryFn: async () => {
      console.log("Fetching tenants for property:", propertyId);
      const { data, error } = await supabase
        .from("units")
        .select(`
          tenant_id,
          unit_number,
          tenants (
            id,
            first_name,
            last_name,
            lease_status
          )
        `)
        .eq("property_id", propertyId)
        .not("tenant_id", "is", null);

      if (error) {
        console.error("Error fetching tenants:", error);
        throw error;
      }
      
      console.log("Fetched units with tenants:", data);
      return data.filter(unit => unit.tenants);
    },
    enabled: open && !!propertyId,
  });
  
  // Also fetch property image information to ensure we can clean up the storage
  const { data: property } = useQuery({
    queryKey: ["property-for-delete", propertyId],
    queryFn: async () => {
      console.log("Fetching property details for deletion:", propertyId);
      const { data, error } = await supabase
        .from("properties")
        .select("image_url")
        .eq("id", propertyId)
        .single();
        
      if (error) {
        console.error("Error fetching property for deletion:", error);
        throw error;
      }
      
      console.log("Fetched property details for deletion:", data);
      return data;
    },
    enabled: open && !!propertyId,
  });

  const hasTenants = tenants && tenants.length > 0;

  const handleConfirm = async () => {
    try {
      // If the property has an image, clean it up from storage
      if (property?.image_url) {
        console.log("DeletePropertyDialog - Removing property image:", property.image_url);
        try {
          const { error: removeError } = await supabase.storage
            .from('properties')
            .remove([property.image_url]);
            
          if (removeError) {
            console.error("DeletePropertyDialog - Error removing property image:", removeError);
          } else {
            console.log("DeletePropertyDialog - Property image removed successfully");
          }
        } catch (error) {
          console.error("DeletePropertyDialog - Exception removing property image:", error);
        }
      }
      
      await onConfirm();
    } finally {
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog 
      open={open} 
      onOpenChange={(newOpen) => {
        // Ensure we always call onOpenChange when the dialog state changes
        if (!newOpen) {
          onOpenChange(false);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <div className="space-y-4">
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the property
              and remove all associations with existing tenants.
            </AlertDialogDescription>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : hasTenants ? (
              <div className="space-y-2">
                <div className="font-medium text-destructive">
                  Warning: This property has the following tenants assigned to units:
                </div>
                <div className="rounded-md border p-4 space-y-2">
                  {tenants.map((unit) => (
                    <div key={unit.tenant_id} className="flex justify-between items-center text-sm">
                      <span>{unit.tenants.first_name} {unit.tenants.last_name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Unit {unit.unit_number}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          unit.tenants.lease_status === "active"
                            ? "bg-green-100 text-green-800"
                            : unit.tenants.lease_status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {unit.tenants.lease_status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  These tenants will be disassociated from their units but their records will be preserved.
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No tenants are currently assigned to any units in this property.
              </div>
            )}
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <button type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <button
              type="button"
              onClick={handleConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
