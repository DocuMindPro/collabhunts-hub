import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Terms of Service
          </h1>
          <p className="text-muted-foreground mb-8">
            Last updated: February 11, 2026 | Version 4.0
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none space-y-10">
            
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground mb-4">
                By accessing or using CollabHunts ("the Platform", "we", "us", or "our"), you agree to be bound by these Terms of Service ("Terms"), 
                our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>, our <Link to="/refund" className="text-primary hover:underline">Refund & Cancellation Policy</Link>, 
                and all applicable laws and regulations. If you do not agree with any of these terms, you are 
                prohibited from using or accessing this site. These Terms constitute a legally binding agreement between you and CollabHunts.
              </p>
              <p className="text-muted-foreground mb-4">
                <strong>BY CREATING AN ACCOUNT, MAKING A BOOKING, OR USING OUR SERVICES, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS.</strong>
              </p>
            </section>

            {/* Section 2 - Service Description */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">2. Service Description</h2>
              <p className="text-muted-foreground mb-4">
                CollabHunts is a discovery and communication platform that connects venues and brands ("Brands" or "Buyers") with social media influencers and content creators 
                ("Creators" or "Sellers") for live events and fan experiences. Our services include:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li><strong>Event Booking Facilitation:</strong> Helping Brands discover and connect with Creators for meet & greets, workshops, and live appearances</li>
                <li><strong>Discovery Services:</strong> Helping Brands find and connect with Creators through our marketplace</li>
                <li><strong>Agreement Tools:</strong> AI-assisted agreement drafting for record-keeping between parties</li>
                <li><strong>Communication Tools:</strong> Messaging system for collaboration between parties</li>
              </ul>
              <p className="text-muted-foreground mb-4">
                <strong>CollabHunts is a facilitator only.</strong> We do not process, hold, or manage any payments between Brands and Creators. 
                All financial transactions are conducted directly between the parties outside of the Platform.
              </p>
            </section>

            {/* Section 3 - Business Model */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">3. Platform Model</h2>
              <p className="text-muted-foreground mb-4">
                CollabHunts operates as a <strong>zero-commission marketplace</strong>. We do not take any fees from bookings between Brands and Creators. 
                All financial arrangements are made directly between the parties.
              </p>
              <p className="text-muted-foreground mb-4">
                <strong>How it works:</strong>
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Brands browse and select Creators on our platform</li>
                <li>Brands and Creators communicate and negotiate directly via our messaging tools</li>
                <li>AI-assisted agreements help document collaboration terms for record-keeping</li>
                <li>Payment is handled directly between the parties, outside the platform</li>
              </ul>
              <p className="text-muted-foreground mb-4">
                <strong>Free Features:</strong> Account creation, browsing creators, viewing pricing, messaging, and advanced search filters are all free for Brands on the Free plan.
              </p>
            </section>

            {/* Section 4 - Direct Payments */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">4. Direct Payments Between Parties</h2>
              <p className="text-muted-foreground mb-4">
                CollabHunts does <strong>not</strong> process, hold, or manage any payments between Brands and Creators. All financial transactions are handled directly between the parties involved:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li><strong>Payment Terms:</strong> Brands and Creators negotiate and agree on payment terms directly</li>
                <li><strong>Payment Method:</strong> Parties choose their preferred payment method outside the platform</li>
                <li><strong>Platform Role:</strong> CollabHunts facilitates discovery, communication, and AI-assisted agreements for record-keeping only</li>
              </ul>
              <p className="text-muted-foreground mb-4">
                CollabHunts is not responsible for any payment disputes between Brands and Creators.
              </p>
            </section>

            {/* Section 5 - User Accounts */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">5. User Accounts & Verification</h2>
              <p className="text-muted-foreground mb-4">
                To access certain features of the Platform, you must register for an account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Be at least 18 years of age</li>
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Complete phone verification as required</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Provide accurate social media metrics and audience information (for Creators)</li>
              </ul>
              <p className="text-muted-foreground mb-4">
                <strong>Account Termination:</strong> We reserve the right to terminate or suspend accounts immediately, without prior notice, for any violation of these Terms, 
                including but not limited to: providing false information, creating fake accounts, artificially inflating metrics, or engaging in fraudulent activity.
              </p>
            </section>

            {/* Section 6 - Booking Process */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">6. Booking Process</h2>
              <p className="text-muted-foreground mb-4">
                Collaborations facilitated through CollabHunts follow this general process:
              </p>
              <ol className="list-decimal pl-6 text-muted-foreground space-y-2 mb-4">
                <li><strong>Discovery:</strong> Brands browse and find Creators using our search and filter tools</li>
                <li><strong>Inquiry:</strong> Brands send inquiries to Creators with event details, preferred dates, and proposed budget</li>
                <li><strong>Negotiation:</strong> Creators and Brands negotiate terms through our structured messaging system (accept, counter-offer, or decline)</li>
                <li><strong>Agreement:</strong> Once terms are agreed, an AI-assisted agreement is generated for both parties' records</li>
                <li><strong>Direct Payment:</strong> Brands and Creators arrange payment directly between themselves, outside of CollabHunts</li>
                <li><strong>Event:</strong> Creator performs at the event as agreed</li>
              </ol>
              <p className="text-muted-foreground mb-4">
                <strong>CollabHunts does not guarantee that any step of this process will be completed.</strong> Creators may not respond to inquiries, 
                may decline bookings, or may become unavailable. See Section 9 and Section 14 for important disclaimers.
              </p>
            </section>

            {/* Section 7 - Cancellations */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">7. Cancellations & Disputes</h2>
              <p className="text-muted-foreground mb-4">
                Since all payments are handled directly between Brands and Creators, cancellation and refund terms should be agreed upon by both parties prior to the event. CollabHunts is not responsible for financial disputes.
              </p>
              <p className="text-muted-foreground mb-4">
                We encourage both parties to use our AI-assisted agreement tool to document cancellation terms before confirming any booking.
              </p>
            </section>

            {/* Section 8 - Dispute Resolution */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">8. Dispute Resolution</h2>
              <p className="text-muted-foreground mb-4">
                <strong>Voluntary Mediation:</strong> CollabHunts may, at its sole discretion, offer voluntary mediation assistance for disputes 
                between Brands and Creators. Any such mediation is provided as a courtesy and is non-binding. CollabHunts is not obligated to 
                mediate, resolve, or intervene in any dispute between parties.
              </p>
              <p className="text-muted-foreground mb-4">
                <strong>BINDING ARBITRATION:</strong> Any disputes between you and CollabHunts shall be resolved through binding arbitration 
                in accordance with the American Arbitration Association rules. You agree to waive any right to a jury trial.
              </p>
              <p className="text-muted-foreground mb-4 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                <strong>CLASS ACTION WAIVER:</strong> YOU AGREE THAT ANY CLAIMS AGAINST COLLABHUNTS WILL BE BROUGHT ON AN INDIVIDUAL BASIS ONLY, AND NOT AS A CLASS, CONSOLIDATED, 
                OR REPRESENTATIVE ACTION. YOU WAIVE ANY RIGHT TO PARTICIPATE IN A CLASS ACTION OR CLASS-WIDE ARBITRATION.
              </p>
            </section>

            {/* Section 9 - Creator Terms */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">9. Creator Terms</h2>
              <p className="text-muted-foreground mb-4">
                As a Creator on CollabHunts, you agree to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Provide accurate information about your social media presence, follower counts, and audience demographics</li>
                <li>Maintain professional conduct during all events</li>
                <li>Accept the platform's terms regarding pricing visibility and subscription plans</li>
              </ul>
              <p className="text-muted-foreground mb-4">
                <strong>Misrepresentation of metrics (fake followers, purchased engagement, inflated statistics) will result in immediate account termination.</strong>
              </p>

              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800 mt-4">
                <p className="text-sm font-semibold mb-2">⚠️ IMPORTANT: NO GUARANTEE OF CREATOR RESPONSE OR AVAILABILITY</p>
                <p className="text-sm text-muted-foreground">
                  Creators are independent users of the Platform. CollabHunts does <strong>not</strong> employ, manage, or control Creators. 
                  Creators may or may not respond to inquiries, accept bookings, or be available at their sole discretion. 
                  Response times vary and are entirely outside CollabHunts' control. While CollabHunts may attempt to facilitate communication, 
                  we cannot compel any Creator to respond, and we bear <strong>no responsibility</strong> if a Creator fails to reply to a Brand's 
                  message, booking inquiry, or any other communication. By using the Platform, you acknowledge and accept this limitation.
                </p>
              </div>
            </section>

            {/* Section 10 - Brand Terms */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">10. Brand & Venue Terms</h2>
              <p className="text-muted-foreground mb-4">
                As a Brand or Venue on CollabHunts, you agree to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Provide accurate information about your venue and event requirements</li>
                <li>Arrange payment directly with Creators as agreed between the parties</li>
                <li>Provide safe and appropriate event conditions for Creators</li>
                <li>Not request services that violate platform policies or applicable laws</li>
                <li>Maintain professional communication with Creators at all times</li>
                <li>Acknowledge that Creator response and availability are not guaranteed by CollabHunts</li>
              </ul>
            </section>

            {/* Section 11 - Content & IP */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">11. Content & Intellectual Property</h2>
              <p className="text-muted-foreground mb-4">
                <strong>Platform IP:</strong> The Platform and its original content, features, and functionality are owned by CollabHunts 
                and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
              <p className="text-muted-foreground mb-4">
                <strong>User Content:</strong> Users retain ownership of content they create. By using the Platform, you grant CollabHunts 
                a non-exclusive, worldwide, royalty-free license to use, display, and distribute such content as necessary to operate the Platform 
                (e.g., displaying portfolio items, thumbnails in search results).
              </p>
              <p className="text-muted-foreground mb-4">
                <strong>Event Content:</strong> Unless otherwise agreed, any content created during events (photos, videos) may be used by both Brand and Creator for promotional purposes.
              </p>
              <p className="text-muted-foreground mb-4">
                <strong>DMCA Compliance:</strong> We respect intellectual property rights and will respond to valid DMCA takedown notices. 
                Repeated copyright infringement will result in account termination.
              </p>
            </section>

            {/* Section 12 - Prohibited Activities */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">12. Prohibited Activities</h2>
              <p className="text-muted-foreground mb-4">
                You may not use the Platform to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon intellectual property rights of others</li>
                <li>Transmit harmful code, viruses, or malware</li>
                <li>Engage in fraudulent activities or misrepresentation</li>
                <li>Harass, abuse, threaten, or harm other users</li>
                <li>Create fake accounts or artificially inflate metrics</li>
                <li>Share login credentials or allow unauthorized access to your account</li>
                <li>Scrape, data mine, or extract data from the Platform</li>
                <li>Manipulate reviews, ratings, or search rankings</li>
              </ul>

              <h3 className="text-xl font-heading font-semibold mt-6 mb-3">12.1 Automated Scraping & AI Prohibition</h3>
              <p className="text-muted-foreground mb-4">
                Without limiting the generality of the above, you expressly agree that you will not:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Use any automated system, bot, spider, scraper, or other programmatic method to access, crawl, index, or extract data from the Platform, including but not limited to user profiles, portfolio content, pricing information, or platform layouts</li>
                <li>Use any content, data, or materials obtained from the Platform — whether directly or indirectly — to train, fine-tune, or otherwise develop any artificial intelligence model, machine learning system, large language model (LLM), or similar technology</li>
                <li>Reproduce, replicate, or reverse-engineer the Platform's features, functionality, user interface, user experience, or business logic using AI-assisted tools or any other means</li>
                <li>Feed any Platform URL, screenshot, or content into any AI tool, chatbot, or generative system for the purpose of recreating, cloning, or deriving a competing product or service</li>
                <li>Circumvent or attempt to bypass any technical measures implemented by the Platform to prevent automated access, including but not limited to robots.txt directives, rate limiting, or anti-scraping protections</li>
              </ul>

              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-destructive mb-1">⚠️ Legal Notice</p>
                <p className="text-sm text-muted-foreground">
                  Violations of this section may result in immediate and permanent account termination, pursuit of injunctive relief, and claims for damages including statutory damages under applicable computer fraud, copyright, and data protection laws. CollabHunts reserves the right to pursue all available legal remedies.
                </p>
              </div>
            </section>

            {/* Section 13 - Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">13. Limitation of Liability</h2>
              <p className="text-muted-foreground mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, COLLABHUNTS AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, 
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Loss of profits, revenue, or business opportunities</li>
                <li>Event cancellations or no-shows</li>
                <li>Quality of Creator performance at events</li>
                <li>Creator non-response or unavailability</li>
                <li>Disputes between Brands and Creators</li>
                <li>Payment disputes arising from direct transactions between parties</li>
                <li>Any unauthorized access to or use of our servers</li>
              </ul>
              <p className="text-muted-foreground mb-4">
                <strong>OUR TOTAL LIABILITY SHALL NOT EXCEED THE PLATFORM FEES YOU HAVE PAID TO US IN THE 12 MONTHS PRECEDING THE CLAIM.</strong>
              </p>
            </section>

            {/* Section 14 - No Warranty / As-Is Disclaimer */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">14. No Warranty / As-Is Disclaimer</h2>
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-4">
                <p className="text-sm text-muted-foreground">
                  THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE. 
                  COLLABHUNTS SPECIFICALLY DISCLAIMS ALL IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
                </p>
              </div>
              <p className="text-muted-foreground mb-4">
                Without limiting the foregoing, CollabHunts does not warrant or guarantee:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>That any Creator will respond to messages, inquiries, or booking requests</li>
                <li>That any Creator will be available for events</li>
                <li>The quality, safety, or legality of any Creator's services</li>
                <li>The accuracy of any Creator's profile information, metrics, or portfolio</li>
                <li>That the Platform will be uninterrupted, error-free, or secure</li>
                <li>That any collaboration arranged through the Platform will be satisfactory</li>
              </ul>
              <p className="text-muted-foreground mb-4">
                <strong>YOU USE THE PLATFORM AT YOUR OWN RISK. ALL ARRANGEMENTS MADE THROUGH THE PLATFORM ARE BETWEEN THE RESPECTIVE PARTIES AND NOT WITH COLLABHUNTS.</strong>
              </p>
            </section>

            {/* Section 15 - No Agency Relationship */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">15. No Agency Relationship</h2>
              <p className="text-muted-foreground mb-4">
                CollabHunts is <strong>not</strong> an agent, employer, joint venturer, partner, or representative of any Creator, Brand, or Venue. 
                We are a technology platform that facilitates discovery and communication only.
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Creators are independent users, not employees or contractors of CollabHunts</li>
                <li>CollabHunts does not direct, control, or supervise any Creator's work or conduct</li>
                <li>CollabHunts does not set pricing, schedules, or terms between parties</li>
                <li>No agency, employment, franchise, or partnership relationship is created by use of the Platform</li>
              </ul>
            </section>

            {/* Section 16 - Indemnification */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">16. Indemnification</h2>
              <p className="text-muted-foreground mb-4">
                You agree to indemnify, defend, and hold harmless CollabHunts and its officers, directors, employees, agents, and affiliates from any claims, 
                liabilities, damages, losses, and expenses arising from:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Your use of the Platform</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights</li>
                <li>Any content you submit to the Platform</li>
                <li>Your conduct during events booked through the Platform</li>
                <li>Any disputes arising from direct transactions between you and another user</li>
              </ul>
            </section>

            {/* Section 17 - Changes to Terms */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">17. Changes to Terms</h2>
              <p className="text-muted-foreground mb-4">
                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting to the Platform. 
                Material changes will be communicated via email to registered users. Your continued use of the Platform after changes 
                constitutes acceptance of the modified Terms.
              </p>
            </section>

            {/* Section 18 - Contact */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">18. Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                If you have questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <p className="text-muted-foreground mb-2">
                  <strong>CollabHunts Legal</strong>
                </p>
                <p className="text-muted-foreground mb-1">
                  Email: <a href="mailto:care@collabhunts.com" className="text-primary hover:underline">care@collabhunts.com</a>
                </p>
                <p className="text-muted-foreground text-sm mt-3">
                  Response time: Within 5 business days for legal inquiries
                </p>
              </div>
            </section>

            {/* Related Policies */}
            <section className="border-t border-border pt-8">
              <h2 className="text-2xl font-heading font-bold mb-4">Related Policies</h2>
              <div className="flex flex-wrap gap-4">
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy →
                </Link>
                <Link to="/refund" className="text-primary hover:underline">
                  Refund & Cancellation Policy →
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

export default TermsOfService;
