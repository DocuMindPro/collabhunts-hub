import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY")!;

interface PlatformUpdateRequest {
  title: string;
  description: string;
  content?: string;
  category: 'feature' | 'improvement' | 'fix' | 'announcement';
  roles: ('creator' | 'brand' | 'all')[];
  test_email?: string; // For testing - send only to this email
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { title, description, content, category, roles, test_email }: PlatformUpdateRequest = await req.json();

    console.log(`Sending platform update: ${title}`);
    console.log(`Target roles: ${roles.join(", ")}`);

    let recipients: { email: string; name: string }[] = [];

    if (test_email) {
      // Test mode - only send to specified email
      console.log(`Test mode: sending only to ${test_email}`);
      recipients = [{ email: test_email, name: "Test User" }];
    } else {
      // Get all users based on roles
      const targetAll = roles.includes('all');
      const targetCreators = targetAll || roles.includes('creator');
      const targetBrands = targetAll || roles.includes('brand');

      // Get creator emails
      if (targetCreators) {
        const { data: creators } = await supabase
          .from("creator_profiles")
          .select("user_id, display_name")
          .eq("status", "approved");
        
        if (creators) {
          for (const creator of creators) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("email")
              .eq("id", creator.user_id)
              .single();
            
            if (profile?.email) {
              recipients.push({ email: profile.email, name: creator.display_name });
            }
          }
        }
      }

      // Get brand emails
      if (targetBrands) {
        const { data: brands } = await supabase
          .from("brand_profiles")
          .select("user_id, company_name");
        
        if (brands) {
          for (const brand of brands) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("email")
              .eq("id", brand.user_id)
              .single();
            
            if (profile?.email) {
              // Avoid duplicates
              if (!recipients.find(r => r.email === profile.email)) {
                recipients.push({ email: profile.email, name: brand.company_name });
              }
            }
          }
        }
      }
    }

    console.log(`Found ${recipients.length} recipients`);

    // Send emails to all recipients
    let successCount = 0;
    let failCount = 0;

    for (const recipient of recipients) {
      try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/send-notification-email`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "platform_update",
            to_email: recipient.email,
            to_name: recipient.name,
            data: {
              title,
              description,
              content,
              category,
            },
          }),
        });

        if (response.ok) {
          successCount++;
          console.log(`Email sent to ${recipient.email}`);
        } else {
          failCount++;
          const error = await response.text();
          console.error(`Failed to send to ${recipient.email}: ${error}`);
        }
      } catch (error) {
        failCount++;
        console.error(`Error sending to ${recipient.email}:`, error);
      }
    }

    console.log(`Platform update sent: ${successCount} success, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        total_recipients: recipients.length,
        sent: successCount,
        failed: failCount,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-platform-update:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
