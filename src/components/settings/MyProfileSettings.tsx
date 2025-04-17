
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ProfileForm } from "./components/ProfileForm";
import { useProfileQuery } from "./hooks/useProfileQuery";
import { useProfileMutation } from "./hooks/useProfileMutation";

export function MyProfileSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { data: profile, isLoading: isLoadingProfile, error } = useProfileQuery();
  const updateProfile = useProfileMutation(setIsLoading);

  if (error) {
    console.error("Error loading profile:", error);
    return (
      <div className="p-4">
        <p className="text-red-500">Error loading profile. Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-6">My Profile</h2>
        <ProfileForm 
          profile={profile}
          isLoading={isLoading || isLoadingProfile}
          onSubmit={updateProfile.mutate}
          onPasswordReset={() => {}}
        />
      </div>
    </div>
  );
}
