import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OptimizeRequest {
  bucket: string;
  path: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Verify authentication - require admin role
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized: No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const token = authHeader.replace("Bearer ", "");
    
    // Initialize Supabase client with the user's token
    const supabaseClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") || supabaseServiceKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized: Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`User ${user.id} attempting to optimize image`);
    
    // Initialize service role client to check admin role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify admin role using has_role function
    const { data: isAdmin, error: roleError } = await supabaseAdmin.rpc("has_role", {
      _user_id: user.id,
      _role: "admin"
    });
    
    if (roleError) {
      console.error("Role check error:", roleError.message);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to verify admin role" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!isAdmin) {
      console.error(`User ${user.id} is not an admin`);
      return new Response(
        JSON.stringify({ success: false, error: "Forbidden: Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Admin user ${user.id} authorized for image optimization`);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { bucket, path, maxWidth = 1200, maxHeight = 1200, quality = 80 }: OptimizeRequest = await req.json();

    console.log(`Optimizing image: ${bucket}/${path}`);
    console.log(`Settings: maxWidth=${maxWidth}, maxHeight=${maxHeight}, quality=${quality}`);

    // Download the original image
    const { data: imageData, error: downloadError } = await supabase.storage
      .from(bucket)
      .download(path);

    if (downloadError) {
      console.error("Download error:", downloadError);
      throw new Error(`Failed to download image: ${downloadError.message}`);
    }

    const originalSize = imageData.size;
    console.log(`Original size: ${originalSize} bytes`);

    // For now, we'll return info about the image
    // Full image processing would require additional libraries
    // This provides the foundation for future optimization

    const response = {
      success: true,
      original_size: originalSize,
      bucket,
      path,
      message: "Image analyzed successfully. Full optimization available with image processing library.",
      recommendations: {
        max_recommended_size: 500 * 1024, // 500KB
        current_size: originalSize,
        needs_optimization: originalSize > 500 * 1024,
        suggested_quality: quality,
      },
    };

    console.log("Optimization analysis complete:", response);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in optimize-image function:", errorMessage);
    
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
