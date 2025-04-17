import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Phone } from "lucide-react";

interface SendFormDialogProps {
  tenant: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
  };
  open: boolean;
  onClose: () => void;
}

export function SendFormDialog({ tenant, open, onClose }: SendFormDialogProps) {
  const [selectedForm, setSelectedForm] = useState<string>("");
  const [phone, setPhone] = useState(tenant.phone || "");

  const { data: forms } = useQuery({
    queryKey: ["forms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forms")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const handleSendForm = async () => {
    if (!selectedForm || !phone) return;
    
    console.log("Sending form:", {
      formId: selectedForm,
      tenantId: tenant.id,
      phone: phone,
    });
    
    // Reset form state
    setSelectedForm("");
    setPhone(tenant.phone || "");
    
    // Close the dialog
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] min-h-[400px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Send Form to Tenant</DialogTitle>
          <DialogDescription className="text-lg mt-2">
            Send a form to {tenant.first_name} {tenant.last_name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-6">
          <div className="grid gap-3">
            <Label htmlFor="form" className="text-lg">Select Form</Label>
            <Select
              value={selectedForm}
              onValueChange={setSelectedForm}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select a form" />
              </SelectTrigger>
              <SelectContent>
                {forms?.map((form) => (
                  <SelectItem key={form.id} value={form.id}>
                    {form.name} ({form.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-3">
            <Label htmlFor="phone" className="text-lg">Phone Number</Label>
            <div className="flex gap-3 items-center">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                className="h-12 text-lg"
              />
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} size="lg">
            Cancel
          </Button>
          <Button 
            onClick={handleSendForm} 
            disabled={!selectedForm || !phone}
            size="lg"
          >
            Send Form
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}