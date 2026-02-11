import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
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
            Privacy Policy
          </h1>
          <p className="text-muted-foreground mb-8">
            Last updated: February 11, 2026 | Version 4.0
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none space-y-10">
            
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground mb-4">
                CollabHunts ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you use our platform at collabhunts.com ("the Platform").
              </p>
              <p className="text-muted-foreground mb-4">
                This policy applies to all users of our Platform, including Brands, Venues, Creators, and visitors. 
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy 
                policy, please do not access the Platform.
              </p>
              <p className="text-muted-foreground mb-4">
                <strong>Data Controller:</strong> CollabHunts is the data controller responsible for your personal data.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-heading font-semibold mb-3">2.1 Information You Provide</h3>
              <p className="text-muted-foreground mb-4">
                We collect personal information that you voluntarily provide when registering, using our services, or communicating with us:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li><strong>Account Information:</strong> Name, email address, password, phone number</li>
                <li><strong>Profile Information:</strong> Company/venue name, biography, profile photo, cover images, location (city, state, country)</li>
                <li><strong>Creator-Specific Data:</strong> Social media usernames, follower counts, engagement metrics, date of birth, gender, primary language, event experience</li>
                <li><strong>Brand/Venue-Specific Data:</strong> Company name, venue details, capacity, amenities, website URL, logo</li>
                <li><strong>Booking Information:</strong> Event details, dates, times, special requirements</li>
                <li><strong>Payment Information:</strong> Billing address, payment method details (processed by our payment partners)</li>
                <li><strong>Communication Data:</strong> Messages sent through the Platform, support inquiries, feedback</li>
              </ul>

              <h3 className="text-xl font-heading font-semibold mb-3">2.2 Information Collected Automatically</h3>
              <p className="text-muted-foreground mb-4">
                When you access the Platform, we automatically collect certain information:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
                <li><strong>Log Data:</strong> IP address, access times, pages viewed, referring URL</li>
                <li><strong>Usage Data:</strong> Features used, actions taken, interaction patterns</li>
                <li><strong>Location Data:</strong> Approximate location based on IP address</li>
                <li><strong>Cookies and Tracking:</strong> Information collected through cookies, pixels, and similar technologies</li>
              </ul>

              <h3 className="text-xl font-heading font-semibold mb-3">2.3 Information from Third Parties</h3>
              <p className="text-muted-foreground mb-4">
                We may receive information from third-party sources:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li><strong>Social Media Platforms:</strong> Public profile information when you connect social accounts</li>
                <li><strong>Payment Processor:</strong> Transaction status and limited payment information</li>
                <li><strong>Analytics Providers:</strong> Aggregated usage and demographic data</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">
                We use the information we collect for the following purposes:
              </p>
              
              <h3 className="text-xl font-heading font-semibold mb-3">3.1 Service Delivery</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Create and manage your account</li>
                <li>Facilitate connections between Brands/Venues and Creators</li>
                <li>Facilitate connections and communication between Brands/Venues and Creators</li>
                <li>Enable messaging and communication features</li>
                <li>Handle disputes and provide customer support</li>
              </ul>

              <h3 className="text-xl font-heading font-semibold mb-3">3.2 Platform Improvement</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Analyze usage trends and platform performance</li>
                <li>Develop new features and services</li>
                <li>Personalize your experience</li>
                <li>Conduct research and analytics</li>
              </ul>

              <h3 className="text-xl font-heading font-semibold mb-3">3.3 Communications</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Send transactional emails (booking confirmations, event reminders, payment receipts)</li>
                <li>Send administrative information and platform updates</li>
                <li>Respond to your inquiries and provide support</li>
                <li>Send marketing communications (with your consent)</li>
              </ul>

              <h3 className="text-xl font-heading font-semibold mb-3">3.4 Security & Compliance</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Protect against fraudulent or unauthorized activity</li>
                <li>Verify user identities (phone verification)</li>
                <li>Comply with legal obligations</li>
                <li>Enforce our Terms of Service</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">4. Legal Basis for Processing (GDPR)</h2>
              <p className="text-muted-foreground mb-4">
                For users in the European Economic Area (EEA), we process your data based on:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li><strong>Contract Performance:</strong> Processing necessary to provide our services (account creation, bookings, payments, support)</li>
                <li><strong>Legitimate Interests:</strong> Processing for fraud prevention, platform security, and service improvement</li>
                <li><strong>Consent:</strong> Marketing communications and certain cookies (you may withdraw consent at any time)</li>
                <li><strong>Legal Obligation:</strong> Processing required by law (tax records, fraud prevention)</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">5. Information Sharing & Disclosure</h2>
              <p className="text-muted-foreground mb-4">
                We share your information in the following circumstances:
              </p>
              
              <h3 className="text-xl font-heading font-semibold mb-3">5.1 With Other Users</h3>
              <p className="text-muted-foreground mb-4">
                To facilitate the marketplace:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Creator profiles (display name, bio, portfolio, location, social stats, pricing) are visible to Brands</li>
                <li>Brand/Venue information is visible to Creators during bookings</li>
                <li>Messages and booking details are shared between parties in a transaction</li>
              </ul>

              <h3 className="text-xl font-heading font-semibold mb-3">5.2 With Service Providers</h3>
              <p className="text-muted-foreground mb-4">
                We share data with trusted third-party service providers who help us operate the Platform:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li><strong>Payment Processing:</strong> Secure payment partners process all transactions</li>
                <li><strong>Cloud Infrastructure:</strong> Hosting and database services</li>
                <li><strong>Email Services:</strong> Transactional and notification emails</li>
                <li><strong>File Storage:</strong> Secure content and media storage</li>
                <li><strong>Analytics:</strong> Usage analytics and performance monitoring</li>
                <li><strong>SMS Verification:</strong> Phone number verification services</li>
              </ul>

              <h3 className="text-xl font-heading font-semibold mb-3">5.3 For Legal Reasons</h3>
              <p className="text-muted-foreground mb-4">
                We may disclose information:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>To comply with applicable laws, regulations, or legal processes</li>
                <li>To respond to lawful requests from government authorities</li>
                <li>To protect our rights, privacy, safety, or property</li>
                <li>To investigate fraud or security issues</li>
                <li>In connection with a merger, acquisition, or sale of assets</li>
              </ul>

              <h3 className="text-xl font-heading font-semibold mb-3">5.4 With Your Consent</h3>
              <p className="text-muted-foreground mb-4">
                We may share information for other purposes with your explicit consent.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">6. Data Security</h2>
              <p className="text-muted-foreground mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li><strong>Encryption:</strong> Data encrypted in transit (TLS/SSL) and at rest</li>
                <li><strong>Access Controls:</strong> Role-based access with authentication requirements</li>
                <li><strong>Infrastructure Security:</strong> Secure cloud hosting with regular security updates</li>
                <li><strong>Authentication:</strong> Secure user authentication and session management</li>
                <li><strong>Regular Backups:</strong> Automated daily backups with secure storage</li>
                <li><strong>Monitoring:</strong> Continuous monitoring for unauthorized access</li>
              </ul>
              <p className="text-muted-foreground mb-4">
                While we strive to protect your information, no method of transmission over the Internet is 100% secure. 
                We cannot guarantee absolute security.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">7. Your Privacy Rights</h2>
              <p className="text-muted-foreground mb-4">
                Depending on your location, you may have the following rights regarding your personal information:
              </p>
              
              <h3 className="text-xl font-heading font-semibold mb-3">7.1 Rights for All Users</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li><strong>Access:</strong> Request access to the personal information we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal retention requirements)</li>
                <li><strong>Opt-out:</strong> Opt out of marketing communications at any time</li>
                <li><strong>Account Closure:</strong> Close your account and request data deletion</li>
              </ul>

              <h3 className="text-xl font-heading font-semibold mb-3">7.2 Additional Rights for EEA/UK Users (GDPR)</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li><strong>Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
                <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
                <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent at any time where processing is based on consent</li>
                <li><strong>Lodge Complaint:</strong> File a complaint with your local data protection authority</li>
              </ul>

              <h3 className="text-xl font-heading font-semibold mb-3">7.3 Additional Rights for California Residents (CCPA/CPRA)</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li><strong>Know:</strong> Know what personal information is collected and how it's used</li>
                <li><strong>Delete:</strong> Request deletion of personal information</li>
                <li><strong>Opt-Out:</strong> Opt out of the sale or sharing of personal information</li>
                <li><strong>Non-Discrimination:</strong> Not be discriminated against for exercising your rights</li>
              </ul>
              <p className="text-muted-foreground mb-4">
                <strong>Note:</strong> CollabHunts does not sell personal information to third parties.
              </p>

              <p className="text-muted-foreground mb-4">
                To exercise any of these rights, please contact us at <a href="mailto:care@collabhunts.com" className="text-primary hover:underline">care@collabhunts.com</a>. 
                We will respond to your request within 30 days.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">8. Cookies and Tracking Technologies</h2>
              <p className="text-muted-foreground mb-4">
                We use cookies and similar tracking technologies to collect and store information:
              </p>
              
              <h3 className="text-xl font-heading font-semibold mb-3">8.1 Types of Cookies</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li><strong>Essential Cookies:</strong> Required for Platform functionality (authentication, security, preferences)</li>
                <li><strong>Analytics Cookies:</strong> Help us understand usage patterns and improve the Platform</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements (with consent)</li>
              </ul>

              <h3 className="text-xl font-heading font-semibold mb-3">8.2 Cookie Management</h3>
              <p className="text-muted-foreground mb-4">
                You can control cookies through your browser settings. Disabling certain cookies may affect Platform functionality.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">9. Data Retention</h2>
              <p className="text-muted-foreground mb-4">
                We retain your personal information for as long as necessary to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Provide services while your account is active</li>
                <li>Comply with legal obligations (tax records: 7 years)</li>
                <li>Resolve disputes and enforce agreements</li>
                <li>Maintain business records</li>
              </ul>
              <p className="text-muted-foreground mb-4">
                After account closure, we retain certain data as required by law or for legitimate business purposes. 
                Booking and transaction records may be retained for up to 7 years for tax and legal compliance.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">10. International Data Transfers</h2>
              <p className="text-muted-foreground mb-4">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate 
                safeguards are in place for such transfers, including Standard Contractual Clauses approved by the European Commission.
              </p>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">11. Children's Privacy</h2>
              <p className="text-muted-foreground mb-4">
                Our Platform is not intended for children under 18 years of age. We do not knowingly collect personal information 
                from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">12. Changes to This Policy</h2>
              <p className="text-muted-foreground mb-4">
                We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated 
                "Last updated" date. Material changes will be communicated via email to registered users. Your continued 
                use of the Platform after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* Section 13 */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">13. Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                If you have questions about this Privacy Policy or wish to exercise your privacy rights, please contact us:
              </p>
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <p className="text-muted-foreground mb-2">
                  <strong>CollabHunts Privacy Team</strong>
                </p>
                <p className="text-muted-foreground mb-1">
                  Email: <a href="mailto:care@collabhunts.com" className="text-primary hover:underline">care@collabhunts.com</a>
                </p>
                <p className="text-muted-foreground text-sm mt-3">
                  Response time: Within 30 days for privacy requests
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

export default PrivacyPolicy;
