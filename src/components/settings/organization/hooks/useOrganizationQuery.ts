
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Organization {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
  user_count?: number;
  property_count?: number;
  tenant_count?: number;
  user_roles?: { role: string; count: number }[];
  recent_logins?: { user_email: string; timestamp: string; first_name?: string; last_name?: string }[];
}

export function useOrganizationQuery() {
  return useQuery({
    queryKey: ["organization"],
    queryFn: async (): Promise<Organization> => {
      // First, get the current user's profile to get their organization_id
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Not authenticated");
      }
      
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();
      
      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        throw new Error("Could not retrieve organization information");
      }
      
      if (!profileData.organization_id) {
        throw new Error("User is not associated with any organization");
      }

      // Fetch organization details
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", profileData.organization_id)
        .single();
      
      if (orgError) {
        console.error("Error fetching organization:", orgError);
        throw new Error("Could not retrieve organization details");
      }

      // Fetch additional stats about the organization
      // 1. Count users in this organization
      const { count: userCount, error: userCountError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", profileData.organization_id);
      
      if (userCountError) {
        console.error("Error counting users:", userCountError);
      }

      // 2. Count properties in this organization
      const { count: propertyCount, error: propertyCountError } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", profileData.organization_id);
      
      if (propertyCountError) {
        console.error("Error counting properties:", propertyCountError);
      }

      // 3. Count tenants in this organization
      // First, get the property IDs belonging to the organization
      const { data: propertyIds, error: propertyIdsError } = await supabase
        .from("properties")
        .select("id")
        .eq("organization_id", profileData.organization_id);
      
      let tenantCount = 0;
      if (propertyIdsError) {
        console.error("Error fetching property IDs:", propertyIdsError);
      } else if (propertyIds && propertyIds.length > 0) {
        // Now use the property IDs to count tenants
        const propertyIdArray = propertyIds.map(p => p.id);
        const { count: tCount, error: tenantCountError } = await supabase
          .from("tenants")
          .select("*", { count: "exact", head: true })
          .in("property_id", propertyIdArray);
        
        if (tenantCountError) {
          console.error("Error counting tenants:", tenantCountError);
        } else {
          tenantCount = tCount || 0;
        }
      }

      // 4. Get user roles breakdown
      // First, get the user IDs belonging to the organization
      const { data: userIds, error: userIdsError } = await supabase
        .from("profiles")
        .select("id")
        .eq("organization_id", profileData.organization_id);
      
      let userRoles: { role: string; count: number }[] = [];
      if (userIdsError) {
        console.error("Error fetching user IDs:", userIdsError);
      } else if (userIds && userIds.length > 0) {
        // Now use the user IDs to get role information
        const userIdArray = userIds.map(u => u.id);
        const { data: userRolesData, error: userRolesError } = await supabase
          .from("user_roles")
          .select("role")
          .in("user_id", userIdArray);
        
        if (userRolesError) {
          console.error("Error fetching user roles:", userRolesError);
        } else if (userRolesData) {
          // Count occurrences of each role
          const roleCounts: Record<string, number> = {};
          userRolesData.forEach(item => {
            const role = item.role;
            roleCounts[role] = (roleCounts[role] || 0) + 1;
          });
          
          // Convert to array of objects
          userRoles = Object.entries(roleCounts).map(([role, count]) => ({
            role,
            count
          }));
        }
      }

      // 5. Get recent user logins (from profiles table's updated_at field)
      const { data: recentLoginsData, error: recentLoginsError } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name, updated_at")
        .eq("organization_id", profileData.organization_id)
        .order("updated_at", { ascending: false })
        .limit(5);
      
      let recentLogins: { user_email: string; timestamp: string; first_name?: string; last_name?: string }[] = [];
      if (recentLoginsError) {
        console.error("Error fetching recent logins:", recentLoginsError);
      } else if (recentLoginsData) {
        recentLogins = recentLoginsData.map(profile => ({
          user_email: profile.email || 'Unknown',
          timestamp: profile.updated_at || '',
          first_name: profile.first_name,
          last_name: profile.last_name
        }));
      }

      return {
        ...orgData,
        user_count: userCount || 0,
        property_count: propertyCount || 0,
        tenant_count: tenantCount,
        user_roles: userRoles,
        recent_logins: recentLogins
      };
    }
  });
}
