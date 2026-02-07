import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      candidateName,
      candidateEmail,
      candidatePhone,
      positionTitle,
      coverLetter,
      linkedinUrl,
      portfolioUrl,
      cvFileName,
    } = await req.json();

    const emailResponse = await resend.emails.send({
      from: "CollabHunts Careers <noreply@collabhunts.com>",
      to: ["care@collabhunts.com"],
      subject: `New Job Application: ${positionTitle} — ${candidateName}`,
      html: `
        <h2>New Career Application</h2>
        <table style="border-collapse:collapse;width:100%;max-width:600px;">
          <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Position</td><td style="padding:8px;border-bottom:1px solid #eee;">${positionTitle}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Name</td><td style="padding:8px;border-bottom:1px solid #eee;">${candidateName}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;"><a href="mailto:${candidateEmail}">${candidateEmail}</a></td></tr>
          ${candidatePhone ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Phone</td><td style="padding:8px;border-bottom:1px solid #eee;">${candidatePhone}</td></tr>` : ""}
          ${linkedinUrl ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">LinkedIn</td><td style="padding:8px;border-bottom:1px solid #eee;"><a href="${linkedinUrl}">${linkedinUrl}</a></td></tr>` : ""}
          ${portfolioUrl ? `<tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Portfolio</td><td style="padding:8px;border-bottom:1px solid #eee;"><a href="${portfolioUrl}">${portfolioUrl}</a></td></tr>` : ""}
          <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">CV File</td><td style="padding:8px;border-bottom:1px solid #eee;">${cvFileName}</td></tr>
        </table>
        ${coverLetter ? `<h3 style="margin-top:20px;">Cover Letter</h3><p style="white-space:pre-line;">${coverLetter}</p>` : ""}
        <p style="margin-top:20px;color:#888;font-size:12px;">Review this application in the Admin Dashboard → Careers tab.</p>
      `,
    });

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending career application email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
