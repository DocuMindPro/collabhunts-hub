import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { templateType, currentContent, deliverables, priceCents, eventDate } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a professional contract drafting assistant for an influencer/creator marketplace. Your job is to improve agreement drafts between creators and brands.

Guidelines:
- Keep the tone professional but friendly
- Ensure all key terms are clearly defined
- Include appropriate disclaimers about FTC compliance for sponsored content
- Make deliverables specific and measurable
- Include timeline expectations
- Clarify payment terms (note: payment happens directly between parties)
- Add standard terms about content ownership and usage rights
- Keep it concise - no more than 500 words

Do NOT add any new sections that weren't in the original. Only improve the existing content by making it clearer and more professional.`;

    const userPrompt = `Please improve this creator-brand agreement draft:

Template Type: ${templateType || 'custom'}
Proposed Price: $${(priceCents || 0) / 100}
Event Date: ${eventDate || 'Not specified'}
Deliverables: ${deliverables?.map((d: any) => `${d.description} (x${d.quantity})`).join(', ') || 'Not specified'}

Current Draft:
${currentContent}

Please return ONLY the improved agreement text, no additional commentary.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("Failed to get AI response");
    }

    const data = await response.json();
    const improvedContent = data.choices?.[0]?.message?.content || currentContent;

    return new Response(
      JSON.stringify({ improvedContent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("draft-agreement error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
