import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, type = 'bio' } = await req.json();
    
    // Different minimum lengths based on content type
    const minLengths: Record<string, number> = {
      bio: 20,
      description: 20,
      campaign_title: 10,
      campaign_description: 20,
      display_name: 5,
      title: 5
    };
    
    const minLength = minLengths[type] || 10;
    
    if (!text || text.length < minLength) {
      return new Response(
        JSON.stringify({ error: `Text must be at least ${minLength} characters` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build system prompt based on content type
    let systemPrompt: string;
    
    switch (type) {
      case 'campaign_title':
        systemPrompt = `You are a marketing expert specializing in influencer campaigns.
Your task is to improve campaign titles to make them catchy, clear, and appealing to creators.

Guidelines:
- Keep each title concise (5-60 characters)
- Make it attention-grabbing and clear
- Highlight what makes this campaign exciting
- Use action words when appropriate
- Don't add emojis unless the original had them
- Return EXACTLY 3 different improved versions

Respond ONLY with a JSON object in this exact format:
{"suggestions": ["improved title 1", "improved title 2", "improved title 3"]}`;
        break;
        
      case 'campaign_description':
        systemPrompt = `You are a marketing expert specializing in influencer campaigns.
Your task is to improve campaign descriptions to be clear, professional, and attractive to creators.

Guidelines:
- Keep the same core information and requirements
- Make it more compelling and easy to understand
- Clearly communicate what creators will do
- Highlight benefits for creators
- Keep each suggestion between 100-500 characters
- Don't add requirements that weren't mentioned
- Return EXACTLY 3 different improved versions

Respond ONLY with a JSON object in this exact format:
{"suggestions": ["improved description 1", "improved description 2", "improved description 3"]}`;
        break;
        
      case 'display_name':
      case 'title':
        systemPrompt = `You are a branding expert helping creators choose memorable display names.
Your task is to improve the creator's display name to be more memorable and professional.

Guidelines:
- Keep it short and punchy (2-30 characters)
- Make it memorable and unique
- Keep the same general identity/style
- Don't add special characters unless original had them
- Return EXACTLY 3 different improved versions

Respond ONLY with a JSON object in this exact format:
{"suggestions": ["improved name 1", "improved name 2", "improved name 3"]}`;
        break;
        
      case 'bio':
      default:
        systemPrompt = `You are a professional copywriter specializing in creator and influencer profiles. 
Your task is to improve the user's bio/description to make it more professional, engaging, and attractive to brands.

Guidelines:
- Keep the same meaning and key information
- Make it more compelling and professional
- Highlight unique selling points
- Use engaging language that appeals to brands
- Keep each suggestion between 100-300 characters
- Don't add information that wasn't mentioned
- Return EXACTLY 3 different improved versions

Respond ONLY with a JSON object in this exact format:
{"suggestions": ["improved version 1", "improved version 2", "improved version 3"]}`;
        break;
    }

    console.log('Calling Lovable AI with text:', text.substring(0, 50) + '...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Please improve this ${type}: "${text}"` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to generate suggestions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log('AI response content:', content);

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'No response from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON response
    let suggestions: string[];
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        suggestions = parsed.suggestions;
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback: split by newlines if JSON parsing fails
      suggestions = content.split('\n').filter((s: string) => s.trim().length > 20).slice(0, 3);
    }

    if (!suggestions || suggestions.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Could not generate suggestions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generated suggestions:', suggestions.length);

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in improve-bio function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
