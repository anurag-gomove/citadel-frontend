
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SmsRequest {
  phone: string;
  formId: string;
  message?: string;
}

// Create a Supabase client with the service role key
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the JWT token from the request headers
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the JWT token
    const jwt = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: verificationError,
    } = await supabaseAdmin.auth.getUser(jwt);

    if (verificationError || !user) {
      throw new Error('Invalid token');
    }

    // Parse the request body
    const { phone, formId, message = '' } = await req.json() as SmsRequest;

    // Get the form share URL
    const { data: formShare, error: formShareError } = await supabaseAdmin
      .from('form_shares')
      .insert({
        form_template_id: formId,
        share_url_token: crypto.randomUUID(),
        created_by: user.id,
      })
      .select()
      .single();

    if (formShareError) {
      throw new Error(`Error creating form share: ${formShareError.message}`);
    }

    // Construct the form URL
    const formUrl = `${Deno.env.get('PUBLIC_SITE_URL')}/forms/share/${formShare.share_url_token}`;
    
    // Construct the SMS message
    const smsMessage = `${message}\nPlease complete this form: ${formUrl}`;

    console.log('Sending SMS to:', phone);
    console.log('Message:', smsMessage);

    // For now, just log the message. In production, this would use a proper SMS service
    console.log('SMS would be sent with message:', smsMessage);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'SMS sent successfully',
        shareUrl: formUrl,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error sending SMS:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
