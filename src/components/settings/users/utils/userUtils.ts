
import { supabase } from "@/integrations/supabase/client";
import { Profile, UserRoleType } from "@/types/database";

// Helper functions for user role formatting
export const getRoleBadgeVariant = (role: string | null): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "neutral" => {
  // Using a consistent, less aggressive color scheme for all roles
  switch (role) {
    case 'super_admin':
      return 'secondary'; // Changed from destructive to secondary
    case 'property_manager':
      return 'secondary';
    case 'accounting':
      return 'secondary';
    case 'maintenance':
      return 'secondary';
    default:
      return 'secondary';
  }
};

export const formatRoleName = (role: string | null) => {
  if (!role) return 'No Role';
  
  return role
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Check if a user is the special super admin
export const isSebastienGodbout = (user: Profile): boolean => {
  return (
    user.first_name?.toLowerCase() === "sebastien" && 
    user.last_name?.toLowerCase() === "godbout" && 
    user.email?.toLowerCase() === "s.godbout@hotmail.ca"
  );
};

// Function to ensure Sebastien Godbout is always a super admin
export const ensureSuperAdmin = async (users: Profile[], showToast?: (title: string, description: string, variant?: 'default' | 'destructive') => void) => {
  if (!users) return;
  
  // Find Sebastien's profile
  const sebastienProfile = users.find(user => isSebastienGodbout(user));
  
  if (sebastienProfile && !sebastienProfile.is_superadmin) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("No active session found when ensuring super admin");
        return;
      }
      
      // Use the update-user edge function to set super admin status
      const response = await supabase.functions.invoke('update-user', {
        body: {
          userId: sebastienProfile.id,
          updates: {
            role: "super_admin" as UserRoleType,
            is_superadmin: true
          }
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (response.error) {
        console.error("Error updating Sebastien's role:", response.error);
        return;
      }
      
      if (showToast) {
        showToast(
          "System Update",
          "Sebastien Godbout has been set as a super admin"
        );
      }
    } catch (error) {
      console.error("Error setting Sebastien as super admin:", error);
    }
  }
  
  // Check if there's at least one super admin
  const superAdminCount = users.filter(user => 
    user.is_superadmin || user.role === "super_admin"
  ).length;
  
  if (superAdminCount === 0 && showToast) {
    showToast(
      "Warning",
      "There are no super admins in your organization. This is required for proper system functioning.",
      "destructive"
    );
  }
};

// Function to directly get a user's role without relying on RLS policies
export const getUserRole = async (userId: string): Promise<UserRoleType | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error("No active session found when getting user role");
      return null;
    }
    
    // Call the edge function to get the role securely
    const response = await supabase.functions.invoke('get-user-role', {
      body: { userId },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });
    
    if (response.error) {
      console.error("Error getting user role:", response.error);
      return null;
    }
    
    return response.data.role as UserRoleType;
  } catch (error) {
    console.error("Error in getUserRole:", error);
    return null;
  }
};
