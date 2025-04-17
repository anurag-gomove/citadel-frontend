
// Supabase Edge Function to create users with additional data and role
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://rykgymnfaisnisssdgqp.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

// Detailed logging function
function log(message: string, data?: any) {
  console.log(`[create-user] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

Deno.serve(async (req) => {
  log('Function invoked');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    log('Handling OPTIONS request (CORS preflight)');
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Create Supabase client with admin privileges
    const supabaseAdmin = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    
    // Only process POST requests
    if (req.method !== 'POST') {
      log('Invalid method', { method: req.method });
      return new Response(
        JSON.stringify({ error: `Method ${req.method} not allowed` }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 405,
        }
      );
    }

    // Parse request body
    let requestData;
    try {
      requestData = await req.json();
      log('Request data received', {
        email: requestData.email,
        hasPassword: !!requestData.password,
        userData: requestData.userData,
        organizationId: requestData.organizationId,
      });
    } catch (error) {
      log('Error parsing request JSON', { error: error.message });
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Validate required fields
    const { email, password, userData, organizationId } = requestData;
    
    if (!email || !password || !userData || !organizationId) {
      const missingFields = [];
      if (!email) missingFields.push('email');
      if (!password) missingFields.push('password');
      if (!userData) missingFields.push('userData');
      if (!organizationId) missingFields.push('organizationId');
      
      log('Missing required fields', { missingFields });
      return new Response(
        JSON.stringify({ error: `Missing required fields: ${missingFields.join(', ')}` }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Validate that email has a proper format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      log('Invalid email format', { email });
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Validate role is one of the allowed values (to match your database enum)
    const allowedRoles = ['super_admin', 'property_manager', 'accounting', 'maintenance'];
    const role = userData.role || 'property_manager';
    
    if (!allowedRoles.includes(role)) {
      log('Invalid role value', { providedRole: role, allowedRoles });
      return new Response(
        JSON.stringify({ 
          error: `Invalid role. Must be one of: ${allowedRoles.join(', ')}` 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    log('Creating new user account with auth.admin.createUser', { 
      email, 
      role,
      organizationId,
      first_name: userData.first_name,
      last_name: userData.last_name 
    });

    // Create user with auth API
    const { data: authUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: userData.first_name,
        last_name: userData.last_name,
      },
    });

    if (createUserError) {
      log('Error creating user in auth', { error: createUserError });
      return new Response(
        JSON.stringify({ error: `Failed to create user: ${createUserError.message}` }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    const newUserId = authUser.user.id;
    log('User created in auth successfully', { userId: newUserId });

    // Check if a profile already exists for this user (handle_new_user_signup trigger might have created one)
    log('Checking if profile already exists');
    const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', newUserId)
      .maybeSingle();

    if (profileCheckError) {
      log('Error checking existing profile', { error: profileCheckError });
    } else {
      log('Profile check result', { exists: !!existingProfile, profile: existingProfile });
    }

    // If profile exists, update it rather than inserting a new one
    if (existingProfile) {
      log('Profile already exists, updating instead of creating');
      const { error: updateProfileError } = await supabaseAdmin
        .from('profiles')
        .update({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          email: email,
          organization_id: organizationId,
          is_superadmin: role === 'super_admin',
          status: 'active'
        })
        .eq('id', newUserId);

      if (updateProfileError) {
        log('Error updating existing profile', { error: updateProfileError });
        throw new Error(`Failed to update profile: ${updateProfileError.message}`);
      }
      log('Successfully updated existing profile');
    } else {
      // Profile doesn't exist, create a new one
      log('No existing profile found, creating new profile');
      try {
        // First try the RPC function
        log('Attempting to create profile and role via RPC function');
        const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc(
          'create_user_profile_and_role',
          {
            user_id: newUserId,
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            user_email: email,
            org_id: organizationId,
            user_role: role,
            is_super: role === 'super_admin'
          }
        );

        if (rpcError) {
          log('RPC function error', { error: rpcError });
          
          // If RPC fails, try direct insertion as fallback
          log('RPC failed, trying direct insertion as fallback');
          
          // Create profile record
          log('Creating profile record directly');
          const { data: profileData, error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({
              id: newUserId,
              first_name: userData.first_name || '',
              last_name: userData.last_name || '',
              email: email,
              organization_id: organizationId,
              is_superadmin: role === 'super_admin',
              status: 'active'
            })
            .select()
            .single();
            
          if (profileError) {
            log('Error creating profile record', { error: profileError });
            throw new Error(`Failed to create profile: ${profileError.message}`);
          } else {
            log('Profile created successfully', { profile: profileData });
          }
        } else {
          log('RPC function success', { result: rpcResult });
        }
      } catch (dbError) {
        log('Database operations error', { error: dbError.message });
        
        // Don't delete the auth user if the error is due to a duplicate profile
        if (!dbError.message.includes('duplicate key value')) {
          // Delete the auth user since we couldn't complete the process
          log('Deleting auth user due to database error');
          const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(newUserId);
          
          if (deleteError) {
            log('Error deleting user after database failure', { error: deleteError });
          }
          
          return new Response(
            JSON.stringify({ error: `Failed to create user profile: ${dbError.message}` }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            }
          );
        } else {
          log('Ignoring duplicate key error since it likely means the profile was created by a trigger');
        }
      }
    }

    // Create or update role record
    log('Creating or updating user role record');
    // First check if role already exists
    const { data: existingRole, error: roleCheckError } = await supabaseAdmin
      .from('user_roles')
      .select('*')
      .eq('user_id', newUserId)
      .maybeSingle();
      
    if (roleCheckError && roleCheckError.code !== 'PGRST116') {
      log('Error checking existing role', { error: roleCheckError });
    } else {
      log('Role check result', { exists: !!existingRole, role: existingRole });
    }
    
    if (existingRole) {
      log('Role record exists, updating it');
      const { error: updateRoleError } = await supabaseAdmin
        .from('user_roles')
        .update({ role: role })
        .eq('user_id', newUserId);
        
      if (updateRoleError) {
        log('Error updating role record', { error: updateRoleError });
        throw new Error(`Failed to update role: ${updateRoleError.message}`);
      }
      log('Successfully updated role record');
    } else {
      log('No role record found, creating new one');
      const { error: insertRoleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: newUserId,
          role: role
        });
        
      if (insertRoleError) {
        log('Error creating role record', { error: insertRoleError });
        throw new Error(`Failed to create role: ${insertRoleError.message}`);
      }
      log('Successfully created role record');
    }

    // Verify the user was created correctly
    log('Verifying user was created correctly');
    const { data: verifyProfile, error: verifyError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', newUserId)
      .single();
      
    if (verifyError) {
      log('Error verifying profile creation', { error: verifyError });
    } else {
      log('Profile verified', { profile: verifyProfile });
      
      // Also verify role
      const { data: verifyRole, error: verifyRoleError } = await supabaseAdmin
        .from('user_roles')
        .select('*')
        .eq('user_id', newUserId)
        .single();
        
      if (verifyRoleError) {
        log('Error verifying role creation', { error: verifyRoleError });
      } else {
        log('Role verified', { role: verifyRole });
      }
    }

    log('User creation completed successfully');
    return new Response(
      JSON.stringify({ 
        success: true, 
        user: { 
          id: newUserId, 
          email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role
        } 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    log('Unexpected error', { error: error.message, stack: error.stack });
    return new Response(
      JSON.stringify({ error: `Server error: ${error.message}` }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
