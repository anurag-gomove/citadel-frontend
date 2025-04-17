
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface NewUnitFormProps {
  open: boolean;
  onClose: () => void;
  propertyId: string;
  onSuccess?: () => void;
}

export function NewUnitForm({ open, onClose, propertyId }: NewUnitFormProps) {
  // Check if this is a single unit property
  const { data: property } = useQuery({
    queryKey: ["property-classification", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("primary_classification")
        .eq("id", propertyId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  // Check if the property already has units
  const { data: existingUnits } = useQuery({
    queryKey: ["property-unit-count", propertyId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("units")
        .select("id", { count: 'exact' })
        .eq("property_id", propertyId);

      if (error) throw error;
      return { count: count || 0 };
    },
    enabled: open && property?.primary_classification === "Single Unit property",
  });

  const isSingleUnitProperty = property?.primary_classification === "Single Unit property";
  const hasExistingUnit = (existingUnits?.count || 0) > 0;
  const showSingleUnitWarning = isSingleUnitProperty && hasExistingUnit;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Unit</DialogTitle>
        </DialogHeader>
        
        {showSingleUnitWarning && (
          <Alert className="bg-amber-50 border-amber-200">
            <Info className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-700">
              This is a Single Unit property and already has a unit. Only one unit is allowed for this property type.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Add form content here */}
      </DialogContent>
    </Dialog>
  );
}
