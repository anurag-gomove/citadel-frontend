
import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CreateFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateFormDialog({ open, onClose, onSuccess }: CreateFormDialogProps) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const session = useSession();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("forms")
        .insert({
          name,
          category: "general",
          created_by: session.user.id,
          organization_id: session.user.id // You might want to get this from user's profile
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Form created successfully",
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error creating form:", error);
      toast({
        title: "Error",
        description: "Failed to create form",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Form</DialogTitle>
          <DialogDescription>
            Create a new form template
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Form Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Form"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
