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
            Last updated: February 3, 2026 | Version 2.0
          </p>

          <div className="prose prose-lg dark:prose-invert max-w-none space-y-10">
            
            {/* Overview */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">1. Overview</h2>
              <p className="text-muted-foreground mb-4">
                This Refund & Cancellation Policy outlines the terms and conditions for refunds, cancellations, and chargebacks 
                on CollabHunts ("the Platform"). By using our services, you agree to this policy. This policy applies to all 
                event bookings made through the Platform.
              </p>
              <p className="text-muted-foreground mb-4">
                <strong>Payment Model:</strong> CollabHunts uses a secure escrow system. Brands pay a 50% deposit at booking confirmation, 
                with the remaining 50% due before the event. Funds are held securely until event completion and approval.
              </p>
            </section>

            {/* Booking Cancellations */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">2. Booking Cancellations</h2>
              
              <h3 className="text-xl font-heading font-semibold mb-3">2.1 Cancellation by Brand</h3>
              <p className="text-muted-foreground mb-4">
                Brands may cancel bookings under the following conditions:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li><strong>Before Creator Confirmation:</strong> Full refund of any payments made</li>
                <li><strong>7+ Days Before Event:</strong> Full refund of deposit (minus processing fees)</li>
                <li><strong>3-7 Days Before Event:</strong> 50% refund of deposit</li>
                <li><strong>Less than 3 Days Before Event:</strong> No refund (deposit retained by Creator)</li>
              </ul>

              <h3 className="text-xl font-heading font-semibold mb-3">2.2 Cancellation by Creator</h3>
              <p className="text-muted-foreground mb-4">
                If a Creator cancels a confirmed booking:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Brand receives a <strong>full refund</strong> of all payments made</li>
                <li>Creator may receive a warning or account suspension depending on circumstances</li>
                <li>Repeated cancellations may result in account termination</li>
              </ul>

              <h3 className="text-xl font-heading font-semibold mb-3">2.3 Creator No-Show</h3>
              <p className="text-muted-foreground mb-4">
                If a Creator fails to appear at a confirmed event:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Brand receives a <strong>full refund</strong> of all payments</li>
                <li>Creator's account may be suspended or terminated</li>
                <li>Brand may be eligible for additional compensation at CollabHunts' discretion</li>
              </ul>
            </section>

            {/* Event Issues & Disputes */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">3. Event Issues & Disputes</h2>
              
              <h3 className="text-xl font-heading font-semibold mb-3">3.1 Opening a Dispute</h3>
              <p className="text-muted-foreground mb-4">
                If there are issues with an event, either party can open a dispute within <strong>72 hours</strong> of the scheduled event time:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Go to your Dashboard → Bookings → Select the booking → Open Dispute</li>
                <li>Provide a detailed description of the issue</li>
                <li>The other party has 72 hours to respond</li>
                <li>If unresolved, the dispute escalates to CollabHunts mediation</li>
              </ul>

              <h3 className="text-xl font-heading font-semibold mb-3">3.2 Dispute Outcomes</h3>
              <p className="text-muted-foreground mb-4">
                Based on our review, disputes may result in:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li><strong>Full refund to Brand:</strong> If Creator failed to deliver as agreed</li>
                <li><strong>Partial refund:</strong> If service was partially delivered or issues were shared</li>
                <li><strong>Full payment to Creator:</strong> If Brand's complaint is unfounded</li>
                <li><strong>Split resolution:</strong> Negotiated settlement between parties</li>
              </ul>

              <h3 className="text-xl font-heading font-semibold mb-3">3.3 Auto-Approval</h3>
              <p className="text-muted-foreground mb-4">
                If a Brand does not approve or dispute an event within <strong>72 hours</strong> of completion, 
                the booking is automatically approved and funds are released to the Creator.
              </p>
            </section>

            {/* How to Request a Refund */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">4. How to Request a Refund</h2>
              
              <h3 className="text-xl font-heading font-semibold mb-3">4.1 Through the Platform</h3>
              <p className="text-muted-foreground mb-4">
                To cancel a booking and request a refund:
              </p>
              <ol className="list-decimal pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Go to your Dashboard → Bookings</li>
                <li>Select the booking you want to cancel</li>
                <li>Click "Cancel Booking" and select your reason</li>
                <li>Refund eligibility is calculated automatically based on timing</li>
              </ol>

              <h3 className="text-xl font-heading font-semibold mb-3">4.2 Contact Support</h3>
              <p className="text-muted-foreground mb-4">
                For complex situations or issues not covered by the standard cancellation flow:
              </p>
              <ol className="list-decimal pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Email <a href="mailto:care@collabhunts.com" className="text-primary hover:underline">care@collabhunts.com</a> with subject line "Refund Request"</li>
                <li>Include booking details and description of the issue</li>
                <li>We will respond within 2 business days</li>
              </ol>
            </section>

            {/* Refund Processing */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">5. Refund Processing</h2>
              <p className="text-muted-foreground mb-4">
                Once a refund is approved:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
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
              <h2 className="text-2xl font-heading font-bold mb-4">6. Chargebacks</h2>
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
              <h2 className="text-2xl font-heading font-bold mb-4">7. Creator Payouts</h2>
              <p className="text-muted-foreground mb-4">
                Creator payments are processed as follows:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Funds are released after event completion and Brand approval (or 72-hour auto-approval)</li>
                <li>A <strong>15% platform fee</strong> is deducted from the total booking amount</li>
                <li>Remaining funds are transferred to the Creator's registered payout method</li>
                <li>Payout processing time: 3-5 business days</li>
              </ul>
            </section>

            {/* Force Majeure */}
            <section>
              <h2 className="text-2xl font-heading font-bold mb-4">8. Force Majeure</h2>
              <p className="text-muted-foreground mb-4">
                In cases of events beyond reasonable control (natural disasters, government restrictions, etc.):
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Both parties may reschedule without penalty</li>
                <li>If rescheduling is not possible, full refunds are provided</li>
                <li>Contact support immediately with documentation of the circumstances</li>
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
                The policy in effect at the time of your booking will apply to that transaction.
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
