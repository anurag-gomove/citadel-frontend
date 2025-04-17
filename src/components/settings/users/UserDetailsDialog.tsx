
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  status: "active" | "inactive";
  phone_number: string | null;
}

interface UserDetailsDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function UserDetailsDialog({ user, open, onOpenChange, onSuccess }: UserDetailsDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
    new_password: "",
  });

  useEffect(() => {
    if (open && user) {
      console.log("Fetching user details for:", user.id);
      const fetchUserDetails = async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user details:", error);
          toast.error("Failed to load user details");
          return;
        }

        console.log("Fetched user details:", data);
        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone_number: data.phone_number || "",
          email: data.email || "",
          new_password: "",
        });
      };

      fetchUserDetails();
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      // Update profile information first
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone_number: formData.phone_number,
          email: formData.email,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update email and/or password using the Edge Function
      if (formData.email !== user.email || formData.new_password) {
        const updateData: { userId: string; email?: string; password?: string } = {
          userId: user.id,
        };
        
        if (formData.email !== user.email) {
          updateData.email = formData.email;
        }
        
        if (formData.new_password) {
          updateData.password = formData.new_password;
        }

        const response = await fetch(
          `/functions/v1/update-user`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update user authentication details');
        }
      }

      toast.success("User details updated successfully");
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(error.message || "Failed to update user details");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new_password">New Password</Label>
              <Input
                id="new_password"
                type="password"
                placeholder="Leave blank to keep current password"
                value={formData.new_password}
                onChange={(e) =>
                  setFormData({ ...formData, new_password: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
