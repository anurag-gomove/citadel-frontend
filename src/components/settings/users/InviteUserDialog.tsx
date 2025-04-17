
import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/FormInput";
import { useToast } from "@/hooks/use-toast";

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface CreateUserForm {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export function InviteUserDialog({ open, onOpenChange, onSuccess }: InviteUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateUserForm>();

  const onSubmit = async (data: CreateUserForm) => {
    console.log("Form submitted with data:", data);
    setIsLoading(true);
    try {
      // First, get the current user's organization_id
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("No active session found");
      }

      const { data: currentUser, error: currentUserError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', sessionData.session.user.id)
        .single();

      if (currentUserError) {
        console.error("Error fetching current user profile:", currentUserError);
        throw currentUserError;
      }

      const orgId = currentUser.organization_id;
      console.log("Creating user in organization:", orgId);

      // Use the create-user edge function to create the user with proper organization context
      const response = await supabase.functions.invoke('create-user', {
        body: {
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          organizationId: orgId,
          role: 'property_manager' // Default role
        }
      });

      if (response.error) {
        console.error("Error from create-user function:", response.error);
        throw new Error(response.error.message || "Failed to create user");
      }
      
      toast({
        title: "Success",
        description: "User created successfully",
      });
      
      reset();
      onOpenChange(false);
      onSuccess?.(); // Call onSuccess callback to refresh the users list
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
          <DialogDescription>
            Create a new user account with login credentials.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            label="First Name"
            type="text"
            {...register("firstName", { required: "First name is required" })}
            error={errors.firstName?.message}
            placeholder="Enter first name"
            required
          />

          <FormInput
            label="Last Name"
            type="text"
            {...register("lastName", { required: "Last name is required" })}
            error={errors.lastName?.message}
            placeholder="Enter last name"
            required
          />

          <FormInput
            label="Email"
            type="email"
            {...register("email", { 
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address"
              }
            })}
            error={errors.email?.message}
            placeholder="Enter email address"
            required
          />

          <FormInput
            label="Password"
            type="password"
            {...register("password", { 
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters"
              }
            })}
            error={errors.password?.message}
            placeholder="Enter password"
            required
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
