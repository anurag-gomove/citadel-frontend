
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  console.log("get-mapbox-token function invoked");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Get the Mapbox token from environment variables
    const mapboxToken = Deno.env.get("MAPBOX_KEY");
    
    console.log("Retrieved MAPBOX_KEY:", mapboxToken ? "Token exists" : "No token found");

    if (!mapboxToken) {
      console.error("MAPBOX_KEY not set in environment variables");
      return new Response(
        JSON.stringify({ error: "Mapbox token not configured" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // Return the token
    console.log("Returning Mapbox token successfully");
    return new Response(
      JSON.stringify({
        token: mapboxToken,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error getting Mapbox token:", error);

    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
