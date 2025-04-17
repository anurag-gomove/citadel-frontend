
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile, UserRoleType } from '@/types/database';

export const useProfileQuery = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<Profile> => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          organizations (
            name
          )
        `)
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (!data) {
        throw new Error('Profile not found');
      }

      // Get user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
        
      // Map the database response to our Profile type
      const profile: Profile = {
        id: data.id,
        first_name: data.first_name || null,
        last_name: data.last_name || null,
        email: data.email || null,
        phone_number: data.phone_number || null,
        mobile_phone: data.mobile_phone || null,
        location: data.location || null,
        language: data.language as "en" | "fr" || "en",
        theme: data.theme as "light" | "dark" || "light",
        organization_id: data.organization_id || null,
        status: data.status as "active" | "inactive" || "active",
        role: (roleData?.role || 'property_manager') as UserRoleType,
        is_superadmin: data.is_superadmin || false,
        created_at: data.created_at || null,
        updated_at: data.updated_at || null,
      };
      
      return profile;
    },
  });
};
