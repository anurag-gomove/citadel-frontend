
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { UserForm } from "./UserForm";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CreateUserFormValues } from "../schemas/userSchema";

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateUserDialog({ open, onClose, onSuccess }: CreateUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (formValues: CreateUserFormValues) => {
    console.log("[CreateUserDialog:START] Starting user creation with data:", {
      ...formValues,
      email: formValues.email,
      password: "********", // Don't log the actual password
      role: formValues.role
    });
    setIsSubmitting(true);

    try {
      // Get current session
      console.log("[CreateUserDialog] Fetching current session");
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        console.error("[CreateUserDialog] Session error:", sessionError);
        throw new Error(sessionError?.message || "No active session found. Please login again.");
      }

      console.log("[CreateUserDialog] Session retrieved successfully, access token length:", session.access_token.length);

      // Get current user's organization ID directly from the session
      const userId = session.user.id;
      console.log("[CreateUserDialog] Current user ID:", userId);
      
      const { data: currentUser, error: currentUserError } = await supabase
        .from('profiles')
        .select('organization_id, is_superadmin')
        .eq('id', userId)
        .single();

      if (currentUserError) {
        console.error("[CreateUserDialog] Error fetching current user profile:", currentUserError);
        throw new Error("Error fetching your profile: " + currentUserError.message);
      }

      // Fixed error - safely access organization_id only if currentUser exists
      if (!currentUser) {
        console.error("[CreateUserDialog] No user profile found");
        throw new Error("Your user profile could not be found. Please contact support.");
      }

      console.log("[CreateUserDialog] Current user profile data:", currentUser);

      const orgId = currentUser.organization_id;
      if (!orgId) {
        console.error("[CreateUserDialog] No organization ID found for current user");
        throw new Error("You don't belong to an organization. Please contact support.");
      }
      
      console.log("[CreateUserDialog] Creating user in organization:", orgId);

      // Check current database schema for debugging
      console.log("[CreateUserDialog] Checking user_roles table schema");
      const { data: userRolesSchema, error: schemaError } = await supabase.rpc('get_table_info', { table_name: 'user_roles' });
      if (schemaError) {
        console.error("[CreateUserDialog] Error fetching user_roles schema:", schemaError);
      } else {
        console.log("[CreateUserDialog] user_roles table schema:", userRolesSchema);
      }

      // Prepare payload for edge function
      const payload = {
        email: formValues.email.trim().toLowerCase(),
        password: formValues.password,
        userData: {
          first_name: formValues.first_name,
          last_name: formValues.last_name,
          role: formValues.role
        },
        organizationId: orgId
      };
      
      console.log("[CreateUserDialog] Payload for edge function:", {
        ...payload,
        password: "********" // Don't log the actual password
      });

      // Use constants for the URLs
      const SUPABASE_URL = "https://rykgymnfaisnisssdgqp.supabase.co";
      const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5a2d5bW5mYWlzbmlzc3NkZ3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyNjUxNzAsImV4cCI6MjA1NTg0MTE3MH0.jGvXkXSM47t6xm0ydpkxLBp9Y2iSFxRKAO_pn9ff82k";

      console.log("[CreateUserDialog] Edge function URL:", `${SUPABASE_URL}/functions/v1/create-user`);
      console.log("[CreateUserDialog] Auth token present:", !!session.access_token);
      console.log("[CreateUserDialog] Headers being sent:", {
        'Authorization': `Bearer ${session.access_token ? 'token-exists' : 'no-token'}`,
        'Content-Type': 'application/json',
        'apikey': ANON_KEY ? 'key-exists' : 'no-key'
      });

      // Call edge function with proper authorization header
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/create-user`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'apikey': ANON_KEY
          },
          body: JSON.stringify(payload)
        }
      );
      
      console.log("[CreateUserDialog] Edge function response status:", response.status);
      
      let responseText = "";
      try {
        // Try to get the raw response body for better debugging
        responseText = await response.text();
        console.log("[CreateUserDialog] Edge function raw response:", responseText);
        
        // Parse the JSON response (do this manually since we've already read the text)
        const responseData = JSON.parse(responseText);
        console.log("[CreateUserDialog] Edge function parsed response data:", responseData);
        
        if (!response.ok) {
          console.error("[CreateUserDialog] Edge function error:", responseData);
          throw new Error(responseData.error || "Failed to create user");
        }
        
        // Verify if user was actually created
        console.log("[CreateUserDialog] Verifying user creation - attempting to fetch created user");
        const { data: verifyUser, error: verifyError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', formValues.email.trim().toLowerCase())
          .eq('organization_id', orgId)
          .single();
          
        if (verifyError) {
          console.error("[CreateUserDialog] Verification check failed, user might not be created:", verifyError);
        } else if (verifyUser) {
          console.log("[CreateUserDialog] User verified and exists in profiles:", verifyUser.id);
          
          // Also verify if role was assigned
          const { data: verifyRole, error: verifyRoleError } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', verifyUser.id)
            .single();
            
          if (verifyRoleError) {
            console.error("[CreateUserDialog] Role verification failed:", verifyRoleError);
          } else if (verifyRole) {
            console.log("[CreateUserDialog] Role verified:", verifyRole);
          } else {
            console.warn("[CreateUserDialog] Role record not found for created user");
          }
        } else {
          console.warn("[CreateUserDialog] User verification failed - profile record not found");
        }
        
        toast({
          title: "Success",
          description: "User created successfully",
        });
        
        // Invalidate queries to refresh user list
        console.log("[CreateUserDialog] Invalidating users query to refresh the list");
        queryClient.invalidateQueries({ queryKey: ["users"] });
        
        onClose();
        if (onSuccess) {
          console.log("[CreateUserDialog] Calling onSuccess callback");
          onSuccess();
        }
      } catch (parseError) {
        console.error("[CreateUserDialog] Error parsing response:", parseError, "Raw response was:", responseText);
        throw new Error("Failed to parse server response: " + parseError.message);
      }
    } catch (error: any) {
      console.error("[CreateUserDialog:ERROR] Error creating user:", error);
      
      let errorMessage = "Failed to create user";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      console.log("[CreateUserDialog:END] User creation process completed");
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
          <DialogDescription>
            Add a new user to your organization.
          </DialogDescription>
        </DialogHeader>
        <UserForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
