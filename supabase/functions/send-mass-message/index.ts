import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DAILY_LIMIT_PRO = 50;
const DAILY_LIMIT_PREMIUM = 100;
const WEEKLY_LIMIT_PRO = 150;
const WEEKLY_LIMIT_PREMIUM = 300;
const MAX_BATCH_SIZE = 25;
const COOLDOWN_DAYS = 7;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { creatorProfileIds, campaignId, customMessage, message, templateId, templateName } = await req.json();

    // Get brand profile
    const { data: brandProfile, error: brandError } = await supabase
      .from('brand_profiles')
      .select('id, company_name')
      .eq('user_id', user.id)
      .single();

    if (brandError || !brandProfile) {
      return new Response(JSON.stringify({ error: 'Brand profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check subscription tier
    const { data: subscription } = await supabase
      .from('brand_subscriptions')
      .select('plan_type, status')
      .eq('brand_profile_id', brandProfile.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const planType = subscription?.plan_type || 'none';
    
    if (planType === 'none' || planType === 'basic') {
      return new Response(JSON.stringify({ 
        error: 'Mass campaign invitations require Pro or Premium subscription' 
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const dailyLimit = planType === 'premium' ? DAILY_LIMIT_PREMIUM : DAILY_LIMIT_PRO;
    const weeklyLimit = planType === 'premium' ? WEEKLY_LIMIT_PREMIUM : WEEKLY_LIMIT_PRO;

    // Validate batch size
    if (creatorProfileIds.length > MAX_BATCH_SIZE) {
      return new Response(JSON.stringify({ 
        error: `Maximum ${MAX_BATCH_SIZE} creators per batch` 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check daily limit
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const { data: todayLogs } = await supabase
      .from('mass_messages_log')
      .select('message_count')
      .eq('brand_profile_id', brandProfile.id)
      .gte('sent_at', todayStart.toISOString());

    const todayCount = todayLogs?.reduce((sum, log) => sum + log.message_count, 0) || 0;
    
    if (todayCount + creatorProfileIds.length > dailyLimit) {
      return new Response(JSON.stringify({ 
        error: `Daily limit of ${dailyLimit} invitations reached. Sent today: ${todayCount}`,
        remaining: dailyLimit - todayCount
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check weekly limit
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    
    const { data: weekLogs } = await supabase
      .from('mass_messages_log')
      .select('message_count')
      .eq('brand_profile_id', brandProfile.id)
      .gte('sent_at', weekStart.toISOString());

    const weekCount = weekLogs?.reduce((sum, log) => sum + log.message_count, 0) || 0;
    
    if (weekCount + creatorProfileIds.length > weeklyLimit) {
      return new Response(JSON.stringify({ 
        error: `Weekly limit of ${weeklyLimit} invitations reached. Sent this week: ${weekCount}`,
        remaining: weeklyLimit - weekCount
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch campaign details if campaignId provided
    let campaign = null;
    if (campaignId) {
      const { data: campaignData } = await supabase
        .from('campaigns')
        .select('id, title, description, budget_cents, deadline, spots_available, spots_filled')
        .eq('id', campaignId)
        .eq('brand_profile_id', brandProfile.id)
        .single();
      
      campaign = campaignData;
      
      if (!campaign) {
        return new Response(JSON.stringify({ error: 'Campaign not found or does not belong to your brand' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Filter out creators who opted out or were messaged in cooldown period
    const cooldownDate = new Date();
    cooldownDate.setDate(cooldownDate.getDate() - COOLDOWN_DAYS);

    const { data: recentMessages } = await supabase
      .from('mass_messages_log')
      .select('creator_profile_ids')
      .eq('brand_profile_id', brandProfile.id)
      .gte('sent_at', cooldownDate.toISOString());

    const recentlyMessaged = new Set<string>();
    recentMessages?.forEach(log => {
      log.creator_profile_ids.forEach((id: string) => recentlyMessaged.add(id));
    });

    // Get eligible creators (opted in and not in cooldown)
    const { data: eligibleCreators } = await supabase
      .from('creator_profiles')
      .select('id, user_id, display_name')
      .in('id', creatorProfileIds)
      .eq('allow_mass_messages', true);

    const filteredCreators = eligibleCreators?.filter(
      c => !recentlyMessaged.has(c.id)
    ) || [];

    if (filteredCreators.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'No eligible creators. They may have opted out or were messaged recently.',
        filtered: creatorProfileIds.length,
        eligible: 0
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Save template if new
    let savedTemplateId = templateId;
    if (!templateId && templateName && (customMessage || message)) {
      const { data: newTemplate } = await supabase
        .from('mass_message_templates')
        .insert({
          brand_profile_id: brandProfile.id,
          name: templateName,
          content: customMessage || message,
        })
        .select('id')
        .single();
      savedTemplateId = newTemplate?.id;
    }

    // Build the message content
    let messageContent: string;
    if (campaign) {
      // Campaign invitation message
      const budgetStr = `$${(campaign.budget_cents / 100).toFixed(0)}`;
      const spotsLeft = campaign.spots_available - campaign.spots_filled;
      const deadlineDate = new Date(campaign.deadline).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
      
      messageContent = `🎯 **${brandProfile.company_name}** has invited you to apply for their campaign!\n\n`;
      messageContent += `**${campaign.title}**\n`;
      messageContent += `💰 Budget: ${budgetStr}\n`;
      messageContent += `👥 ${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} remaining\n`;
      messageContent += `📅 Deadline: ${deadlineDate}\n`;
      
      if (customMessage) {
        messageContent += `\n💬 Personal note from ${brandProfile.company_name}:\n"${customMessage}"`;
      }
      
      messageContent += `\n\n👉 Check your Campaigns tab to apply!`;
    } else {
      // Legacy support for plain messages
      messageContent = message || customMessage || '';
    }

    // Create conversations and send messages
    const sentCreatorIds: string[] = [];
    const errors: string[] = [];

    for (const creator of filteredCreators) {
      try {
        // Check if conversation exists
        let { data: conversation } = await supabase
          .from('conversations')
          .select('id')
          .eq('brand_profile_id', brandProfile.id)
          .eq('creator_profile_id', creator.id)
          .single();

        // Create conversation if doesn't exist
        if (!conversation) {
          const { data: newConv, error: convError } = await supabase
            .from('conversations')
            .insert({
              brand_profile_id: brandProfile.id,
              creator_profile_id: creator.id,
            })
            .select('id')
            .single();
          
          if (convError) {
            errors.push(`Failed to create conversation for ${creator.display_name}`);
            continue;
          }
          conversation = newConv;
        }

        // Send message
        const { error: msgError } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversation.id,
            sender_id: user.id,
            content: messageContent,
          });

        if (msgError) {
          errors.push(`Failed to send invitation to ${creator.display_name}`);
          continue;
        }

        sentCreatorIds.push(creator.id);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        errors.push(`Error with ${creator.display_name}: ${errorMessage}`);
      }
    }

    // Log the mass message/campaign invitation
    if (sentCreatorIds.length > 0) {
      await supabase
        .from('mass_messages_log')
        .insert({
          brand_profile_id: brandProfile.id,
          template_id: savedTemplateId,
          campaign_id: campaign?.id || null,
          creator_profile_ids: sentCreatorIds,
          message_count: sentCreatorIds.length,
        });
    }

    console.log(`Campaign invitation sent: ${sentCreatorIds.length}/${creatorProfileIds.length} creators${campaign ? ` for campaign "${campaign.title}"` : ''}`);

    return new Response(JSON.stringify({
      success: true,
      sent: sentCreatorIds.length,
      total: creatorProfileIds.length,
      filtered: creatorProfileIds.length - filteredCreators.length,
      errors: errors.length > 0 ? errors : undefined,
      remainingToday: dailyLimit - todayCount - sentCreatorIds.length,
      remainingWeek: weeklyLimit - weekCount - sentCreatorIds.length,
      campaignTitle: campaign?.title,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-mass-message:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});