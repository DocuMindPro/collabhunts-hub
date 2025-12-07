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
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    // Initialize Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check for admin authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify admin role
    const { data: hasAdminRole } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (!hasAdminRole) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Since we can't query cron.job directly from edge functions,
    // we'll return the known cron configuration
    // The cron job was set up with: '0 0 * * *' (daily at midnight UTC)
    const cronConfig = {
      jobName: "scheduled-database-backup",
      schedule: "0 0 * * *",
      scheduleDescription: "Daily at 00:00 UTC",
      isActive: true,
      functionName: "database-backup",
    };

    // Calculate next run time based on schedule (daily at midnight UTC)
    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setUTCHours(0, 0, 0, 0);
    
    // If we've passed midnight today, next run is tomorrow
    if (now >= nextRun) {
      nextRun.setUTCDate(nextRun.getUTCDate() + 1);
    }

    // Calculate last run time (previous midnight)
    const lastRun = new Date(nextRun);
    lastRun.setUTCDate(lastRun.getUTCDate() - 1);

    // Get recent scheduled backups
    const { data: recentBackups, error: backupsError } = await supabase
      .from("backup_history")
      .select("id, status, created_at, execution_time_ms, error_message")
      .eq("backup_type", "scheduled")
      .order("created_at", { ascending: false })
      .limit(5);

    if (backupsError) {
      console.error("Error fetching recent backups:", backupsError);
    }

    console.log("Cron status fetched successfully");

    return new Response(
      JSON.stringify({
        success: true,
        cron: {
          ...cronConfig,
          nextRun: nextRun.toISOString(),
          lastExpectedRun: lastRun.toISOString(),
        },
        recentScheduledBackups: recentBackups || [],
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const error = err as Error;
    console.error("Error fetching cron status:", error);

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
