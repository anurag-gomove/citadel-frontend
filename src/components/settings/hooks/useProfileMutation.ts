
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { Profile } from "@/types/database";

interface ProfileFormData {
  first_name: string;
  last_name: string;
  phone_number: string;
  mobile_phone: string;
  location: string;
  language: "en" | "fr";
  theme: "light" | "dark";
}

export function useProfileMutation(setIsLoading: (loading: boolean) => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { setTheme } = useTheme();

  return useMutation({
    mutationFn: async (data: ProfileFormData) => {
      setIsLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase.rpc('update_own_profile', {
        user_id: user.id,
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number: data.phone_number,
        mobile_phone: data.mobile_phone,
        location: data.location,
        language: data.language,
        theme: data.theme
      });

      if (error) throw error;
      
      setTheme(data.theme);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });
}
