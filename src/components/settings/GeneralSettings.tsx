import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface UserSettings {
  account_name: string;
  account_url: string;
  data_region: string;
}

export function GeneralSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, setValue } = useForm<UserSettings>();

  // Fetch user settings
  const { data: settings } = useQuery({
    queryKey: ["user-settings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Try to get existing settings
      const { data: existingSettings, error: fetchError } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching settings:", fetchError);
        throw fetchError;
      }

      // If no settings exist, create them
      if (!existingSettings) {
        const { data: newSettings, error: createError } = await supabase
          .from("user_settings")
          .insert([{ user_id: user.id }])
          .select()
          .single();

        if (createError) {
          console.error("Error creating settings:", createError);
          throw createError;
        }

        return newSettings;
      }

      return existingSettings;
    },
  });

  // Update form when settings are loaded
  useEffect(() => {
    if (settings) {
      setValue("account_name", settings.account_name || "");
      setValue("account_url", settings.account_url || "");
    }
  }, [settings, setValue]);

  // Update settings mutation
  const updateSettings = useMutation({
    mutationFn: async (data: UserSettings) => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("user_settings")
        .update({
          account_name: data.account_name,
          account_url: data.account_url,
        })
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-settings"] });
      toast({
        title: "Settings updated",
        description: "Your settings have been saved successfully.",
      });
    },
    onError: (error) => {
      console.error("Error updating settings:", error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const onSubmit = (data: UserSettings) => {
    updateSettings.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-6">Profile</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
          <div className="space-y-2">
            <label className="text-sm font-medium">Account name</label>
            <Input
              {...register("account_name")}
              placeholder="Enter account name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Account URL (Web address)</label>
            <div className="flex items-center gap-2">
              <Input
                {...register("account_url")}
                placeholder="Enter URL"
              />
              <span className="text-muted-foreground">.citadel.com</span>
            </div>
          </div>

          <Alert className="bg-accent/50 border-accent mt-4">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              When you change your account's URL, we'll redirect from the old one for 30 days.
            </AlertDescription>
          </Alert>

          <div className="space-y-2 mt-6">
            <label className="text-sm font-medium">Your data is stored in</label>
            <div className="flex items-center gap-2">
              <span>{settings?.data_region || "United States"}</span>
              <img src="/placeholder.svg" alt="US Flag" className="h-4 w-6" />
            </div>
          </div>

          <Button 
            type="submit" 
            className="mt-6"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </div>
    </div>
  );
}