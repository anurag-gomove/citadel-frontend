
import { useState } from "react";
import { Send, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Tenant {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
}

interface SendFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  formId: string;
  formName: string;
}

export function SendFormDialog({ isOpen, onClose, formId, formName }: SendFormDialogProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const { toast } = useToast();

  const searchTenants = async (searchTerm: string) => {
    console.log("Searching tenants with term:", searchTerm);
    const { data, error } = await supabase
      .from('tenants')
      .select('id, first_name, last_name, phone')
      .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
      .limit(5);

    if (error) {
      console.error('Error searching tenants:', error);
      return;
    }

    console.log("Found tenants:", data);
    setTenants(data || []);
  };

  const handleTenantSelect = (tenant: Tenant) => {
    console.log("Selected tenant:", tenant);
    setSelectedTenant(tenant);
    if (tenant.phone) {
      setPhoneNumber(tenant.phone);
    }
    setIsCommandOpen(false);
  };

  const handleSendSMS = async () => {
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Please enter a phone number",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("No authenticated session");
      }

      const response = await fetch('/functions/v1/send-form-sms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId: formId,
          phone: phoneNumber,
          message: `Please complete the form: ${formName}`,
          tenantId: selectedTenant?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send SMS');
      }

      toast({
        title: "Success",
        description: "Form has been sent via SMS",
      });
      onClose();
      setPhoneNumber("");
      setSelectedTenant(null);
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast({
        title: "Error",
        description: "Failed to send the form via SMS",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Form via SMS</DialogTitle>
          <DialogDescription>
            Select a tenant or enter a phone number to send the form.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Popover open={isCommandOpen} onOpenChange={setIsCommandOpen}>
            <PopoverTrigger asChild>
              <div className="w-full">
                <Input 
                  placeholder="Search tenants..."
                  value={selectedTenant ? `${selectedTenant.first_name} ${selectedTenant.last_name}` : ""}
                  className="w-full"
                  onClick={() => setIsCommandOpen(true)}
                  readOnly
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <Command>
                <CommandInput 
                  placeholder="Search tenants..." 
                  onValueChange={searchTenants}
                />
                <CommandEmpty>No tenants found.</CommandEmpty>
                <CommandGroup className="max-h-[200px] overflow-auto">
                  {tenants.map((tenant) => (
                    <CommandItem
                      key={tenant.id}
                      value={`${tenant.first_name} ${tenant.last_name}`}
                      onSelect={() => handleTenantSelect(tenant)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedTenant?.id === tenant.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {tenant.first_name} {tenant.last_name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <Input
            type="tel"
            placeholder="Enter phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <Button 
            className="w-full" 
            onClick={handleSendSMS}
            disabled={isSending}
          >
            {isSending ? "Sending..." : "Send SMS"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
