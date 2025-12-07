import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Terms of Service
          </h1>
          <p className="text-muted-foreground mb-8">
            Last updated: December 7, 2025
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <section className="mb-10">
              <h2 className="text-2xl font-heading font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground mb-4">
                By accessing or using CollabHunts ("the Platform"), you agree to be bound by these Terms of Service 
                and all applicable laws and regulations. If you do not agree with any of these terms, you are 
                prohibited from using or accessing this site.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-heading font-bold mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground mb-4">
                CollabHunts is a marketplace platform that connects brands with content creators for 
                collaboration opportunities. We provide tools and services to facilitate these connections, 
                including but not limited to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Creator profile hosting and discovery</li>
                <li>Brand campaign creation and management</li>
                <li>Messaging and communication tools</li>
                <li>Booking and payment processing</li>
                <li>Analytics and performance tracking</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-heading font-bold mb-4">3. User Accounts</h2>
              <p className="text-muted-foreground mb-4">
                To access certain features of the Platform, you must register for an account. You agree to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-heading font-bold mb-4">4. Creator Terms</h2>
              <p className="text-muted-foreground mb-4">
                As a Creator on CollabHunts, you agree to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Provide accurate information about your social media presence and audience</li>
                <li>Deliver services as described in your profile and agreed upon with brands</li>
                <li>Comply with all applicable advertising disclosure requirements (e.g., FTC guidelines)</li>
                <li>Not misrepresent your engagement metrics, follower counts, or audience demographics</li>
                <li>Maintain professional communication with brands at all times</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-heading font-bold mb-4">5. Brand Terms</h2>
              <p className="text-muted-foreground mb-4">
                As a Brand on CollabHunts, you agree to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Provide accurate information about your company and campaign requirements</li>
                <li>Pay creators promptly for completed work as agreed</li>
                <li>Not request services that violate platform policies or applicable laws</li>
                <li>Respect creator intellectual property and usage rights</li>
                <li>Maintain professional communication with creators at all times</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-heading font-bold mb-4">6. Fees and Payments</h2>
              <p className="text-muted-foreground mb-4">
                CollabHunts charges marketplace fees on transactions between brands and creators. Current fee 
                structures are displayed on our Pricing page. We reserve the right to modify our fee structure 
                with reasonable notice to users.
              </p>
              <p className="text-muted-foreground mb-4">
                All payments are processed through our secure payment system. Creators are responsible for 
                their own tax obligations arising from income earned through the Platform.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-heading font-bold mb-4">7. Prohibited Activities</h2>
              <p className="text-muted-foreground mb-4">
                You may not use the Platform to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon intellectual property rights of others</li>
                <li>Transmit harmful code, viruses, or malware</li>
                <li>Engage in fraudulent activities or misrepresentation</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Circumvent platform fees by conducting transactions outside the Platform</li>
                <li>Create fake accounts or artificially inflate metrics</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-heading font-bold mb-4">8. Content Guidelines</h2>
              <p className="text-muted-foreground mb-4">
                Users are responsible for all content they post on the Platform. Content must not:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Contain illegal, harmful, or offensive material</li>
                <li>Infringe on third-party rights</li>
                <li>Contain false or misleading information</li>
                <li>Promote violence, discrimination, or illegal activities</li>
              </ul>
              <p className="text-muted-foreground mb-4">
                We reserve the right to remove any content that violates these guidelines.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-heading font-bold mb-4">9. Intellectual Property</h2>
              <p className="text-muted-foreground mb-4">
                The Platform and its original content, features, and functionality are owned by CollabHunts 
                and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
              <p className="text-muted-foreground mb-4">
                Users retain ownership of content they create and post on the Platform, but grant CollabHunts 
                a license to use, display, and distribute such content as necessary to operate the Platform.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-heading font-bold mb-4">10. Limitation of Liability</h2>
              <p className="text-muted-foreground mb-4">
                CollabHunts shall not be liable for any indirect, incidental, special, consequential, or 
                punitive damages resulting from your use of the Platform. Our total liability shall not 
                exceed the fees you have paid to us in the past twelve months.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-heading font-bold mb-4">11. Termination</h2>
              <p className="text-muted-foreground mb-4">
                We may terminate or suspend your account immediately, without prior notice, for any reason, 
                including breach of these Terms. Upon termination, your right to use the Platform will cease 
                immediately.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-heading font-bold mb-4">12. Changes to Terms</h2>
              <p className="text-muted-foreground mb-4">
                We reserve the right to modify these terms at any time. We will notify users of significant 
                changes via email or platform notification. Continued use of the Platform after changes 
                constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-heading font-bold mb-4">13. Contact Information</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-muted-foreground">
                Email: <a href="mailto:care@collabhunts.com" className="text-primary hover:underline">care@collabhunts.com</a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;
