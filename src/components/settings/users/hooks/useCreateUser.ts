
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CreateUserFormValues } from "../schemas/userSchema";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

type CreateUserPayload = {
  userData: CreateUserFormValues;
  session: Session;
};

export function useCreateUser(onSuccess: () => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateUserPayload) => {
      try {
        const { userData, session } = payload;
        console.log("Starting user creation process with session", !!session);
        
        if (!session) {
          console.error("No active session provided to mutation");
          throw new Error("Authentication required: Please sign in again");
        }
        
        // Verify session is still valid
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !sessionData.session) {
          console.error("Session verification failed:", sessionError || "No active session");
          throw new Error("Your session has expired. Please sign in again");
        }
        
        console.log("Session verified, access token valid");
        
        // Call the edge function with proper authorization
        const response = await supabase.functions.invoke("create-user", {
          body: {
            email: userData.email,
            password: userData.password,
            userData: {
              first_name: userData.first_name,
              last_name: userData.last_name,
              role: userData.role
            }
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        console.log("Function response:", response);
        
        if (response.error) {
          console.error("Function returned an error:", response.error);
          throw new Error(response.error.message || "Server error");
        }
        
        if (!response.data) {
          throw new Error("Empty response from server");
        }
        
        if (response.data.error) {
          console.error("Error in response data:", response.data.error);
          throw new Error(response.data.error);
        }
        
        return response.data;
      } catch (error) {
        console.error("Error in function call:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onSuccess();
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error("Error creating user:", error);
      
      toast({
        title: "Error",
        description: `Failed to create user: ${errorMessage}`,
        variant: "destructive",
      });
    },
  });
}
