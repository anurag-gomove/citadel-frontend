
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log("Checking if properties bucket exists")
    
    // List all buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError)
      throw bucketsError
    }
    
    // Check if properties bucket exists
    const bucketExists = buckets?.some(bucket => bucket.name === 'properties')
    
    if (!bucketExists) {
      console.log("Properties bucket doesn't exist, creating it...")
      
      // Create the bucket
      const { error: createError } = await supabase.storage.createBucket('properties', {
        public: true,
        fileSizeLimit: 10485760 // 10MB
      })
      
      if (createError) {
        console.error("Error creating bucket:", createError)
        throw createError
      }
      
      console.log("Properties bucket created successfully")
      
      // Set bucket to public
      const { error: updateError } = await supabase.storage.updateBucket('properties', {
        public: true,
        fileSizeLimit: 10485760 // 10MB
      })
      
      if (updateError) {
        console.error("Error updating bucket:", updateError)
        throw updateError
      }
      
      // Get all objects in the bucket and make them public
      const { data: objects, error: objectsError } = await supabase.storage.from('properties').list()
      
      if (objectsError) {
        console.error("Error listing objects:", objectsError)
      } else if (objects && objects.length > 0) {
        console.log(`Making ${objects.length} objects public`)
        
        for (const object of objects) {
          const { error: updateObjectError } = await supabase.storage.from('properties').update(
            object.name,
            null, // Keep the same data
            {
              cacheControl: 'no-cache',
              upsert: true,
              contentType: 'image/*'
            }
          )
          
          if (updateObjectError) {
            console.error(`Error updating object ${object.name}:`, updateObjectError)
          }
        }
      }
    } else {
      console.log("Properties bucket exists, updating settings...")
      
      // Update bucket settings to ensure it's public
      const { error: updateError } = await supabase.storage.updateBucket('properties', {
        public: true,
        fileSizeLimit: 10485760 // 10MB
      })
      
      if (updateError) {
        console.error("Error updating bucket:", updateError)
        throw updateError
      }
      
      console.log("Properties bucket updated successfully")
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: bucketExists ? "Properties bucket exists and is public" : "Properties bucket created and set to public"
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      }
    )
  } catch (error) {
    console.error("Function error:", error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || String(error)
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    )
  }
})
