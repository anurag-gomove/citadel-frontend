
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

interface RemoveTenantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tenantName: string;
}

export const RemoveTenantDialog = ({
  isOpen,
  onClose,
  onConfirm,
  tenantName,
}: RemoveTenantDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Tenant from Property</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove {tenantName} from this property and release their unit. The tenant will still be available in the global tenants list. Are you sure you want to continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Remove Tenant
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
