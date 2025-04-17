
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface RequestBody {
  userId: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Get request body
    const requestBody: RequestBody = await req.json();
    const { userId } = requestBody;
    
    if (!userId) {
      console.error('User ID is missing in request');
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`Fetching role for user ID: ${userId}`);
    
    // Create Supabase client with service key to bypass RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { 'X-Client-Info': 'supabase-deno/get-user-role-function' } } }
    );
    
    // Get user role from user_roles table
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching user role:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const role = data?.role || null;
    console.log(`Role for user ${userId}: ${role}`);
    
    // Also fetch the user's profile to ensure we have organization info
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id, is_superadmin, first_name, last_name, email')
      .eq('id', userId)
      .maybeSingle();
      
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
    } else if (profileData) {
      console.log(`User profile: ${JSON.stringify({
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        email: profileData.email,
        organization_id: profileData.organization_id,
        is_superadmin: profileData.is_superadmin
      })}`);
    }
    
    return new Response(JSON.stringify({ role }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Unhandled error:', error);
    return new Response(JSON.stringify({ 
      error: `Server error: ${error instanceof Error ? error.message : String(error)}` 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
