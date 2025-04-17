
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface NewPaymentFormProps {
  open: boolean;
  onClose: () => void;
  propertyId: string;
  onSuccess?: () => void;
}

export function NewPaymentForm({ open, onClose }: NewPaymentFormProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Payment</DialogTitle>
        </DialogHeader>
        {/* Add form content here */}
      </DialogContent>
    </Dialog>
  );
}
