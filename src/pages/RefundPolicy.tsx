import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const RefundPolicy = () => {
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
            Refund & Cancellation Policy
          </h1>
          <p className="text-muted-foreground mb-8">
            Last updated: December 10, 2025 | Version 1.0
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none space-y-10">
            
            {/* Overview */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">1. Overview</h2>
              <p className="text-muted-foreground mb-4">
                This Refund & Cancellation Policy outlines the terms and conditions for refunds, cancellations, and chargebacks 
                on CollabHunts ("the Platform"). By using our services, you agree to this policy. This policy applies to both 
                subscription services and marketplace transactions.
              </p>
              <p className="text-muted-foreground mb-4">
                <strong>Payment Processing:</strong> All payments on CollabHunts are processed by our payment partner, Paddle.com, 
                who acts as the Merchant of Record for all transactions. Paddle handles payment processing, tax collection, 
                and compliance on our behalf.
              </p>
            </section>

            {/* Subscription Refunds */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">2. Subscription Plans (Brands)</h2>
              
              <h3 className="text-xl font-heading font-semibold mb-3">2.1 Cancellation</h3>
              <p className="text-muted-foreground mb-4">
                You may cancel your subscription at any time through your Brand Dashboard settings. Upon cancellation:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Your subscription will remain active until the end of your current billing period</li>
                <li>You will continue to have access to paid features until the subscription expires</li>
                <li>After expiration, your account will automatically downgrade to the free Basic tier</li>
                <li>No partial refunds are provided for unused time in the current billing period</li>
              </ul>

              <h3 className="text-xl font-heading font-semibold mb-3">2.2 Refund Eligibility</h3>
              <p className="text-muted-foreground mb-4">
                Subscription refunds are available under the following conditions:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li><strong>14-Day Money-Back Guarantee:</strong> New subscribers can request a full refund within 14 days of their first subscription payment if they have not used any paid features (e.g., contacting creators, creating campaigns, using Content Library)</li>
                <li><strong>Service Unavailability:</strong> If the Platform experiences significant downtime (more than 72 consecutive hours), pro-rata refunds may be issued for the affected period</li>
                <li><strong>Billing Errors:</strong> If you were charged incorrectly due to a technical error, we will issue a full refund for the erroneous charge</li>
              </ul>

              <h3 className="text-xl font-heading font-semibold mb-3">2.3 Non-Refundable Items</h3>
              <p className="text-muted-foreground mb-4">
                The following are NOT eligible for refunds:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Partial months or unused subscription time after the 14-day period</li>
                <li>Add-on storage purchases (Content Library extra storage)</li>
                <li>Subscriptions where paid features have been used</li>
                <li>Downgrades from a higher tier to a lower tier (no pro-rata refunds)</li>
              </ul>
            </section>

            {/* Marketplace Transaction Refunds */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">3. Marketplace Transactions (Bookings)</h2>
              
              <h3 className="text-xl font-heading font-semibold mb-3">3.1 Escrow Payment System</h3>
              <p className="text-muted-foreground mb-4">
                When you book a Creator's services, your payment is held in escrow until the work is delivered and approved. 
                This protects both Brands and Creators throughout the collaboration process.
              </p>

              <h3 className="text-xl font-heading font-semibold mb-3">3.2 Refund Scenarios for Bookings</h3>
              
              <div className="bg-muted/50 rounded-lg p-4 border border-border mb-4">
                <h4 className="font-semibold mb-2">Full Refund (100%)</h4>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Creator cancels the booking before starting work</li>
                  <li>Creator fails to deliver by the agreed deadline (no deliverables submitted)</li>
                  <li>Booking is declined by the Creator</li>
                  <li>Creator's account is terminated for policy violations before delivery</li>
                </ul>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 border border-border mb-4">
                <h4 className="font-semibold mb-2">Partial Refund (Determined by Dispute Resolution)</h4>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Deliverables do not match the agreed scope or service description</li>
                  <li>Quality disputes after delivery has been submitted</li>
                  <li>Partial completion of the agreed work</li>
                </ul>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 border border-border mb-4">
                <h4 className="font-semibold mb-2">No Refund</h4>
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Deliverables approved by Brand (payment released to Creator)</li>
                  <li>72-hour auto-release triggered (Brand did not respond within 72 hours)</li>
                  <li>Dispute resolved in favor of Creator</li>
                  <li>Brand cancels after Creator has started work (unless Creator agrees)</li>
                </ul>
              </div>

              <h3 className="text-xl font-heading font-semibold mb-3">3.3 Platform Fees</h3>
              <p className="text-muted-foreground mb-4">
                <strong>Platform marketplace fees (15-20% depending on subscription tier) are non-refundable once work has been delivered.</strong> 
                In cases where a full refund is issued before delivery, platform fees are also refunded.
              </p>
            </section>

            {/* Dispute Process */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">4. Dispute Resolution Process</h2>
              <p className="text-muted-foreground mb-4">
                If you are dissatisfied with delivered work, you must follow our dispute resolution process:
              </p>
              <ol className="list-decimal pl-6 text-muted-foreground space-y-2 mb-4">
                <li><strong>Open a Dispute:</strong> Within 72 hours of delivery, open a dispute through your Brand Dashboard explaining the issue</li>
                <li><strong>Creator Response:</strong> The Creator has 3 days to respond to the dispute</li>
                <li><strong>Admin Review:</strong> If not resolved between parties, our admin team reviews the case</li>
                <li><strong>Final Decision:</strong> Admin issues a binding decision within 7 days, which may include full refund, partial refund, or release of payment to Creator</li>
              </ol>
              <p className="text-muted-foreground mb-4 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                <strong>IMPORTANT:</strong> If you do not open a dispute or request revisions within 72 hours of delivery, 
                payment is automatically released to the Creator and you forfeit your right to a refund.
              </p>
            </section>

            {/* How to Request a Refund */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">5. How to Request a Refund</h2>
              
              <h3 className="text-xl font-heading font-semibold mb-3">5.1 Subscription Refunds</h3>
              <p className="text-muted-foreground mb-4">
                To request a subscription refund:
              </p>
              <ol className="list-decimal pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Email <a href="mailto:billing@collabhunts.com" className="text-primary hover:underline">billing@collabhunts.com</a> with subject line "Subscription Refund Request"</li>
                <li>Include your registered email address and company name</li>
                <li>Explain the reason for your refund request</li>
                <li>We will respond within 2 business days</li>
              </ol>

              <h3 className="text-xl font-heading font-semibold mb-3">5.2 Booking/Transaction Refunds</h3>
              <p className="text-muted-foreground mb-4">
                Booking refunds are handled through the Platform's dispute system:
              </p>
              <ol className="list-decimal pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Go to your Brand Dashboard → Bookings</li>
                <li>Find the relevant booking and click "Open Dispute"</li>
                <li>Provide a detailed description and any supporting evidence</li>
                <li>Follow the dispute resolution timeline</li>
              </ol>
            </section>

            {/* Refund Processing */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">6. Refund Processing</h2>
              <p className="text-muted-foreground mb-4">
                Once a refund is approved:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Refunds are processed by our payment partner, Paddle</li>
                <li>Refunds are issued to the original payment method</li>
                <li>Processing time: 5-10 business days depending on your payment provider</li>
                <li>You will receive an email confirmation when the refund is initiated</li>
              </ul>
              <p className="text-muted-foreground mb-4">
                <strong>Currency:</strong> Refunds are issued in the same currency as the original payment. 
                Exchange rate fluctuations may result in slight differences in the refunded amount.
              </p>
            </section>

            {/* Chargebacks */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">7. Chargebacks</h2>
              <p className="text-muted-foreground mb-4">
                We strongly encourage you to contact us before initiating a chargeback with your bank or credit card company. 
                Chargebacks can be costly and time-consuming for all parties.
              </p>
              <p className="text-muted-foreground mb-4">
                <strong>If you initiate a chargeback:</strong>
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Your account may be suspended pending investigation</li>
                <li>We will provide transaction records to the payment processor</li>
                <li>Fraudulent chargebacks may result in permanent account termination</li>
                <li>You may be held responsible for chargeback fees if the dispute is resolved in our favor</li>
              </ul>
            </section>

            {/* Creator Payouts */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">8. Creator Payouts</h2>
              <p className="text-muted-foreground mb-4">
                For Creators receiving payments through the Platform:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Payouts are processed after payment is released (Brand approval or 72-hour auto-release)</li>
                <li>Standard payout processing: 3-5 business days</li>
                <li>Payouts may be held if there are open disputes on your account</li>
                <li>Platform fees are deducted before payout</li>
              </ul>
            </section>

            {/* Modifications */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">9. Policy Changes</h2>
              <p className="text-muted-foreground mb-4">
                We reserve the right to modify this Refund & Cancellation Policy at any time. Changes will be posted on this page 
                with an updated "Last updated" date. Significant changes will be communicated via email to registered users.
              </p>
              <p className="text-muted-foreground mb-4">
                The policy in effect at the time of your purchase or subscription will apply to that transaction.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">10. Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                If you have questions about this Refund & Cancellation Policy or need assistance with a refund, please contact us:
              </p>
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <p className="text-muted-foreground mb-2">
                  <strong>CollabHunts Billing Support</strong>
                </p>
                <p className="text-muted-foreground mb-1">
                  Email: <a href="mailto:billing@collabhunts.com" className="text-primary hover:underline">billing@collabhunts.com</a>
                </p>
                <p className="text-muted-foreground mb-1">
                  General Support: <a href="mailto:care@collabhunts.com" className="text-primary hover:underline">care@collabhunts.com</a>
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