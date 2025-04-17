
import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NewPropertyFormProps {
  open: boolean;
  onClose: () => void;
  organizationId: string;
  onSuccess?: () => void;
}

export function NewPropertyForm({ open, onClose, organizationId, onSuccess }: NewPropertyFormProps) {
  const [name, setName] = useState("");
  const [streetNumber, setStreetNumber] = useState("");
  const [streetName, setStreetName] = useState("");
  const [municipality, setMunicipality] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: createProperty, isPending } = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // Construct a full address from the components
      const address = `${streetNumber} ${streetName}, ${municipality}`;

      const { data, error } = await supabase
        .from("properties")
        .insert({
          name,
          address,
          street_number: streetNumber,
          street_name: streetName,
          municipality,
          organization_id: organizationId,
          owner_id: user.id,
          type: "residential",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast({
        title: "Success",
        description: "Property created successfully",
      });
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create property",
        variant: "destructive",
      });
      console.error("Error creating property:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProperty();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Property</DialogTitle>
          <DialogDescription>
            Add a new property to your portfolio
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Property Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="streetNumber">Street No.</Label>
              <Input
                id="streetNumber"
                value={streetNumber}
                onChange={(e) => setStreetNumber(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="streetName">Street Name</Label>
              <Input
                id="streetName"
                value={streetName}
                onChange={(e) => setStreetName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="municipality">Municipality</Label>
            <Input
              id="municipality"
              value={municipality}
              onChange={(e) => setMunicipality(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Property"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
