
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Profile, UserRoleType } from "@/types/database";

// Create a schema with our updated roles
const userEditSchema = z.object({
  first_name: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  last_name: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  role: z.enum(['super_admin', 'property_manager', 'accounting', 'maintenance']).optional(),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }).optional(),
});

type UserEditFormValues = z.infer<typeof userEditSchema>;

interface EditUserDialogProps {
  user: Profile;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditUserDialog({ user, open, onClose, onSuccess }: EditUserDialogProps) {
  const { toast } = useToast();
  const [isPasswordSectionOpen, setIsPasswordSectionOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const form = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      role: (user.role as any) || undefined,
      password: "",
    },
  });

  const queryClient = useQueryClient();
  
  const onSubmit = async (values: UserEditFormValues) => {
    try {
      setSubmitting(true);
      console.log("Submitting form with values:", values);
      
      // Check if this is Sebastien's account to force super_admin role
      if (
        user.first_name?.toLowerCase() === "sebastien" && 
        user.last_name?.toLowerCase() === "godbout" && 
        user.email?.toLowerCase() === "s.godbout@hotmail.ca"
      ) {
        values.role = "super_admin";
        toast({
          title: "Notice",
          description: "This user is set as a permanent super admin",
        });
      }
      
      // Update profile information
      const profileUpdates = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
      };
      
      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdates)
        .eq("id", user.id);

      if (profileError) {
        throw profileError;
      }
      
      // Update role if provided - use the edge function to bypass RLS
      if (values.role) {
        console.log("Updating role to:", values.role);
        try {
          // Always use the edge function which bypasses RLS
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            throw new Error("No active session");
          }
          
          // Get the base URL from environment or use a constant
          const supabaseApiUrl = "https://rykgymnfaisnisssdgqp.supabase.co";
          
          const response = await fetch(
            `${supabaseApiUrl}/functions/v1/update-user`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: user.id,
                updates: { role: values.role, is_superadmin: values.role === 'super_admin' }
              }),
            }
          );
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error("Error updating role:", errorData);
            throw new Error(errorData.error || "Failed to update user role");
          }
          
          console.log("Role update successful");
        } catch (error) {
          console.error("Error during role update:", error);
          toast({
            title: "Warning",
            description: "User updated, but role could not be changed",
            variant: "destructive",
          });
        }
      }
      
      // Update password if provided
      if (values.password && values.password.length >= 8) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            throw new Error("No active session");
          }
          
          // Get the base URL from environment or use a constant
          const supabaseApiUrl = "https://rykgymnfaisnisssdgqp.supabase.co";
          
          const response = await fetch(
            `${supabaseApiUrl}/functions/v1/update-user`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: user.id,
                updates: { password: values.password }
              }),
            }
          );
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error("Error updating password:", errorData);
            throw new Error(errorData.error || "Failed to update user password");
          }
        } catch (error) {
          console.error("Error during password update:", error);
          toast({
            title: "Warning",
            description: "User updated, but password could not be changed",
            variant: "destructive",
          });
        }
      }
      
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error in update user flow:", error);
      toast({
        title: "Error",
        description: `Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Make changes to the user profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="First Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Last Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={
                      user.first_name?.toLowerCase() === "sebastien" && 
                      user.last_name?.toLowerCase() === "godbout" && 
                      user.email?.toLowerCase() === "s.godbout@hotmail.ca"
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="property_manager">Property Manager</SelectItem>
                      <SelectItem value="accounting">Accounting</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                  {user.first_name?.toLowerCase() === "sebastien" && 
                   user.last_name?.toLowerCase() === "godbout" && 
                   user.email?.toLowerCase() === "s.godbout@hotmail.ca" && (
                    <div className="text-xs text-muted-foreground">
                      This user is a permanent super admin
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Collapsible 
              open={isPasswordSectionOpen} 
              onOpenChange={setIsPasswordSectionOpen}
              className="border rounded-md p-2 space-y-2"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Password Management</h4>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                    {isPasswordSectionOpen ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    }
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Leave blank to keep current password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CollapsibleContent>
            </Collapsible>
            
            <Button 
              type="submit" 
              disabled={submitting}
              className="mt-4 w-full"
            >
              {submitting ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
