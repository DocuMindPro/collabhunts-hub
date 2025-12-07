import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground mb-8">
            Last updated: December 7, 2025
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <section className="mb-10">
              <h2 className="text-2xl font-heading font-bold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground mb-4">
                CollabHunts ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>
              <p className="text-muted-foreground mb-4">
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy 
                policy, please do not access the platform.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-heading font-bold mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-heading font-semibold mb-3">Personal Information</h3>
              <p className="text-muted-foreground mb-4">
                We may collect personal information that you voluntarily provide when registering, including:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Name and email address</li>
                <li>Company name (for brands)</li>
                <li>Profile information and biography</li>
                <li>Social media account information</li>
                <li>Payment and billing information</li>
                <li>Location information (city, state, country)</li>
              </ul>

              <h3 className="text-xl font-heading font-semibold mb-3">Automatically Collected Information</h3>
              <p className="text-muted-foreground mb-4">
                When you access the Platform, we automatically collect certain information, including:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Device and browser information</li>
                <li>IP address and location data</li>
                <li>Usage patterns and preferences</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-heading font-bold mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Create and manage your account</li>
                <li>Facilitate connections between brands and creators</li>
                <li>Process payments and transactions</li>
                <li>Send administrative information and updates</li>
                <li>Respond to inquiries and provide support</li>
                <li>Improve and personalize your experience</li>
                <li>Analyze usage trends and platform performance</li>
                <li>Protect against fraudulent or unauthorized activity</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-heading font-bold mb-4">4. Information Sharing</h2>
              <p className="text-muted-foreground mb-4">
                We may share your information in the following circumstances:
              </p>
              
              <h3 className="text-xl font-heading font-semibold mb-3">With Other Users</h3>
              <p className="text-muted-foreground mb-4">
                Certain profile information is visible to other platform users to facilitate collaboration. 
                Creator profiles are publicly visible to brands, and brand profiles are visible to creators 
                they engage with.
              </p>

              <h3 className="text-xl font-heading font-semibold mb-3">With Service Providers</h3>
              <p className="text-muted-foreground mb-4">
                We may share information with third-party service providers who perform services on our behalf, 
                such as payment processing, data analysis, email delivery, and hosting services.
              </p>

              <h3 className="text-xl font-heading font-semibold mb-3">For Legal Reasons</h3>
              <p className="text-muted-foreground mb-4">
                We may disclose information if required by law or in response to valid legal requests, 
                to protect our rights, or to prevent harm.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-heading font-bold mb-4">5. Data Security</h2>
              <p className="text-muted-foreground mb-4">
                We implement appropriate technical and organizational security measures to protect your 
                personal information. However, no method of transmission over the Internet or electronic 
                storage is 100% secure, and we cannot guarantee absolute security.
              </p>
              <p className="text-muted-foreground mb-4">
                Security measures we employ include:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and audits</li>
                <li>Access controls and authentication</li>
                <li>Secure payment processing through certified providers</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-heading font-bold mb-4">6. Your Privacy Rights</h2>
              <p className="text-muted-foreground mb-4">
                Depending on your location, you may have certain rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li><strong>Access:</strong> Request access to the personal information we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Opt-out:</strong> Opt out of marketing communications</li>
              </ul>
              <p className="text-muted-foreground mb-4">
                To exercise these rights, please contact us at the email address provided below.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-heading font-bold mb-4">7. Cookies and Tracking</h2>
              <p className="text-muted-foreground mb-4">
                We use cookies and similar tracking technologies to collect and store information about 
                your preferences and activity on our Platform. You can control cookie settings through 
                your browser preferences.
              </p>
              <p className="text-muted-foreground mb-4">
                Types of cookies we use:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li><strong>Essential cookies:</strong> Required for Platform functionality</li>
                <li><strong>Analytics cookies:</strong> Help us understand usage patterns</li>
                <li><strong>Preference cookies:</strong> Remember your settings and preferences</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-heading font-bold mb-4">8. Data Retention</h2>
              <p className="text-muted-foreground mb-4">
                We retain your personal information for as long as your account is active or as needed to 
                provide you services. We may retain certain information as required by law or for legitimate 
                business purposes after account closure.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-heading font-bold mb-4">9. Children's Privacy</h2>
              <p className="text-muted-foreground mb-4">
                Our Platform is not intended for individuals under 18 years of age. We do not knowingly 
                collect personal information from children. If we learn we have collected personal information 
                from a child under 18, we will delete that information promptly.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-heading font-bold mb-4">10. International Data Transfers</h2>
              <p className="text-muted-foreground mb-4">
                Your information may be transferred to and processed in countries other than your country 
                of residence. We ensure appropriate safeguards are in place to protect your information 
                in accordance with this Privacy Policy.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-heading font-bold mb-4">11. Changes to This Policy</h2>
              <p className="text-muted-foreground mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any material 
                changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-heading font-bold mb-4">12. Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                If you have questions or concerns about this Privacy Policy or our data practices, 
                please contact us at:
              </p>
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <p className="text-muted-foreground mb-2">
                  <strong>CollabHunts Privacy Team</strong>
                </p>
                <p className="text-muted-foreground">
                  Email: <a href="mailto:care@collabhunts.com" className="text-primary hover:underline">care@collabhunts.com</a>
                </p>
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
