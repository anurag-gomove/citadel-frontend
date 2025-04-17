
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

interface DeleteMaintenanceRequestDialogProps {
  open: boolean;
  onClose: () => void;
  requestId: string | null;
  propertyId: string | null;
}

export function DeleteMaintenanceRequestDialog({
  open,
  onClose,
  requestId,
  propertyId,
}: DeleteMaintenanceRequestDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!requestId) return;
      
      const { error } = await supabase
        .from("maintenance_requests")
        .delete()
        .eq("id", requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenanceRequests", propertyId] });
      toast({
        title: "Request deleted",
        description: "Maintenance request has been deleted successfully.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete request: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    setIsDeleting(true);
    deleteMutation.mutate();
  };

  return (
    <AlertDialog open={open} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Maintenance Request</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this maintenance request? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={deleteMutation.isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
