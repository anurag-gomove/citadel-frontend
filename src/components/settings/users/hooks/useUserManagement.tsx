import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/types/database";
import { ensureSuperAdmin } from "../utils/userUtils";

export function useUserManagement() {
  const [editUser, setEditUser] = useState<Profile | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Custom toast wrapper function for ensureSuperAdmin
  const showToastMessage = (title: string, description: string, variant?: 'default' | 'destructive') => {
    toast({
      title,
      description,
      variant: variant || 'default',
    });
  };

  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      console.log("Fetching all users");
      
      try {
        // Get the current user's session to identify their organization
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          throw new Error("No active session found");
        }

        const currentUserId = sessionData.session.user.id;
        console.log("Current user ID:", currentUserId);

        // Get the organization ID of the current user
        const { data: currentUserData, error: currentUserError } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', currentUserId)
          .single();

        if (currentUserError) {
          console.error("Error fetching current user profile:", currentUserError);
          throw currentUserError;
        }

        const orgId = currentUserData.organization_id;
        console.log("Filtering users by organization ID:", orgId);

        // Direct query to get all profiles in the same organization
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .eq('organization_id', orgId);

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          throw profilesError;
        }

        if (!profiles || profiles.length === 0) {
          console.log("No profiles found");
          return [];
        }

        console.log(`Found ${profiles.length} profiles with direct query:`, profiles);
        return processFetchedProfiles(profiles as Profile[]);
      } catch (error) {
        console.error("Error in fetching users:", error);
        throw error;
      }
    },
    staleTime: 0, // Don't cache the data, always refresh
  });

  // Helper function to process profiles and add roles
  async function processFetchedProfiles(profiles: Profile[]) {
    try {
      // Add roles to profiles
      console.log("Fetching roles for users");
      const profilesWithRoles = await Promise.all(
        profiles.map(async (profile) => {
          try {
            // Check if the user is a super admin via the is_superadmin flag
            if (profile.is_superadmin) {
              return {
                ...profile,
                role: 'super_admin' as const
              };
            }
            
            // Get role via edge function to avoid infinite recursion
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
              console.error("No active session found when fetching roles");
              return { ...profile, role: null };
            }
            
            const response = await supabase.functions.invoke('get-user-role', {
              body: { userId: profile.id },
              headers: {
                Authorization: `Bearer ${session.access_token}`
              }
            });
            
            if (response.error) {
              console.error(`Error fetching role for user ${profile.id}:`, response.error);
              return { ...profile, role: null };
            }
            
            console.log(`Role for user ${profile.email}:`, response.data?.role);
            return {
              ...profile,
              role: response.data?.role || null
            };
          } catch (error) {
            console.error(`Error processing role for user ${profile.id}:`, error);
            return { ...profile, role: null };
          }
        })
      );
      
      console.log("All users with roles:", profilesWithRoles);
      return profilesWithRoles;
    } catch (error) {
      console.error("Error fetching user roles:", error);
      // Return profiles without roles as fallback
      return profiles.map(profile => ({ ...profile, role: null }));
    }
  }

  // Handle edit user
  const handleEdit = (user: Profile) => {
    setEditUser(user);
  };

  // Handle close edit dialog
  const handleCloseEditDialog = () => {
    setEditUser(null);
  };

  // Handle user updated
  const handleUserUpdated = () => {
    refetch(); // Directly trigger a refetch for immediate update
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  // Handle delete user
  const handleDelete = async (id: string) => {
    try {
      // First check if the user is a super admin
      const userToDelete = users?.find(user => user.id === id);
      
      if (userToDelete?.role === "super_admin") {
        // Count super admins
        const superAdminCount = users?.filter(user => user.role === "super_admin").length || 0;
        
        if (superAdminCount <= 1) {
          toast({
            title: "Error",
            description: "Cannot delete the last super admin in the organization",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Prevent deletion of Sebastien Godbout
      const userProfile = userToDelete as Profile;
      if (userProfile && (userProfile.first_name?.toLowerCase() === "sebastien" && 
          userProfile.last_name?.toLowerCase() === "godbout" && 
          userProfile.email?.toLowerCase() === "s.godbout@hotmail.ca")) {
        toast({
          title: "Error",
          description: "This user cannot be deleted as they are a permanent super admin",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("profiles").delete().eq("id", id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
      console.error("Error deleting user:", error);
    }
  };

  return {
    users,
    isLoading,
    error: error as Error | null,
    editUser,
    showCreateDialog,
    showToastMessage,
    setShowCreateDialog,
    handleEdit,
    handleCloseEditDialog,
    handleUserUpdated,
    handleDelete,
    refetch, // Still expose refetch for internal use
  };
}
