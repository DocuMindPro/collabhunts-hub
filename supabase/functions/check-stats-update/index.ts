import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find creators whose stats haven't been confirmed in 90+ days and aren't flagged yet
    const { data: creators, error: fetchError } = await supabase
      .from("creator_profiles")
      .select("id, user_id")
      .eq("stats_update_required", false)
      .lt("stats_last_confirmed_at", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

    if (fetchError) throw fetchError;

    if (!creators || creators.length === 0) {
      return new Response(JSON.stringify({ message: "No creators need stats update" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const creatorIds = creators.map((c) => c.id);

    // Flag them as requiring update
    const { error: updateError } = await supabase
      .from("creator_profiles")
      .update({ stats_update_required: true })
      .in("id", creatorIds);

    if (updateError) throw updateError;

    // Create notifications for each creator
    const notifications = creators.map((c) => ({
      user_id: c.user_id,
      title: "Stats Update Required",
      message:
        "Your social media stats haven't been updated in 3 months. Please update or confirm your follower counts to keep your account active.",
      type: "stats_update_required",
      link: "/creator-dashboard?tab=profile",
      is_read: false,
    }));

    const { error: notifError } = await supabase
      .from("notifications")
      .insert(notifications);

    if (notifError) {
      console.error("Failed to insert notifications:", notifError);
    }

    return new Response(
      JSON.stringify({ flagged: creatorIds.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in check-stats-update:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
