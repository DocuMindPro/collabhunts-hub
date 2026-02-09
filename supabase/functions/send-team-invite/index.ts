import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the calling user
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) throw new Error("Unauthorized");

    const { email, accountType, profileId } = await req.json();

    if (!email || !accountType || !profileId) {
      throw new Error("Missing required fields: email, accountType, profileId");
    }

    if (!["brand", "creator"].includes(accountType)) {
      throw new Error("Invalid account type");
    }

    // Verify the caller owns this profile
    const table = accountType === "brand" ? "brand_profiles" : "creator_profiles";
    const { data: profile, error: profileError } = await supabase
      .from(table)
      .select("id")
      .eq("id", profileId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      throw new Error("You don't own this profile");
    }

    // Check if invite already exists
    const { data: existing } = await supabase
      .from("account_delegates")
      .select("id, status")
      .eq("delegate_email", email.toLowerCase())
      .eq("profile_id", profileId)
      .in("status", ["pending", "active"])
      .maybeSingle();

    if (existing) {
      throw new Error(
        existing.status === "active"
          ? "This user already has access"
          : "An invite is already pending for this email"
      );
    }

    // Insert the delegate row
    const { error: insertError } = await supabase
      .from("account_delegates")
      .insert({
        owner_user_id: user.id,
        delegate_email: email.toLowerCase(),
        account_type: accountType,
        profile_id: profileId,
        status: "pending",
      });

    if (insertError) throw insertError;

    // Send email via Resend
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      const resend = new Resend(resendKey);
      const platformUrl = Deno.env.get("SITE_URL") || "https://collabhunts-hub.lovable.app";
      
      await resend.emails.send({
        from: "CollabHunts <noreply@collabhunts.com>",
        to: [email],
        subject: `You've been invited to manage a ${accountType} account on CollabHunts`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
            <h2>You've been invited!</h2>
            <p>Someone has invited you to help manage their ${accountType} account on CollabHunts.</p>
            <p>Sign up or log in to accept the invitation and get started:</p>
            <p style="margin: 24px 0;">
              <a href="${platformUrl}/login" style="background: #7c3aed; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
                Go to CollabHunts
              </a>
            </p>
            <p style="color: #666; font-size: 14px;">If you didn't expect this email, you can safely ignore it.</p>
          </div>
        `,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-team-invite:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
