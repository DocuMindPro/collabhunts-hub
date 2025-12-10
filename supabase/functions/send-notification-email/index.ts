import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to send email via Resend API
async function sendEmail(to: string, subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "CollabHunts <notifications@collabhunts.com>",
      to: [to],
      subject: subject,
      html: html,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Resend API error: ${errorData}`);
  }

  return response.json();
}

// Email types enum
type EmailType = 
  // Creator emails
  | 'creator_new_booking'
  | 'creator_booking_accepted'
  | 'creator_booking_declined'
  | 'creator_revision_requested'
  | 'creator_delivery_confirmed'
  | 'creator_payment_auto_released'
  | 'creator_dispute_opened'
  | 'creator_dispute_response_needed'
  | 'creator_dispute_resolved'
  | 'creator_application_accepted'
  | 'creator_application_rejected'
  | 'creator_profile_approved'
  | 'creator_profile_rejected'
  // Brand emails
  | 'brand_new_application'
  | 'brand_booking_accepted'
  | 'brand_booking_declined'
  | 'brand_deliverables_submitted'
  | 'brand_review_reminder_48h'
  | 'brand_review_reminder_24h'
  | 'brand_payment_auto_released'
  | 'brand_dispute_opened'
  | 'brand_dispute_response_needed'
  | 'brand_dispute_resolved'
  | 'brand_campaign_approved'
  | 'brand_campaign_rejected'
  // Admin emails
  | 'admin_new_creator_pending'
  | 'admin_new_campaign_pending'
  | 'admin_new_dispute'
  | 'admin_dispute_escalated'
  | 'admin_dispute_resolution_reminder';

interface EmailRequest {
  type: EmailType;
  to_email: string;
  to_name?: string;
  data: Record<string, any>;
}

// Email header template
const getEmailHeader = () => `
  <div style="background: linear-gradient(135deg, #FF7A00 0%, #FFC300 100%); padding: 30px 20px; text-align: center;">
    <h1 style="color: white; margin: 0; font-family: 'Poppins', Arial, sans-serif; font-size: 28px; font-weight: 700;">
      CollabHunts
    </h1>
    <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">
      Where Creators & Brands Connect
    </p>
  </div>
`;

// Email footer template
const getEmailFooter = () => `
  <div style="background: #2F2F2F; padding: 30px 20px; text-align: center;">
    <p style="color: #999; margin: 0 0 10px 0; font-size: 12px;">
      © ${new Date().getFullYear()} CollabHunts. All rights reserved.
    </p>
    <p style="color: #666; margin: 0; font-size: 11px;">
      This email was sent to you because you have an account on CollabHunts.
    </p>
    <div style="margin-top: 15px;">
      <a href="https://collabhunts.com/privacy" style="color: #FF7A00; text-decoration: none; font-size: 11px; margin: 0 10px;">Privacy Policy</a>
      <a href="https://collabhunts.com/terms" style="color: #FF7A00; text-decoration: none; font-size: 11px; margin: 0 10px;">Terms of Service</a>
    </div>
  </div>
`;

// CTA button template
const getCtaButton = (text: string, url: string) => `
  <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #FF7A00 0%, #FFC300 100%); color: white; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0;">
    ${text}
  </a>
`;

// Base email wrapper
const wrapEmail = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Inter', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
    ${getEmailHeader()}
    <div style="padding: 40px 30px;">
      ${content}
    </div>
    ${getEmailFooter()}
  </div>
</body>
</html>
`;

// Get email content based on type
function getEmailContent(type: EmailType, data: Record<string, any>, toName?: string): { subject: string; html: string } {
  const greeting = toName ? `Hi ${toName},` : 'Hi there,';
  const baseUrl = 'https://collabhunts.com';
  
  switch (type) {
    // ============ CREATOR EMAILS ============
    case 'creator_new_booking':
      return {
        subject: `🎉 New Booking Request from ${data.brand_name}!`,
        html: wrapEmail(`
          <h2 style="color: #2F2F2F; margin: 0 0 20px 0; font-family: 'Poppins', Arial, sans-serif;">${greeting}</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Great news! <strong>${data.brand_name}</strong> wants to book your <strong>${data.service_name || 'service'}</strong>.
          </p>
          <div style="background: #FFF8F0; border-left: 4px solid #FF7A00; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0 0 10px 0; color: #2F2F2F;"><strong>💰 Amount:</strong> $${(data.amount_cents / 100).toFixed(2)}</p>
            ${data.message ? `<p style="margin: 0; color: #666;"><strong>📝 Message:</strong> "${data.message}"</p>` : ''}
          </div>
          <p style="color: #666; line-height: 1.6;">
            Review the booking details and respond within 48 hours to maintain your response rate.
          </p>
          <div style="text-align: center;">
            ${getCtaButton('View Booking Request', `${baseUrl}/creator-dashboard?tab=bookings`)}
          </div>
        `)
      };

    case 'creator_booking_accepted':
      return {
        subject: `✅ Booking Confirmed with ${data.brand_name}!`,
        html: wrapEmail(`
          <h2 style="color: #2F2F2F; margin: 0 0 20px 0; font-family: 'Poppins', Arial, sans-serif;">${greeting}</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Your booking with <strong>${data.brand_name}</strong> has been confirmed!
          </p>
          <div style="background: #F0FFF4; border-left: 4px solid #22C55E; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0 0 10px 0; color: #2F2F2F;"><strong>💰 Payment:</strong> $${(data.amount_cents / 100).toFixed(2)} (held in escrow)</p>
            <p style="margin: 0; color: #2F2F2F;"><strong>📅 Deadline:</strong> ${data.delivery_deadline || 'As agreed'}</p>
          </div>
          <p style="color: #666; line-height: 1.6;">
            Start working on the deliverables and submit them before the deadline. Payment will be released once the brand approves your work.
          </p>
          <div style="text-align: center;">
            ${getCtaButton('View Booking Details', `${baseUrl}/creator-dashboard?tab=bookings`)}
          </div>
        `)
      };

    case 'creator_booking_declined':
      return {
        subject: `Booking with ${data.brand_name} was declined`,
        html: wrapEmail(`
          <h2 style="color: #2F2F2F; margin: 0 0 20px 0; font-family: 'Poppins', Arial, sans-serif;">${greeting}</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Unfortunately, the booking request from <strong>${data.brand_name}</strong> was declined.
          </p>
          <p style="color: #666; line-height: 1.6;">
            Don't worry - keep your profile active and more opportunities will come your way!
          </p>
          <div style="text-align: center;">
            ${getCtaButton('Browse Campaigns', `${baseUrl}/creator-dashboard?tab=campaigns`)}
          </div>
        `)
      };

    case 'creator_revision_requested':
      return {
        subject: `↩️ ${data.brand_name} requested revisions`,
        html: wrapEmail(`
          <h2 style="color: #2F2F2F; margin: 0 0 20px 0; font-family: 'Poppins', Arial, sans-serif;">${greeting}</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            <strong>${data.brand_name}</strong> has requested some changes to your deliverables.
          </p>
          ${data.revision_notes ? `
          <div style="background: #FFF8F0; border-left: 4px solid #FF7A00; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #2F2F2F;"><strong>📝 Feedback:</strong></p>
            <p style="margin: 10px 0 0 0; color: #666;">"${data.revision_notes}"</p>
          </div>
          ` : ''}
          <p style="color: #666; line-height: 1.6;">
            Please review the feedback and submit your updated deliverables.
          </p>
          <div style="text-align: center;">
            ${getCtaButton('View & Revise', `${baseUrl}/creator-dashboard?tab=bookings`)}
          </div>
        `)
      };

    case 'creator_delivery_confirmed':
      return {
        subject: `🎉 ${data.brand_name} approved your work!`,
        html: wrapEmail(`
          <h2 style="color: #2F2F2F; margin: 0 0 20px 0; font-family: 'Poppins', Arial, sans-serif;">${greeting}</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Amazing work! <strong>${data.brand_name}</strong> has approved your deliverables.
          </p>
          <div style="background: #F0FFF4; border-left: 4px solid #22C55E; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #2F2F2F; font-size: 18px;"><strong>💰 Payment Released: $${(data.amount_cents / 100).toFixed(2)}</strong></p>
          </div>
          <p style="color: #666; line-height: 1.6;">
            The payment has been released to your account. Great job completing this collaboration!
          </p>
          <div style="text-align: center;">
            ${getCtaButton('View Earnings', `${baseUrl}/creator-dashboard?tab=payouts`)}
          </div>
        `)
      };

    case 'creator_payment_auto_released':
      return {
        subject: `💰 Payment auto-released for ${data.brand_name} booking`,
        html: wrapEmail(`
          <h2 style="color: #2F2F2F; margin: 0 0 20px 0; font-family: 'Poppins', Arial, sans-serif;">${greeting}</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Good news! The payment for your booking with <strong>${data.brand_name}</strong> has been automatically released.
          </p>
          <div style="background: #F0FFF4; border-left: 4px solid #22C55E; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #2F2F2F; font-size: 18px;"><strong>💰 Amount: $${(data.amount_cents / 100).toFixed(2)}</strong></p>
          </div>
          <p style="color: #666; line-height: 1.6;">
            Since the brand didn't review your deliverables within 72 hours, the payment was automatically released to protect your work.
          </p>
          <div style="text-align: center;">
            ${getCtaButton('View Earnings', `${baseUrl}/creator-dashboard?tab=payouts`)}
          </div>
        `)
      };

    case 'creator_dispute_opened':
      return {
        subject: `⚠️ ${data.brand_name} opened a dispute`,
        html: wrapEmail(`
          <h2 style="color: #2F2F2F; margin: 0 0 20px 0; font-family: 'Poppins', Arial, sans-serif;">${greeting}</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            <strong>${data.brand_name}</strong> has opened a dispute for your booking.
          </p>
          <div style="background: #FEF2F2; border-left: 4px solid #EF4444; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0 0 10px 0; color: #2F2F2F;"><strong>⏰ Response Deadline:</strong> 72 hours</p>
            <p style="margin: 0; color: #666;"><strong>Reason:</strong> "${data.reason}"</p>
          </div>
          <p style="color: #666; line-height: 1.6;">
            Please respond to this dispute within 72 hours. Failing to respond may result in a decision in favor of the brand.
          </p>
          <div style="text-align: center;">
            ${getCtaButton('Respond to Dispute', `${baseUrl}/creator-dashboard?tab=bookings`)}
          </div>
        `)
      };

    case 'creator_dispute_response_needed':
      return {
        subject: `⏰ Dispute response needed - ${data.hours_remaining}h remaining`,
        html: wrapEmail(`
          <h2 style="color: #2F2F2F; margin: 0 0 20px 0; font-family: 'Poppins', Arial, sans-serif;">${greeting}</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            You have <strong>${data.hours_remaining} hours</strong> left to respond to the dispute from <strong>${data.brand_name}</strong>.
          </p>
          <div style="background: #FEF2F2; border-left: 4px solid #EF4444; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #2F2F2F;"><strong>⚠️ Failing to respond may result in a decision against you.</strong></p>
          </div>
          <div style="text-align: center;">
            ${getCtaButton('Respond Now', `${baseUrl}/creator-dashboard?tab=bookings`)}
          </div>
        `)
      };

    case 'creator_dispute_resolved':
      return {
        subject: `✅ Dispute resolved - ${data.resolution}`,
        html: wrapEmail(`
          <h2 style="color: #2F2F2F; margin: 0 0 20px 0; font-family: 'Poppins', Arial, sans-serif;">${greeting}</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            The dispute with <strong>${data.brand_name}</strong> has been resolved.
          </p>
          <div style="background: ${data.in_your_favor ? '#F0FFF4' : '#FEF2F2'}; border-left: 4px solid ${data.in_your_favor ? '#22C55E' : '#EF4444'}; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #2F2F2F;"><strong>Resolution:</strong> ${data.resolution}</p>
            ${data.amount_to_creator ? `<p style="margin: 10px 0 0 0; color: #2F2F2F;"><strong>Your Payout:</strong> $${(data.amount_to_creator / 100).toFixed(2)}</p>` : ''}
          </div>
          <div style="text-align: center;">
            ${getCtaButton('View Details', `${baseUrl}/creator-dashboard?tab=bookings`)}
          </div>
        `)
      };

    case 'creator_application_accepted':
      return {
        subject: `🎉 Your application to "${data.campaign_title}" was accepted!`,
        html: wrapEmail(`
          <h2 style="color: #2F2F2F; margin: 0 0 20px 0; font-family: 'Poppins', Arial, sans-serif;">${greeting}</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Great news! <strong>${data.brand_name}</strong> has accepted your application to their campaign.
          </p>
          <div style="background: #F0FFF4; border-left: 4px solid #22C55E; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0 0 10px 0; color: #2F2F2F;"><strong>📢 Campaign:</strong> ${data.campaign_title}</p>
            <p style="margin: 0; color: #2F2F2F;"><strong>💰 Budget:</strong> $${(data.budget_cents / 100).toFixed(2)}</p>
          </div>
          <p style="color: #666; line-height: 1.6;">
            The brand will reach out to discuss next steps. Get ready to collaborate!
          </p>
          <div style="text-align: center;">
            ${getCtaButton('View Campaign', `${baseUrl}/creator-dashboard?tab=campaigns`)}
          </div>
        `)
      };

    case 'creator_application_rejected':
      return {
        subject: `Application update for "${data.campaign_title}"`,
        html: wrapEmail(`
          <h2 style="color: #2F2F2F; margin: 0 0 20px 0; font-family: 'Poppins', Arial, sans-serif;">${greeting}</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Unfortunately, your application to "<strong>${data.campaign_title}</strong>" was not selected this time.
          </p>
          <p style="color: #666; line-height: 1.6;">
            Don't be discouraged! There are many other campaigns looking for creators like you. Keep applying!
          </p>
          <div style="text-align: center;">
            ${getCtaButton('Browse More Campaigns', `${baseUrl}/campaigns`)}
          </div>
        `)
      };

    case 'creator_profile_approved':
      return {
        subject: `🎉 Your CollabHunts profile is now live!`,
        html: wrapEmail(`
          <h2 style="color: #2F2F2F; margin: 0 0 20px 0; font-family: 'Poppins', Arial, sans-serif;">${greeting}</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Congratulations! Your creator profile has been approved and is now visible to brands.
          </p>
          <div style="background: #F0FFF4; border-left: 4px solid #22C55E; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #2F2F2F;"><strong>✅ You can now:</strong></p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #666;">
              <li>Receive booking requests from brands</li>
              <li>Apply to campaigns</li>
              <li>Message with potential collaborators</li>
            </ul>
          </div>
          <div style="text-align: center;">
            ${getCtaButton('Go to Dashboard', `${baseUrl}/creator-dashboard`)}
          </div>
        `)
      };

    case 'creator_profile_rejected':
      return {
        subject: `Your CollabHunts profile needs updates`,
        html: wrapEmail(`
          <h2 style="color: #2F2F2F; margin: 0 0 20px 0; font-family: 'Poppins', Arial, sans-serif;">${greeting}</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Your creator profile wasn't approved yet, but don't worry - you can make some updates and resubmit.
          </p>
          ${data.rejection_reason ? `
          <div style="background: #FEF2F2; border-left: 4px solid #EF4444; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #2F2F2F;"><strong>📝 Feedback:</strong></p>
            <p style="margin: 10px 0 0 0; color: #666;">"${data.rejection_reason}"</p>
          </div>
          ` : ''}
          <p style="color: #666; line-height: 1.6;">
            Please review the feedback and update your profile to meet our guidelines.
          </p>
          <div style="text-align: center;">
            ${getCtaButton('Update Profile', `${baseUrl}/creator-dashboard?tab=profile`)}
          </div>
        `)
      };

    // ============ BRAND EMAILS ============
    case 'brand_new_application':
      return {
        subject: `📥 New application from ${data.creator_name} for "${data.campaign_title}"`,
        html: wrapEmail(`
          <h2 style="color: #2F2F2F; margin: 0 0 20px 0; font-family: 'Poppins', Arial, sans-serif;">${greeting}</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            <strong>${data.creator_name}</strong> has applied to your campaign "<strong>${data.campaign_title}</strong>".
          </p>
          <div style="background: #FFF8F0; border-left: 4px solid #FF7A00; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0 0 10px 0; color: #2F2F2F;"><strong>💰 Proposed Price:</strong> $${(data.proposed_price_cents / 100).toFixed(2)}</p>
            ${data.message ? `<p style="margin: 0; color: #666;"><strong>📝 Message:</strong> "${data.message}"</p>` : ''}
          </div>
          <p style="color: #666; line-height: 1.6;">
            Review their profile and decide if they're a good fit for your campaign.
          </p>
          <div style="text-align: center;">
            ${getCtaButton('Review Application', `${baseUrl}/brand-dashboard?tab=campaigns`)}
          </div>
        `)
      };

    case 'brand_booking_accepted':
      return {
        subject: `✅ ${data.creator_name} accepted your booking!`,
        html: wrapEmail(`
          <h2 style="color: #2F2F2F; margin: 0 0 20px 0; font-family: 'Poppins', Arial, sans-serif;">${greeting}</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Great news! <strong>${data.creator_name}</strong> has accepted your booking request.
          </p>
          <div style="background: #F0FFF4; border-left: 4px solid #22C55E; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0 0 10px 0; color: #2F2F2F;"><strong>💰 Amount:</strong> $${(data.amount_cents / 100).toFixed(2)}</p>
            <p style="margin: 0; color: #2F2F2F;"><strong>📅 Expected Delivery:</strong> ${data.delivery_deadline || 'As agreed'}</p>
          </div>
          <p style="color: #666; line-height: 1.6;">
            The creator will now start working on your deliverables. You'll be notified when they're ready for review.
          </p>
          <div style="text-align: center;">
            ${getCtaButton('View Booking', `${baseUrl}/brand-dashboard?tab=bookings`)}
          </div>
        `)
      };

    case 'brand_booking_declined':
      return {
        subject: `${data.creator_name} declined your booking request`,
        html: wrapEmail(`
          <h2 style="color: #2F2F2F; margin: 0 0 20px 0; font-family: 'Poppins', Arial, sans-serif;">${greeting}</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Unfortunately, <strong>${data.creator_name}</strong> has declined your booking request.
          </p>
          <p style="color: #666; line-height: 1.6;">
            Don't worry - there are many other talented creators on CollabHunts. Browse our marketplace to find your perfect match!
          </p>
          <div style="text-align: center;">
            ${getCtaButton('Find More Creators', `${baseUrl}/influencers`)}
          </div>
        `)
      };

    case 'brand_deliverables_submitted':
      return {
        subject: `📦 ${data.creator_name} submitted deliverables for review!`,
        html: wrapEmail(`
          <h2 style="color: #2F2F2F; margin: 0 0 20px 0; font-family: 'Poppins', Arial, sans-serif;">${greeting}</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            <strong>${data.creator_name}</strong> has submitted their deliverables for your review.
          </p>
          <div style="background: #FFF8F0; border-left: 4px solid #FF7A00; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #2F2F2F;"><strong>⏰ Important:</strong> You have 72 hours to review the deliverables. If you don't respond, the payment will be automatically released to the creator.</p>
          </div>
          <p style="color: #666; line-height: 1.6;">
            Review the work and either approve it or request revisions.
          </p>
          <div style="text-align: center;">
            ${getCtaButton('Review Deliverables', `${baseUrl}/brand-dashboard?tab=bookings`)}
          </div>
        `)
      };

    case 'brand_review_reminder_48h':
      return {
        subject: `⏰ 48 hours left to review ${data.creator_name}'s deliverables`,
        html: wrapEmail(`
          <h2 style="color: #2F2F2F; margin: 0 0 20px 0; font-family: 'Poppins', Arial, sans-serif;">${greeting}</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            You have <strong>48 hours</strong> left to review the deliverables from <strong>${data.creator_name}</strong>.
          </p>
          <div style="background: #FEF9C3; border-left: 4px solid #EAB308; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #2F2F2F;"><strong>⚠️ Reminder:</strong> If you don't review the deliverables within 72 hours of submission, the payment ($${(data.amount_cents / 100).toFixed(2)}) will be automatically released to the creator.</p>
          </div>
          <div style="text-align: center;">
            ${getCtaButton('Review Now', `${baseUrl}/brand-dashboard?tab=bookings`)}
          </div>
        `)
      };

    case 'brand_review_reminder_24h':
      return {
        subject: `🚨 URGENT: 24 hours left to review deliverables!`,
        html: wrapEmail(`
          <h2 style="color: #2F2F2F; margin: 0 0 20px 0; font-family: 'Poppins', Arial, sans-serif;">${greeting}</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            <strong>Final reminder!</strong> You have less than 24 hours to review the deliverables from <strong>${data.creator_name}</strong>.
          </p>
          <div style="background: #FEF2F2; border-left: 4px solid #EF4444; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #2F2F2F;"><strong>🚨 Action Required:</strong> The payment of <strong>$${(data.amount_cents / 100).toFixed(2)}</strong> will be automatically released tomorrow if you don't respond.</p>
          </div>
          <div style="text-align: center;">
            ${getCtaButton('Review Immediately', `${baseUrl}/brand-dashboard?tab=bookings`)}
          </div>
        `)
      };

    case 'brand_payment_auto_released':
      return {
        subject: `💰 Payment auto-released to ${data.creator_name}`,
        html: wrapEmail(`
          <h2 style="color: #2F2F2F; margin: 0 0 20px 0; font-family: 'Poppins', Arial, sans-serif;">${greeting}</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            The payment for your booking with <strong>${data.creator_name}</strong> has been automatically released.
          </p>
          <div style="background: #FFF8F0; border-left: 4px solid #FF7A00; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0 0 10px 0; color: #2F2F2F;"><strong>💰 Amount Released:</strong> $${(data.amount_cents / 100).toFixed(2)}</p>
            <p style="margin: 0; color: #666;">Since the deliverables weren't reviewed within 72 hours, the payment was automatically released to protect the creator.</p>
          </div>
          <p style="color: #666; line-height: 1.6;">
            If you have any concerns about the deliverables, you can still open a dispute within the platform.
          </p>
          <div style="text-align: center;">
            ${getCtaButton('View Booking', `${baseUrl}/brand-dashboard?tab=bookings`)}
          </div>
        `)
      };

    case 'brand_dispute_opened':
      return {
        subject: `⚠️ ${data.creator_name} opened a dispute`,
        html: wrapEmail(`
          <h2 style="color: #2F2F2F; margin: 0 0 20px 0; font-family: 'Poppins', Arial, sans-serif;">${greeting}</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            <strong>${data.creator_name}</strong> has opened a dispute for your booking.
          </p>
          <div style="background: #FEF2F2; border-left: 4px solid #EF4444; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0 0 10px 0; color: #2F2F2F;"><strong>⏰ Response Deadline:</strong> 72 hours</p>
            <p style="margin: 0; color: #666;"><strong>Reason:</strong> "${data.reason}"</p>
          </div>
          <p style="color: #666; line-height: 1.6;">
            Please respond to this dispute within 72 hours. Failing to respond may result in a decision in favor of the creator.
          </p>
          <div style="text-align: center;">
            ${getCtaButton('Respond to Dispute', `${baseUrl}/brand-dashboard?tab=bookings`)}
          </div>
        `)
      };

    case 'brand_dispute_response_needed':
      return {
        subject: `⏰ Dispute response needed - ${data.hours_remaining}h remaining`,
        html: wrapEmail(`
          <h2 style="color: #2F2F2F; margin: 0 0 20px 0; font-family: 'Poppins', Arial, sans-serif;">${greeting}</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            You have <strong>${data.hours_remaining} hours</strong> left to respond to the dispute from <strong>${data.creator_name}</strong>.
          </p>
          <div style="background: #FEF2F2; border-left: 4px solid #EF4444; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #2F2F2F;"><strong>⚠️ Failing to respond may result in a decision against you.</strong></p>
          </div>
          <div style="text-align: center;">
            ${getCtaButton('Respond Now', `${baseUrl}/brand-dashboard?tab=bookings`)}
          </div>
        `)
      };

    case 'brand_dispute_resolved':
      return {
        subject: `✅ Dispute resolved - ${data.resolution}`,
        html: wrapEmail(`
          <h2 style="color: #2F2F2F; margin: 0 0 20px 0; font-family: 'Poppins', Arial, sans-serif;">${greeting}</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            The dispute with <strong>${data.creator_name}</strong> has been resolved.
          </p>
          <div style="background: ${data.in_your_favor ? '#F0FFF4' : '#FEF2F2'}; border-left: 4px solid ${data.in_your_favor ? '#22C55E' : '#EF4444'}; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #2F2F2F;"><strong>Resolution:</strong> ${data.resolution}</p>
            ${data.refund_amount ? `<p style="margin: 10px 0 0 0; color: #2F2F2F;"><strong>Refund:</strong> $${(data.refund_amount / 100).toFixed(2)}</p>` : ''}
          </div>
          <div style="text-align: center;">
            ${getCtaButton('View Details', `${baseUrl}/brand-dashboard?tab=bookings`)}
          </div>
        `)
      };

    case 'brand_campaign_approved':
      return {
        subject: `🎉 Your campaign "${data.campaign_title}" is now live!`,
        html: wrapEmail(`
          <h2 style="color: #2F2F2F; margin: 0 0 20px 0; font-family: 'Poppins', Arial, sans-serif;">${greeting}</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Great news! Your campaign "<strong>${data.campaign_title}</strong>" has been approved and is now visible to creators.
          </p>
          <div style="background: #F0FFF4; border-left: 4px solid #22C55E; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #2F2F2F;"><strong>✅ Your campaign is live!</strong> Creators can now discover and apply to it.</p>
          </div>
          <div style="text-align: center;">
            ${getCtaButton('View Campaign', `${baseUrl}/brand-dashboard?tab=campaigns`)}
          </div>
        `)
      };

    case 'brand_campaign_rejected':
      return {
        subject: `Your campaign "${data.campaign_title}" needs updates`,
        html: wrapEmail(`
          <h2 style="color: #2F2F2F; margin: 0 0 20px 0; font-family: 'Poppins', Arial, sans-serif;">${greeting}</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Your campaign "<strong>${data.campaign_title}</strong>" wasn't approved yet.
          </p>
          ${data.rejection_reason ? `
          <div style="background: #FEF2F2; border-left: 4px solid #EF4444; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #2F2F2F;"><strong>📝 Feedback:</strong></p>
            <p style="margin: 10px 0 0 0; color: #666;">"${data.rejection_reason}"</p>
          </div>
          ` : ''}
          <p style="color: #666; line-height: 1.6;">
            Please review the feedback and update your campaign to meet our guidelines.
          </p>
          <div style="text-align: center;">
            ${getCtaButton('Edit Campaign', `${baseUrl}/brand-dashboard?tab=campaigns`)}
          </div>
        `)
      };

    // ============ ADMIN EMAILS ============
    case 'admin_new_creator_pending':
      return {
        subject: `👤 New creator signup pending review: ${data.creator_name}`,
        html: wrapEmail(`
          <h2 style="color: #2F2F2F; margin: 0 0 20px 0; font-family: 'Poppins', Arial, sans-serif;">New Creator Pending Review</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            A new creator has signed up and is waiting for profile approval.
          </p>
          <div style="background: #FFF8F0; border-left: 4px solid #FF7A00; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0 0 10px 0; color: #2F2F2F;"><strong>👤 Creator:</strong> ${data.creator_name}</p>
            <p style="margin: 0 0 10px 0; color: #2F2F2F;"><strong>📍 Location:</strong> ${data.location || 'Not specified'}</p>
            <p style="margin: 0; color: #2F2F2F;"><strong>🏷️ Categories:</strong> ${data.categories || 'Not specified'}</p>
          </div>
          <div style="text-align: center;">
            ${getCtaButton('Review Creator', `${baseUrl}/admin?tab=creators`)}
          </div>
        `)
      };

    case 'admin_new_campaign_pending':
      return {
        subject: `📢 New campaign pending review: "${data.campaign_title}"`,
        html: wrapEmail(`
          <h2 style="color: #2F2F2F; margin: 0 0 20px 0; font-family: 'Poppins', Arial, sans-serif;">New Campaign Pending Review</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            A new campaign has been submitted and needs approval.
          </p>
          <div style="background: #FFF8F0; border-left: 4px solid #FF7A00; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0 0 10px 0; color: #2F2F2F;"><strong>📢 Campaign:</strong> ${data.campaign_title}</p>
            <p style="margin: 0 0 10px 0; color: #2F2F2F;"><strong>🏢 Brand:</strong> ${data.brand_name}</p>
            <p style="margin: 0; color: #2F2F2F;"><strong>💰 Budget:</strong> $${(data.budget_cents / 100).toFixed(2)}</p>
          </div>
          <div style="text-align: center;">
            ${getCtaButton('Review Campaign', `${baseUrl}/admin?tab=campaigns`)}
          </div>
        `)
      };

    case 'admin_new_dispute':
      return {
        subject: `⚠️ New dispute filed: ${data.opener_name} vs ${data.other_party_name}`,
        html: wrapEmail(`
          <h2 style="color: #2F2F2F; margin: 0 0 20px 0; font-family: 'Poppins', Arial, sans-serif;">New Dispute Filed</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            A new dispute has been opened and may require admin intervention.
          </p>
          <div style="background: #FEF2F2; border-left: 4px solid #EF4444; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0 0 10px 0; color: #2F2F2F;"><strong>⚔️ Parties:</strong> ${data.opener_name} (${data.opened_by_role}) vs ${data.other_party_name}</p>
            <p style="margin: 0 0 10px 0; color: #2F2F2F;"><strong>💰 Amount at Stake:</strong> $${(data.amount_cents / 100).toFixed(2)}</p>
            <p style="margin: 0; color: #666;"><strong>Reason:</strong> "${data.reason}"</p>
          </div>
          <div style="text-align: center;">
            ${getCtaButton('View Dispute', `${baseUrl}/admin?tab=disputes`)}
          </div>
        `)
      };

    case 'admin_dispute_escalated':
      return {
        subject: `🚨 Dispute escalated - Admin review required`,
        html: wrapEmail(`
          <h2 style="color: #2F2F2F; margin: 0 0 20px 0; font-family: 'Poppins', Arial, sans-serif;">Dispute Escalated to Admin</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            A dispute has been escalated and requires immediate admin review.
          </p>
          <div style="background: #FEF2F2; border-left: 4px solid #EF4444; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0 0 10px 0; color: #2F2F2F;"><strong>⚔️ Parties:</strong> ${data.brand_name} vs ${data.creator_name}</p>
            <p style="margin: 0 0 10px 0; color: #2F2F2F;"><strong>💰 Amount:</strong> $${(data.amount_cents / 100).toFixed(2)}</p>
            <p style="margin: 0; color: #2F2F2F;"><strong>⏰ Resolution Deadline:</strong> ${data.resolution_deadline}</p>
          </div>
          <p style="color: #666; line-height: 1.6;">
            Both parties have submitted their responses. Please review and make a decision.
          </p>
          <div style="text-align: center;">
            ${getCtaButton('Review Dispute', `${baseUrl}/admin?tab=disputes`)}
          </div>
        `)
      };

    case 'admin_dispute_resolution_reminder':
      return {
        subject: `⏰ Dispute resolution deadline approaching`,
        html: wrapEmail(`
          <h2 style="color: #2F2F2F; margin: 0 0 20px 0; font-family: 'Poppins', Arial, sans-serif;">Dispute Resolution Reminder</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            A dispute is approaching its resolution deadline and needs your attention.
          </p>
          <div style="background: #FEF9C3; border-left: 4px solid #EAB308; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0 0 10px 0; color: #2F2F2F;"><strong>⚔️ Parties:</strong> ${data.brand_name} vs ${data.creator_name}</p>
            <p style="margin: 0 0 10px 0; color: #2F2F2F;"><strong>💰 Amount:</strong> $${(data.amount_cents / 100).toFixed(2)}</p>
            <p style="margin: 0; color: #2F2F2F;"><strong>⏰ Time Remaining:</strong> ${data.hours_remaining} hours</p>
          </div>
          <div style="text-align: center;">
            ${getCtaButton('Resolve Dispute', `${baseUrl}/admin?tab=disputes`)}
          </div>
        `)
      };

    default:
      console.error(`Unknown email type: ${type}`);
      return {
        subject: 'CollabHunts Notification',
        html: wrapEmail(`
          <h2 style="color: #2F2F2F; margin: 0 0 20px 0; font-family: 'Poppins', Arial, sans-serif;">${greeting}</h2>
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            You have a new notification on CollabHunts.
          </p>
          <div style="text-align: center;">
            ${getCtaButton('View on CollabHunts', baseUrl)}
          </div>
        `)
      };
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, to_email, to_name, data }: EmailRequest = await req.json();

    console.log(`Sending ${type} email to ${to_email}`);

    const { subject, html } = getEmailContent(type, data, to_name);

    const emailResponse = await sendEmail(to_email, subject, html);

    console.log(`Email sent successfully:`, emailResponse);

    return new Response(JSON.stringify({ success: true, id: emailResponse.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
