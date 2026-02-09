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
    const {
      templateType,
      currentContent,
      deliverables,
      priceCents,
      eventDate,
      brandName,
      creatorName,
      productDescription,
      platforms,
      usageRights,
      revisionRounds,
      specialInstructions,
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const usageRightsMap: Record<string, string> = {
      creator_only: "Content remains on creator's channels only",
      brand_repost: "Brand may repost/share with creator credit",
      full_commercial: "Full commercial usage rights granted to brand",
    };

    const systemPrompt = `You are a professional contract drafting assistant for an influencer/creator marketplace. Your job is to generate polished, professional agreements between creators and brands.

Guidelines:
- Use the actual brand and creator names throughout (never generic "Creator" or "Brand")
- Keep the tone professional but friendly
- Ensure all key terms are clearly defined
- Include appropriate disclaimers about FTC compliance for sponsored content
- Make deliverables specific and measurable
- Include timeline expectations
- Clarify payment terms (note: payment happens directly between parties)
- Add standard terms about content ownership and usage rights
- Keep it concise - no more than 600 words
- Use **bold** markdown for section headers
- Make it feel like a real, professional agreement document`;

    const platformsStr = platforms?.length ? platforms.join(', ') : 'Not specified';
    const usageRightsStr = usageRightsMap[usageRights] || usageRights || 'Not specified';

    const userPrompt = `Generate a professional agreement between ${brandName || 'the Brand'} and ${creatorName || 'the Creator'}.

Template Type: ${templateType || 'custom'}
Brand Name: ${brandName || 'Not specified'}
Creator Name: ${creatorName || 'Not specified'}
Product/Service: ${productDescription || 'Not specified'}
Proposed Price: $${(priceCents || 0) / 100}
Event/Delivery Date: ${eventDate || 'Not specified'}
Content Platforms: ${platformsStr}
Usage Rights: ${usageRightsStr}
Revision Rounds: ${revisionRounds || 1}
Special Instructions: ${specialInstructions || 'None'}
Deliverables: ${deliverables?.map((d: any) => `${d.description} (x${d.quantity})`).join(', ') || 'Not specified'}

${currentContent ? `Use this as a starting point but improve and personalize it:\n${currentContent}` : 'Generate the full agreement from scratch based on the details above.'}

Return ONLY the agreement text, no additional commentary.`;

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
        max_tokens: 2000,
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
