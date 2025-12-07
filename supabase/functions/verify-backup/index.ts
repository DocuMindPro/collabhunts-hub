import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Verify authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const token = authHeader.replace("Bearer ", "");
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify user and admin role
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Check admin role
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get backup ID from request
    const { backup_id } = await req.json();
    
    if (!backup_id) {
      return new Response(
        JSON.stringify({ error: "Missing backup_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Fetch backup record
    const { data: backup, error: backupError } = await supabase
      .from("backup_history")
      .select("*")
      .eq("id", backup_id)
      .single();
    
    if (backupError || !backup) {
      return new Response(
        JSON.stringify({ error: "Backup not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Verification results
    const verification = {
      backup_id: backup.id,
      file_name: backup.file_name,
      status: backup.status,
      created_at: backup.created_at,
      checks: {
        has_s3_url: !!backup.s3_url,
        has_file_name: !!backup.file_name,
        has_file_size: backup.file_size > 0,
        tables_backed_up: backup.tables_backed_up?.length || 0,
        execution_completed: backup.execution_time_ms > 0,
        no_errors: !backup.error_message,
      },
      overall_valid: false,
    };
    
    // Calculate overall validity
    verification.overall_valid = 
      verification.checks.has_s3_url &&
      verification.checks.has_file_name &&
      verification.checks.has_file_size &&
      verification.checks.tables_backed_up > 0 &&
      verification.checks.execution_completed &&
      verification.checks.no_errors;
    
    return new Response(
      JSON.stringify({
        success: true,
        verification,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const error = err as Error;
    console.error("Verification failed:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
