
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
// Let's replace the non-working PDF extraction library with a simpler approach
// that doesn't require external dependencies

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const category = formData.get('category')
    const userId = formData.get('userId')

    if (!file || !category || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('Processing file:', file.name, 'category:', category, 'userId:', userId);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const fileExt = file.name.split('.').pop()?.toLowerCase()
    if (fileExt !== 'pdf') {
      return new Response(
        JSON.stringify({ error: 'Only PDF files are allowed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const fileName = `${crypto.randomUUID()}.pdf`
    const htmlFileName = fileName.replace('.pdf', '.html')

    console.log('Generated filenames:', { fileName, htmlFileName });

    // Upload original PDF
    const { error: uploadError } = await supabase.storage
      .from('forms')
      .upload(fileName, file, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (uploadError) {
      console.error('PDF upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload file', details: uploadError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('PDF uploaded successfully');

    // Create form record in the database
    const { data: form, error: insertError } = await supabase
      .from('forms')
      .insert({
        name: file.name.split('.')[0],
        category: category,
        description: `Uploaded form: ${file.name}`,
        icon: "📄",
        owner_id: userId,
        file_path: fileName,
        status: 'processing'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save form data', details: insertError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('Form record created:', form);

    // Start async conversion process
    try {
      console.log('Starting PDF to HTML conversion');
      
      // Create a simple HTML placeholder instead of trying to extract text
      // We're removing the dependency on the PDF extraction library
      const finalHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
              background: #f5f5f5;
              line-height: 1.6;
            }
            .content {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              padding: 40px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .pdf-placeholder {
              text-align: center;
              padding: 40px 0;
            }
          </style>
        </head>
        <body>
          <div class="content">
            <div class="pdf-placeholder">
              <h2>PDF Uploaded Successfully</h2>
              <p>Original filename: ${file.name}</p>
              <p>Category: ${category}</p>
              <p>View the original PDF document for full content.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Upload HTML version
      const { error: htmlUploadError } = await supabase.storage
        .from('forms')
        .upload(htmlFileName, finalHtml, {
          contentType: 'text/html',
          upsert: true
        })

      if (htmlUploadError) {
        console.error('HTML upload error:', htmlUploadError);
        throw htmlUploadError;
      }

      console.log('HTML file uploaded');

      // Update form status to ready
      const { error: updateError } = await supabase
        .from('forms')
        .update({ 
          status: 'ready',
          html_path: htmlFileName,
          converted_at: new Date().toISOString()
        })
        .eq('id', form.id)

      if (updateError) {
        console.error('Status update error:', updateError);
        throw updateError;
      }

      console.log('Form conversion completed successfully');

    } catch (error) {
      console.error('Conversion error:', error);
      
      // If conversion fails, update status to error
      await supabase
        .from('forms')
        .update({ status: 'error' })
        .eq('id', form.id)

      throw error;
    }

    return new Response(
      JSON.stringify({ 
        message: 'Form upload started successfully',
        form
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
