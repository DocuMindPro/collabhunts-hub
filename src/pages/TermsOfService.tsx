import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  // Scroll to top when component mounts
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
            Last updated: December 10, 2025 | Version 2.0
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
                CollabHunts is a B2B SaaS marketplace platform that connects brands ("Brands" or "Buyers") with social media influencers and content creators 
                ("Creators" or "Sellers") for marketing collaborations. Our services include:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li><strong>Subscription Services:</strong> Monthly subscription plans for Brands (Basic, Pro, Premium) providing access to platform features</li>
                <li><strong>Marketplace Services:</strong> Facilitating connections, bookings, and transactions between Brands and Creators</li>
                <li><strong>Content Library:</strong> Secure storage for UGC and marketing content with usage rights management</li>
                <li><strong>Communication Tools:</strong> Messaging system for collaboration between parties</li>
              </ul>
            </section>

            {/* Section 3 - Marketplace Role */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">3. Marketplace Role & Disclaimer</h2>
              <p className="text-muted-foreground mb-4">
                <strong>CollabHunts acts SOLELY as an intermediary marketplace platform</strong> that connects Brands with Creators. 
                We provide the technology infrastructure and tools to facilitate these connections, but we are NOT a party to any transaction or agreement between Buyers and Sellers.
              </p>
              <p className="text-muted-foreground mb-4">
                <strong>We expressly disclaim any responsibility or liability for:</strong>
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>The quality, safety, legality, or accuracy of any content created or delivered</li>
                <li>The ability of Sellers to deliver services as described</li>
                <li>The ability of Buyers to pay for services</li>
                <li>Any disputes, disagreements, or failed collaborations between users</li>
                <li>Any outcomes, results, or performance metrics of content created</li>
                <li>User conduct, communications, or interactions on or off the Platform</li>
                <li>Accuracy of user-provided information including follower counts, engagement metrics, or audience demographics</li>
              </ul>
              <p className="text-muted-foreground mb-4">
                Users deal directly with each other. CollabHunts facilitates connections but does not guarantee outcomes, quality, or satisfaction.
              </p>
            </section>

            {/* Section 4 - User Accounts */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">4. User Accounts & Verification</h2>
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

            {/* Section 5 - Payment Terms */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">5. Payments, Pricing & Billing</h2>
              
              <h3 className="text-xl font-heading font-semibold mb-3">5.1 Payment Processing</h3>
              <p className="text-muted-foreground mb-4">
                All payments on CollabHunts are processed by our payment partner, <strong>Paddle.com</strong>, who acts as the Merchant of Record. 
                By making a purchase, you agree to Paddle's terms of service and privacy policy. Paddle handles:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Payment processing and collection</li>
                <li>Sales tax, VAT, and other applicable taxes</li>
                <li>Invoicing and receipts</li>
                <li>Refund processing</li>
              </ul>

              <h3 className="text-xl font-heading font-semibold mb-3">5.2 Subscription Plans</h3>
              <p className="text-muted-foreground mb-4">
                Brand subscription plans are billed on a monthly recurring basis. Current pricing is available on our <Link to="/pricing" className="text-primary hover:underline">Pricing page</Link>. 
                Prices are subject to change with 30 days notice.
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li><strong>Basic (Free):</strong> Limited features, 20% marketplace fee</li>
                <li><strong>Pro ($99/month):</strong> Full features, 15% marketplace fee, 10GB Content Library</li>
                <li><strong>Premium ($299/month):</strong> All features, 15% marketplace fee, 50GB Content Library, unlimited campaigns</li>
              </ul>

              <h3 className="text-xl font-heading font-semibold mb-3">5.3 Marketplace Fees</h3>
              <p className="text-muted-foreground mb-4">
                CollabHunts charges marketplace fees on all booking transactions:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Basic tier: 20% platform fee</li>
                <li>Pro tier: 15% platform fee</li>
                <li>Premium tier: 15% platform fee</li>
              </ul>
              <p className="text-muted-foreground mb-4">
                Platform fees are non-refundable once work has been delivered.
              </p>

              <h3 className="text-xl font-heading font-semibold mb-3">5.4 Currency & Taxes</h3>
              <p className="text-muted-foreground mb-4">
                All prices are displayed in USD unless otherwise stated. Applicable taxes (VAT, sales tax, GST) are calculated and collected by Paddle 
                based on your location and will be added at checkout where required by law.
              </p>
            </section>

            {/* Section 6 - Escrow & Auto-Release */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">6. Escrow, Deliverables & 72-Hour Auto-Release</h2>
              <p className="text-muted-foreground mb-4">
                <strong>Payment Escrow:</strong> When a Brand books a Creator's services, payment is collected upfront and held in escrow until the work is delivered and approved. 
                This protects both parties during the transaction.
              </p>
              <p className="text-muted-foreground mb-4">
                <strong>72-Hour Auto-Release Policy:</strong> After a Creator submits deliverables, Brands have <strong>72 hours (3 days)</strong> to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Approve the deliverables (releasing payment to Creator)</li>
                <li>Request revisions (reasonable revision requests only, up to 2 revisions)</li>
                <li>Open a dispute (if there are legitimate concerns)</li>
              </ul>
              <p className="text-muted-foreground mb-4 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                <strong>IF A BRAND TAKES NO ACTION WITHIN 72 HOURS OF DELIVERY, PAYMENT IS AUTOMATICALLY RELEASED TO THE CREATOR.</strong> 
                This constitutes deemed acceptance of the deliverables. Reminder notifications are sent at 48 hours and 24 hours before auto-release.
              </p>
            </section>

            {/* Section 7 - Refunds & Cancellations */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">7. Refunds & Cancellations</h2>
              <p className="text-muted-foreground mb-4">
                Our complete Refund & Cancellation Policy is available at <Link to="/refund" className="text-primary hover:underline">collabhunts.com/refund</Link>. Key points include:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li><strong>14-Day Money-Back Guarantee:</strong> New subscribers can request a full refund within 14 days if no paid features have been used</li>
                <li><strong>Subscription Cancellation:</strong> Cancel anytime; access continues until the end of the billing period</li>
                <li><strong>Booking Refunds:</strong> Subject to dispute resolution process; full refund if Creator cancels or fails to deliver</li>
                <li><strong>Platform Fees:</strong> Non-refundable once work has been delivered</li>
              </ul>
              <p className="text-muted-foreground mb-4">
                All refunds are processed by Paddle within 5-10 business days to the original payment method.
              </p>
            </section>

            {/* Section 8 - Dispute Resolution */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">8. Dispute Resolution</h2>
              <p className="text-muted-foreground mb-4">
                <strong>Platform Dispute Process:</strong> Disputes between Buyers and Sellers regarding bookings are handled through our internal dispute resolution process:
              </p>
              <ol className="list-decimal pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Either party may open a dispute within 72 hours of delivery</li>
                <li>The other party has 3 days to respond</li>
                <li>If unresolved, the dispute escalates to CollabHunts admin review</li>
                <li>Admin decision is issued within 7 days</li>
                <li><strong>Admin decisions are final and binding</strong> with respect to fund distribution</li>
              </ol>
              <p className="text-muted-foreground mb-4">
                <strong>BINDING ARBITRATION:</strong> Any disputes between you and CollabHunts (not between Buyers and Sellers) shall be resolved through binding arbitration 
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
                <li>Deliver services as described in your profile and agreed upon with Brands</li>
                <li>Deliver work within the specified timeframe</li>
                <li>Comply with all applicable advertising disclosure requirements (e.g., FTC guidelines, #ad, #sponsored)</li>
                <li>Not misrepresent your engagement metrics, follower counts, or audience demographics</li>
                <li>Maintain professional communication with Brands at all times</li>
                <li>Fulfill reasonable revision requests (up to 2 per booking)</li>
              </ul>
              <p className="text-muted-foreground mb-4">
                <strong>Misrepresentation of metrics (fake followers, purchased engagement, inflated statistics) will result in immediate account termination and forfeiture of pending payments.</strong>
              </p>
            </section>

            {/* Section 10 - Brand Terms */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">10. Brand Terms</h2>
              <p className="text-muted-foreground mb-4">
                As a Brand on CollabHunts, you agree to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Provide accurate information about your company and campaign requirements</li>
                <li>Review deliverables within 72 hours of submission</li>
                <li>Make reasonable revision requests only (not requests that fundamentally change scope)</li>
                <li>Not request services that violate platform policies or applicable laws</li>
                <li>Respect Creator intellectual property and usage rights as agreed</li>
                <li>Maintain professional communication with Creators at all times</li>
                <li>Understand that inaction for 72 hours constitutes acceptance and triggers auto-release of payment</li>
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
                <strong>Content Rights Transfer:</strong> Upon payment release, Brands receive usage rights to Creator-produced content as specified in the booking agreement. 
                Unless otherwise agreed, standard bookings include perpetual, non-exclusive usage rights for marketing purposes. 
                Creators retain portfolio rights (right to display work in their portfolio).
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
                <li><strong>Circumvent platform fees by conducting transactions outside the Platform</strong></li>
                <li>Create fake accounts or artificially inflate metrics</li>
                <li>Share login credentials or allow unauthorized access to your account</li>
                <li>Scrape, data mine, or extract data from the Platform</li>
                <li>Manipulate reviews, ratings, or search rankings</li>
                <li>Post illegal, harmful, explicit, or offensive content</li>
              </ul>
            </section>

            {/* Section 13 - Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">13. Limitation of Liability</h2>
              <p className="text-muted-foreground mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, COLLABHUNTS AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, 
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Loss of profits, revenue, data, or business opportunities</li>
                <li>Damages arising from user interactions or transactions</li>
                <li>Damages from unauthorized access to your account</li>
                <li>Damages from service interruptions or platform unavailability</li>
                <li>Damages from content posted by users</li>
              </ul>
              <p className="text-muted-foreground mb-4">
                <strong>OUR TOTAL LIABILITY SHALL NOT EXCEED THE GREATER OF: (A) THE FEES YOU HAVE PAID TO US IN THE PAST TWELVE MONTHS, OR (B) ONE HUNDRED DOLLARS ($100).</strong>
              </p>
              <p className="text-muted-foreground mb-4">
                THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO 
                WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
            </section>

            {/* Section 14 - Indemnification */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">14. Indemnification</h2>
              <p className="text-muted-foreground mb-4">
                You agree to indemnify, defend, and hold harmless CollabHunts and its officers, directors, employees, agents, licensors, and suppliers from and against 
                any claims, actions, demands, liabilities, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or related to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Your use of the Platform or services</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights, including intellectual property rights</li>
                <li>Your content or any content you submit, post, or transmit</li>
                <li>Any transaction or interaction with other users</li>
                <li>Your violation of any applicable laws or regulations</li>
              </ul>
            </section>

            {/* Section 15 - Governing Law */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">15. Governing Law & Jurisdiction</h2>
              <p className="text-muted-foreground mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions. 
                Any legal action or proceeding not subject to arbitration shall be brought exclusively in the federal or state courts located in Delaware, 
                and you consent to the personal jurisdiction of such courts.
              </p>
            </section>

            {/* Section 16 - Force Majeure */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">16. Force Majeure</h2>
              <p className="text-muted-foreground mb-4">
                CollabHunts shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including but not limited to: 
                acts of God, natural disasters, war, terrorism, riots, pandemics, government actions, power failures, internet or telecommunications failures, 
                or any other cause beyond our reasonable control.
              </p>
            </section>

            {/* Section 17 - Modifications */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">17. Modifications to Terms & Services</h2>
              <p className="text-muted-foreground mb-4">
                We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or platform notification at least 30 days before changes take effect. 
                Continued use of the Platform after changes constitutes acceptance of the new Terms. If you do not agree with the modified Terms, you must stop using the Platform.
              </p>
              <p className="text-muted-foreground mb-4">
                We also reserve the right to modify, suspend, or discontinue any aspect of the Platform at any time without notice. We shall not be liable to you or any third party 
                for any modification, suspension, or discontinuation of the Platform.
              </p>
            </section>

            {/* Section 18 - Severability */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">18. Severability</h2>
              <p className="text-muted-foreground mb-4">
                If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect. 
                The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable while preserving its original intent.
              </p>
            </section>

            {/* Section 19 - Entire Agreement */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">19. Entire Agreement</h2>
              <p className="text-muted-foreground mb-4">
                These Terms, together with our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>, 
                <Link to="/refund" className="text-primary hover:underline"> Refund & Cancellation Policy</Link>, and any other policies referenced herein, 
                constitute the entire agreement between you and CollabHunts regarding your use of the Platform and supersede all prior or contemporaneous 
                communications, proposals, and agreements, whether oral or written.
              </p>
            </section>

            {/* Section 20 - Contact */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">20. Contact Information</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <p className="text-muted-foreground mb-2">
                  <strong>CollabHunts</strong>
                </p>
                <p className="text-muted-foreground">
                  Email: <a href="mailto:care@collabhunts.com" className="text-primary hover:underline">care@collabhunts.com</a>
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