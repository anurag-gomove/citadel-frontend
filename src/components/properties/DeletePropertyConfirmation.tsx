
import { useState } from "react";
import { Property } from "@/types/database";
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

interface DeletePropertyConfirmationProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (propertyId: string) => Promise<void>;
}

export function DeletePropertyConfirmation({
  property,
  isOpen,
  onClose,
  onConfirm,
}: DeletePropertyConfirmationProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: activeTenantsCount, isLoading } = useQuery({
    queryKey: ["property-tenants-count", property?.id],
    queryFn: async () => {
      if (!property) return 0;
      
      const { count, error } = await supabase
        .from("tenants")
        .select("*", { count: "exact", head: true })
        .eq("property_id", property.id)
        .eq("lease_status", "active");
      
      if (error) {
        console.error("Error fetching tenants count:", error);
        throw error;
      }
      
      return count || 0;
    },
    enabled: !!property && isOpen,
  });

  const handleConfirm = async () => {
    if (!property) return;
    
    setIsDeleting(true);
    try {
      await onConfirm(property.id);
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this property?</AlertDialogTitle>
          <AlertDialogDescription>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <p>
                  This will permanently delete <strong>{property?.name}</strong> and all associated data.
                </p>
                <p className="mt-2">
                  {activeTenantsCount > 0 ? (
                    <span className="font-semibold text-destructive">
                      Warning: This property has {activeTenantsCount} active tenant{activeTenantsCount !== 1 ? 's' : ''}.
                    </span>
                  ) : (
                    "This property has no active tenants."
                  )}
                </p>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Property"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
