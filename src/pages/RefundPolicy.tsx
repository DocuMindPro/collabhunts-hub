import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const RefundPolicy = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Refund & Cancellation Policy
          </h1>
          <p className="text-muted-foreground mb-8">
            Last updated: February 11, 2026 | Version 4.0
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none space-y-10">
            
            {/* Section 1 - Overview */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">1. Overview</h2>
              <p className="text-muted-foreground mb-4">
                CollabHunts ("the Platform") is a discovery and communication platform that connects Brands and Venues with social media 
                Creators for live events and collaborations. <strong>CollabHunts does not process, hold, or manage any payments between 
                Brands and Creators.</strong> All financial transactions — including deposits, payments, and refunds — are conducted 
                directly between the parties outside of our Platform.
              </p>
              <p className="text-muted-foreground mb-4">
                This Refund & Cancellation Policy outlines the terms regarding platform subscription refunds, cancellation expectations, 
                and the limitations of CollabHunts' involvement in disputes between parties.
              </p>
            </section>

            {/* Section 2 - Creator Response Disclaimer */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">2. Creator Response & Availability Disclaimer</h2>
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-5 mb-4">
                <p className="font-semibold text-destructive mb-3">⚠️ IMPORTANT: NO GUARANTEE OF CREATOR RESPONSE OR AVAILABILITY</p>
                <p className="text-sm text-muted-foreground mb-3">
                  CollabHunts is a discovery platform that connects Brands with Creators. We do <strong>not</strong> employ, manage, or control Creators. 
                  Creators are independent users who may or may not respond to inquiries at their sole discretion.
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  While CollabHunts may attempt to facilitate communication between parties, <strong>we cannot compel any Creator to respond</strong>, 
                  and we bear <strong>no responsibility</strong> if a Creator fails to reply to a Brand's message, booking inquiry, or any other communication.
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  If CollabHunts reaches out to a Creator on a Brand's behalf and the Creator does not respond to us, this is <strong>not the fault or 
                  responsibility of CollabHunts</strong>. We have no authority over Creators and cannot guarantee their participation, availability, or responsiveness.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>By using the Platform, you acknowledge and accept that Creator response and availability are entirely outside of CollabHunts' control, 
                  and you agree not to hold CollabHunts liable for any Creator's failure to respond or perform.</strong>
                </p>
              </div>
            </section>

            {/* Section 3 - Direct Payment Terms */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">3. Direct Payment Terms</h2>
              <p className="text-muted-foreground mb-4">
                All financial arrangements — including deposits, full payments, refunds, and cancellation fees — are negotiated and 
                handled <strong>directly between Brands and Creators</strong>. CollabHunts has no involvement in, control over, or 
                responsibility for these transactions.
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>CollabHunts does not collect, process, or hold any funds on behalf of either party</li>
                <li>CollabHunts does not take any commission or percentage from transactions between parties</li>
                <li>Payment disputes between Brands and Creators are the sole responsibility of the involved parties</li>
                <li>We strongly recommend that both parties agree on payment terms, cancellation policies, and refund conditions <strong>before</strong> confirming any collaboration</li>
              </ul>
            </section>

            {/* Section 4 - Platform Service Refunds */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">4. Platform Service Refunds (Subscriptions & Creator Featuring)</h2>
              
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-5 mb-6">
                <p className="font-semibold text-destructive mb-3">⚠️ IMPORTANT: NO REFUND FOR USED SERVICES</p>
                <p className="text-sm text-muted-foreground">
                  Once any paid service has been used, activated, or its benefits accessed in any capacity, <strong>no refund will be issued</strong>. 
                  This applies to all platform services without exception.
                </p>
              </div>

              <h3 className="text-xl font-heading font-semibold mb-3">4.1 General No-Refund Rule</h3>
              <p className="text-muted-foreground mb-4">
                All fees paid to CollabHunts for platform services — including Brand subscription plans (Basic, Pro) and Creator 
                visibility boosts (Featured Badge, Homepage Spotlight, Category Boost, Auto Popup) — are for <strong>digital services 
                rendered upon activation</strong>. Once a paid service has been used, activated, or its benefits have been accessed 
                in any capacity, <strong>no refund will be issued</strong>.
              </p>
              <p className="text-muted-foreground mb-4">
                <strong>"Usage"</strong> includes but is not limited to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                <li>Logging into a paid account after subscription activation</li>
                <li>Sending messages using paid messaging quota</li>
                <li>Posting opportunities using paid tier allowances</li>
                <li>Activating a Creator visibility boost</li>
                <li>Appearing in boosted or priority search results</li>
                <li>Accessing any feature, tool, or capability exclusive to the paid tier</li>
                <li>Using AI-assisted agreement drafting quota</li>
                <li>Adding team members under a paid plan</li>
              </ul>

              <h3 className="text-xl font-heading font-semibold mb-3">4.2 14-Day Review Period</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                <li>Refund requests may be submitted within <strong>14 calendar days</strong> of purchase to <a href="mailto:care@collabhunts.com" className="text-primary hover:underline">care@collabhunts.com</a></li>
                <li>During this 14-day period, CollabHunts will conduct an investigation to determine whether the paid service has been used or activated</li>
                <li>If the investigation confirms <strong>no usage</strong> of the paid service occurred, a refund may be granted at CollabHunts' sole discretion</li>
                <li>If <strong>any usage is detected</strong> during the investigation, the refund request will be <strong>denied</strong></li>
                <li>After 14 days from purchase, <strong>no refund requests will be considered under any circumstances</strong></li>
              </ul>

              <h3 className="text-xl font-heading font-semibold mb-3">4.3 Brand Subscription Refunds</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                <li>Brand subscription fees (Basic and Pro plans) are billed annually</li>
                <li>You may cancel at any time, but <strong>no refund is provided</strong> for the remaining billing period</li>
                <li>Upon cancellation, you retain access to paid features until the end of your current billing period</li>
                <li>If you have used <strong>any</strong> paid features (messaging quota, opportunity posts, team access, AI agreement drafts, etc.), no refund will be issued regardless of when the request is made within the 14-day window</li>
              </ul>

              <h3 className="text-xl font-heading font-semibold mb-3">4.4 Creator Featuring & Visibility Boost Refunds</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                <li>Creator visibility boost purchases (Featured Badge, Homepage Spotlight, Category Boost, Auto Popup) are <strong>non-refundable once activated</strong></li>
                <li>Activation occurs <strong>immediately upon purchase confirmation</strong>. Once your boost is live and your profile has received any boosted visibility, the service is considered <strong>fully rendered</strong></li>
                <li>No partial refunds are available for unused portions of a visibility boost period</li>
              </ul>

              <h3 className="text-xl font-heading font-semibold mb-3">4.5 Refund Processing</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                <li>All refund decisions are made at CollabHunts' <strong>sole and absolute discretion</strong></li>
                <li>Approved refunds are processed within 5-10 business days to the original payment method</li>
                <li>CollabHunts reserves the right to deny any refund request without providing a reason</li>
                <li>Disputing a legitimate charge with your payment provider after using our services may result in <strong>immediate account termination</strong></li>
              </ul>

              <h3 className="text-xl font-heading font-semibold mb-3">4.6 No Double Recovery</h3>
              <div className="bg-muted/50 rounded-lg p-4 border border-border mb-4">
                <p className="text-muted-foreground text-sm">
                  If you initiate a chargeback or payment dispute with your bank or payment provider for a service you have used, 
                  CollabHunts reserves the right to <strong>immediately suspend or terminate your account</strong>, pursue recovery 
                  of the disputed amount, and <strong>ban you from future use of the Platform</strong>. This clause is enforceable 
                  to the maximum extent permitted by applicable law.
                </p>
              </div>
            </section>

            {/* Section 5 - Cancellation Between Parties */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">5. Cancellation Between Parties</h2>
              <p className="text-muted-foreground mb-4">
                Brands and Creators should agree on cancellation terms <strong>before</strong> confirming any collaboration. 
                We strongly recommend using our AI-assisted agreement tool to document:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Cancellation deadlines and notice periods</li>
                <li>Refund or penalty terms if either party cancels</li>
                <li>Force majeure provisions</li>
                <li>No-show policies</li>
              </ul>
              <p className="text-muted-foreground mb-4">
                <strong>CollabHunts is not responsible for cancellation disputes between Brands and Creators.</strong> Any cancellation 
                terms are strictly between the involved parties.
              </p>
            </section>

            {/* Section 6 - Dispute Assistance */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">6. Dispute Assistance</h2>
              <p className="text-muted-foreground mb-4">
                While CollabHunts may, at its sole discretion, offer voluntary mediation assistance for disputes between 
                Brands and Creators:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>CollabHunts is <strong>not obligated</strong> to mediate, resolve, or intervene in any dispute between parties</li>
                <li>Any mediation offered is provided as a <strong>courtesy only</strong> and is non-binding</li>
                <li>CollabHunts' mediation efforts do not constitute legal advice or representation</li>
                <li>Both parties retain the right to pursue their own legal remedies independently</li>
              </ul>
            </section>

            {/* Section 7 - Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">7. Limitation of Liability</h2>
              <p className="text-muted-foreground mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, COLLABHUNTS SHALL NOT BE LIABLE FOR:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Creator non-response, unavailability, or failure to perform</li>
                <li>Payment disputes between Brands and Creators</li>
                <li>Event cancellations, no-shows, or scheduling conflicts</li>
                <li>Quality, safety, or legality of any Creator's services</li>
                <li>Any losses, damages, or expenses arising from direct transactions between parties</li>
                <li>Any failure of a Creator to honor terms agreed upon with a Brand</li>
                <li>Accuracy of Creator profile information, metrics, or portfolio content</li>
              </ul>
              <p className="text-muted-foreground mb-4">
                <strong>OUR TOTAL LIABILITY SHALL NOT EXCEED THE PLATFORM SUBSCRIPTION FEES YOU HAVE PAID TO COLLABHUNTS IN THE 12 MONTHS PRECEDING THE CLAIM.</strong>
              </p>
            </section>

            {/* Section 8 - Force Majeure */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">8. Force Majeure</h2>
              <p className="text-muted-foreground mb-4">
                In cases of events beyond reasonable control (natural disasters, government restrictions, pandemics, etc.):
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Both parties should attempt to reschedule in good faith</li>
                <li>Cancellation and refund terms should follow whatever agreement was made between the parties</li>
                <li>CollabHunts is not responsible for any losses resulting from force majeure events affecting collaborations between parties</li>
              </ul>
            </section>

            {/* Section 9 - Policy Changes */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">9. Policy Changes</h2>
              <p className="text-muted-foreground mb-4">
                We reserve the right to modify this Refund & Cancellation Policy at any time. Changes will be posted on this page 
                with an updated "Last updated" date. Significant changes will be communicated via email to registered users.
              </p>
              <p className="text-muted-foreground mb-4">
                The policy in effect at the time of your subscription purchase or platform use will apply to that transaction.
              </p>
            </section>

            {/* Section 10 - Contact */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">10. Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                If you have questions about this Refund & Cancellation Policy or need assistance, please contact us:
              </p>
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <p className="text-muted-foreground mb-2">
                  <strong>CollabHunts Support</strong>
                </p>
                <p className="text-muted-foreground mb-1">
                  Email: <a href="mailto:care@collabhunts.com" className="text-primary hover:underline">care@collabhunts.com</a>
                </p>
                <p className="text-muted-foreground text-sm mt-3">
                  Response time: Within 2 business days
                </p>
              </div>
            </section>

            {/* Related Policies */}
            <section className="border-t border-border pt-8">
              <h2 className="text-2xl font-heading font-bold mb-4">Related Policies</h2>
              <div className="flex flex-wrap gap-4">
                <Link to="/terms" className="text-primary hover:underline">
                  Terms of Service →
                </Link>
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy →
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RefundPolicy;
