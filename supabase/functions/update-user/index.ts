
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// This function updates a user's role securely, bypassing RLS policies

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('update-user function called')
    
    // Initialize Supabase admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization') || '';
    
    // Initialize client with auth header for current user verification
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );
    
    // Verify session
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
    if (sessionError || !session) {
      console.error('Session error:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Authentication error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    const { userId, updates } = body;
    
    if (!userId || !updates) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId or updates' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log('Updating user:', userId);
    console.log('Updates:', updates);
    
    // Check if the current user is a super admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_superadmin, organization_id')
      .eq('id', session.user.id)
      .single();
      
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Could not verify permissions' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }
    
    if (!profile?.is_superadmin) {
      return new Response(
        JSON.stringify({ error: 'Permission denied: Only super admins can update user roles' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }
    
    // Special handling for Sebastien Godbout
    const { data: userToUpdate, error: userCheckError } = await supabaseAdmin
      .from('profiles')
      .select('first_name, last_name, email, is_superadmin')
      .eq('id', userId)
      .single();
      
    if (userCheckError) {
      console.error('Error fetching user to update:', userCheckError);
      return new Response(
        JSON.stringify({ error: 'Could not fetch user to update' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Check if this is Sebastien Godbout
    const isSebastien = 
      userToUpdate.first_name?.toLowerCase() === 'sebastien' && 
      userToUpdate.last_name?.toLowerCase() === 'godbout' && 
      userToUpdate.email?.toLowerCase() === 's.godbout@hotmail.ca';
      
    if (isSebastien && (!updates.is_superadmin || updates.role !== 'super_admin')) {
      console.log('Protecting Sebastien\'s super admin status');
      updates.is_superadmin = true;
      updates.role = 'super_admin';
    }
    
    // Validate role if it's being updated
    if (updates.role) {
      const validRoles = ['super_admin', 'property_manager', 'accounting', 'maintenance'];
      if (!validRoles.includes(updates.role)) {
        return new Response(
          JSON.stringify({ error: `Invalid role: ${updates.role}. Valid roles are: ${validRoles.join(', ')}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
    }
    
    // Update profile if needed
    if (updates.is_superadmin !== undefined || 
        updates.first_name || 
        updates.last_name || 
        updates.email || 
        updates.status) {
      const profileUpdates: any = {};
      
      if (updates.is_superadmin !== undefined) profileUpdates.is_superadmin = updates.is_superadmin;
      if (updates.first_name) profileUpdates.first_name = updates.first_name;
      if (updates.last_name) profileUpdates.last_name = updates.last_name;
      if (updates.email) profileUpdates.email = updates.email;
      if (updates.status) profileUpdates.status = updates.status;
      
      console.log('Updating profile with:', profileUpdates);
      const { error: updateProfileError } = await supabaseAdmin
        .from('profiles')
        .update(profileUpdates)
        .eq('id', userId);
        
      if (updateProfileError) {
        console.error('Error updating profile:', updateProfileError);
        return new Response(
          JSON.stringify({ error: 'Could not update user profile' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }
    
    // Update role if needed
    if (updates.role) {
      // Check if the role record exists
      const { data: existingRole, error: roleCheckError } = await supabaseAdmin
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (roleCheckError && roleCheckError.code !== 'PGRST116') {
        console.error('Error checking existing role:', roleCheckError);
        return new Response(
          JSON.stringify({ error: 'Could not check existing role' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      if (existingRole) {
        // Update existing role
        console.log('Updating existing role to:', updates.role);
        const { error: updateRoleError } = await supabaseAdmin
          .from('user_roles')
          .update({ role: updates.role })
          .eq('user_id', userId);
          
        if (updateRoleError) {
          console.error('Error updating role:', updateRoleError);
          return new Response(
            JSON.stringify({ error: 'Could not update user role' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
      } else {
        // Insert new role
        console.log('Inserting new role:', updates.role);
        const { error: insertRoleError } = await supabaseAdmin
          .from('user_roles')
          .insert({ user_id: userId, role: updates.role });
          
        if (insertRoleError) {
          console.error('Error inserting role:', insertRoleError);
          return new Response(
            JSON.stringify({ error: 'Could not insert user role' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
      }
    }
    
    console.log('User updated successfully');
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in update-user function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})
