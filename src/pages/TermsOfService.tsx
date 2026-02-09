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
            Last updated: February 3, 2026 | Version 3.0
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
                CollabHunts is a transactional marketplace platform that connects venues and brands ("Brands" or "Buyers") with social media influencers and content creators 
                ("Creators" or "Sellers") for live events and fan experiences. Our services include:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li><strong>Event Booking:</strong> Facilitating bookings between Brands/Venues and Creators for meet & greets, workshops, and live appearances</li>
                <li><strong>Discovery Services:</strong> Helping Brands find and connect with Creators through our marketplace</li>
                <li><strong>Payment Processing:</strong> Secure escrow-based payment handling for all bookings</li>
                <li><strong>Communication Tools:</strong> Messaging system for collaboration between parties</li>
              </ul>
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
                All event bookings on CollabHunts follow this process:
              </p>
              <ol className="list-decimal pl-6 text-muted-foreground space-y-2 mb-4">
                <li><strong>Discovery:</strong> Brands browse and find Creators using our search and filter tools (free)</li>
                <li><strong>Inquiry:</strong> Brands message Creators to discuss event details (free)</li>
                <li><strong>Booking Request:</strong> Brands submit a booking request with event details</li>
                <li><strong>Creator Confirmation:</strong> Creator reviews and accepts/declines the booking</li>
                <li><strong>Deposit Payment:</strong> Brand pays 50% deposit to confirm the booking</li>
                <li><strong>Balance Payment:</strong> Brand pays remaining 50% before the event</li>
                <li><strong>Event Delivery:</strong> Creator performs at the event as agreed</li>
                <li><strong>Approval & Release:</strong> Brand approves completion, funds are released to Creator</li>
              </ol>
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
                <strong>Platform Mediation:</strong> For disputes arising from bookings, both parties must first attempt resolution through our platform's dispute system. Either party can open a dispute within 72 hours of event completion.
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
                <li>Arrive on time and fulfill all event obligations as agreed</li>
                <li>Maintain professional conduct during all events</li>
                <li>Respond to booking requests within 48 hours</li>
                <li>Not cancel confirmed bookings except for genuine emergencies</li>
                <li>Accept the platform's terms regarding pricing visibility and subscription plans</li>
              </ul>
              <p className="text-muted-foreground mb-4">
                <strong>Misrepresentation of metrics (fake followers, purchased engagement, inflated statistics) will result in immediate account termination and forfeiture of pending payments.</strong>
              </p>
            </section>

            {/* Section 10 - Brand Terms */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">10. Brand & Venue Terms</h2>
              <p className="text-muted-foreground mb-4">
                As a Brand or Venue on CollabHunts, you agree to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Provide accurate information about your venue and event requirements</li>
                <li>Pay deposits and balances on time as specified</li>
                <li>Provide safe and appropriate event conditions for Creators</li>
                <li>Approve or raise disputes in a timely manner after event completion</li>
                <li>Not request services that violate platform policies or applicable laws</li>
                <li>Maintain professional communication with Creators at all times</li>
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
                <li>Circumvent platform payments or arrange off-platform transactions</li>
                <li>Infringe upon intellectual property rights of others</li>
                <li>Transmit harmful code, viruses, or malware</li>
                <li>Engage in fraudulent activities or misrepresentation</li>
                <li>Harass, abuse, threaten, or harm other users</li>
                <li>Create fake accounts or artificially inflate metrics</li>
                <li>Share login credentials or allow unauthorized access to your account</li>
                <li>Scrape, data mine, or extract data from the Platform</li>
                <li>Manipulate reviews, ratings, or search rankings</li>
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
                <li>Loss of profits, revenue, or business opportunities</li>
                <li>Event cancellations or no-shows</li>
                <li>Quality of Creator performance at events</li>
                <li>Disputes between Brands and Creators</li>
                <li>Any unauthorized access to or use of our servers</li>
              </ul>
              <p className="text-muted-foreground mb-4">
                <strong>OUR TOTAL LIABILITY SHALL NOT EXCEED THE PLATFORM FEES YOU HAVE PAID TO US IN THE 12 MONTHS PRECEDING THE CLAIM.</strong>
              </p>
            </section>

            {/* Section 14 - Indemnification */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">14. Indemnification</h2>
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
              </ul>
            </section>

            {/* Section 15 - Changes to Terms */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">15. Changes to Terms</h2>
              <p className="text-muted-foreground mb-4">
                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting to the Platform. 
                Material changes will be communicated via email to registered users. Your continued use of the Platform after changes 
                constitutes acceptance of the modified Terms.
              </p>
            </section>

            {/* Section 16 - Contact */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">16. Contact Us</h2>
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
