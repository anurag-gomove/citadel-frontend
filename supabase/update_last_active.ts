
// Update the last_active timestamp for the current user
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const handler = async (req: any) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "user_id is required" }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { error } = await supabase
      .from('profiles')
      .update({ last_active: new Date().toISOString() })
      .eq('id', user_id);

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error updating last_active:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update last_active' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}
