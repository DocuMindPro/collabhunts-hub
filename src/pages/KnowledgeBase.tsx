import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  BookOpen, 
  Users, 
  Building2, 
  CreditCard, 
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  HelpCircle
} from "lucide-react";

const KnowledgeBase = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const creatorFaqs = [
    {
      question: "How do I get paid?",
      answer: "Once you complete a booking and deliver your work, the brand has 72 hours to review and approve the deliverables. After approval, payment is released to your connected payout account. If the brand doesn't respond within 72 hours, payment is automatically released to you."
    },
    {
      question: "What happens if a brand disputes my work?",
      answer: "If a brand is unsatisfied, they can open a dispute within 72 hours of delivery. You'll have 3 days to respond with your side of the story. If both parties can't resolve it, our admin team will review and make a final decision. Possible outcomes include full payment release, full refund, or a split payment."
    },
    {
      question: "How long do I have to deliver work?",
      answer: "Each service you offer has a specified delivery timeframe (e.g., 7 days). This is set when you create your service packages. The countdown begins when a brand's booking is accepted. Make sure to deliver before the deadline to maintain your reputation."
    },
    {
      question: "What if I can't complete a booking?",
      answer: "If you're unable to complete a booking, communicate with the brand as soon as possible. You can decline pending bookings before accepting them. If you've already accepted, reach out to the brand to discuss. Repeated failures to deliver may affect your account standing."
    },
    {
      question: "How do refunds work?",
      answer: "If a booking is cancelled before work begins, the brand receives a full refund. After delivery, refunds are only issued through the dispute resolution process. Platform fees are non-refundable once work has been delivered."
    },
    {
      question: "What are the platform fees?",
      answer: "CollabHunts operates on a marketplace fee model charged to brands (not creators). Brands pay 15-20% depending on their subscription tier. You receive the full service price you set minus payment processing fees."
    },
    {
      question: "How do revisions work?",
      answer: "Revisions depend on what's agreed upon with the brand. We recommend specifying revision limits in your service descriptions. Brands can request revisions before approving delivery, but excessive revision requests may be grounds for dispute resolution."
    },
    {
      question: "What content types are allowed?",
      answer: "All content must comply with our Content Guidelines. Prohibited content includes: illegal material, explicit adult content, hate speech, violence promotion, and misleading information. Your content must also comply with FTC advertising disclosure requirements."
    },
    {
      question: "Why is my profile pending approval?",
      answer: "All new creator profiles are reviewed by our team to ensure quality and authenticity. This typically takes 1-2 business days. Make sure your profile is complete with accurate social media metrics and a professional bio to increase approval chances."
    },
    {
      question: "Can I withdraw my earnings anytime?",
      answer: "Earnings are released to your connected payout account automatically after delivery confirmation. Payout timing depends on your payment provider but typically arrives within 2-5 business days."
    }
  ];

  const brandFaqs = [
    {
      question: "How does payment escrow work?",
      answer: "When you book a creator, your payment is held securely until the work is delivered and approved. This protects both parties - creators know payment is guaranteed, and you maintain control until you're satisfied with the deliverables."
    },
    {
      question: "What if I'm not satisfied with the deliverables?",
      answer: "You have 72 hours after delivery to review the work. You can request revisions, approve the work (releasing payment), or open a dispute if there are significant issues. Clear communication with creators about your expectations helps prevent issues."
    },
    {
      question: "How do I open a dispute?",
      answer: "Navigate to your Bookings tab, find the relevant booking, and click 'Open Dispute'. Provide a clear reason and any supporting evidence. The creator has 3 days to respond. If unresolved, our admin team will make a final decision."
    },
    {
      question: "What happens if I forget to approve deliverables?",
      answer: "IMPORTANT: If you don't approve, request revisions, or open a dispute within 72 hours of delivery, payment is automatically released to the creator. We send reminders at 48 hours and 24 hours before auto-release. Make sure to review deliverables promptly!"
    },
    {
      question: "How do subscription tiers affect fees?",
      answer: "Basic (Free): 20% marketplace fee, limited features. Pro ($99/month): 15% fee, Creator CRM, 10GB Content Library. Premium ($299/month): 15% fee, unlimited campaigns, 50GB Content Library. Higher tiers save money on fees and unlock more features."
    },
    {
      question: "What are my rights to the content?",
      answer: "Upon payment release, you receive usage rights to the content as specified in the booking agreement. Standard bookings include perpetual usage rights for marketing purposes. For exclusive or time-limited rights, specify these in your booking message and agree with the creator beforehand."
    },
    {
      question: "Can I request revisions?",
      answer: "Yes, you can request revisions before approving delivery. Communicate your feedback clearly through the messaging system. Reasonable revision requests are expected to be fulfilled. Excessive or out-of-scope revision requests may lead to disputes."
    },
    {
      question: "How do I cancel a booking?",
      answer: "Before the creator accepts: Bookings can be cancelled with a full refund. After acceptance but before delivery: Contact the creator to discuss. May result in partial refund depending on work completed. After delivery: Cannot cancel; must go through approval or dispute process."
    },
    {
      question: "Why can't I contact creators on Basic plan?",
      answer: "The Basic plan is free but has limited features. To contact creators and create bookings, you need to upgrade to Pro or Premium. This helps us maintain a quality marketplace and support platform development."
    },
    {
      question: "What's the Content Library?",
      answer: "Pro and Premium subscribers get access to the Content Library - a secure space to store and organize all UGC and content from your creator collaborations. Track usage rights, tag content, organize in folders, and never lose track of your content assets."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Knowledge Base
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about using CollabHunts. Find answers to common questions and learn how our platform works.
            </p>
          </div>

          <Tabs defaultValue="getting-started" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto gap-2">
              <TabsTrigger value="getting-started" className="flex items-center gap-2 py-3">
                <HelpCircle className="h-4 w-4" />
                <span className="hidden md:inline">Getting Started</span>
                <span className="md:hidden">Start</span>
              </TabsTrigger>
              <TabsTrigger value="creators" className="flex items-center gap-2 py-3">
                <Users className="h-4 w-4" />
                <span className="hidden md:inline">For Creators</span>
                <span className="md:hidden">Creators</span>
              </TabsTrigger>
              <TabsTrigger value="brands" className="flex items-center gap-2 py-3">
                <Building2 className="h-4 w-4" />
                <span className="hidden md:inline">For Brands</span>
                <span className="md:hidden">Brands</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2 py-3">
                <CreditCard className="h-4 w-4" />
                <span className="hidden md:inline">Payments</span>
                <span className="md:hidden">Pay</span>
              </TabsTrigger>
              <TabsTrigger value="policies" className="flex items-center gap-2 py-3">
                <Shield className="h-4 w-4" />
                <span className="hidden md:inline">Policies</span>
                <span className="md:hidden">Rules</span>
              </TabsTrigger>
            </TabsList>

            {/* Getting Started */}
            <TabsContent value="getting-started" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    Welcome to CollabHunts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground">
                    CollabHunts is a marketplace connecting brands with content creators for authentic collaborations. Here's how it works:
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 space-y-2">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        For Creators
                      </h3>
                      <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                        <li>Create your profile with social accounts</li>
                        <li>Set up your service packages and pricing</li>
                        <li>Wait for profile approval (1-2 days)</li>
                        <li>Receive and accept booking requests</li>
                        <li>Deliver content and get paid!</li>
                      </ol>
                    </div>
                    
                    <div className="border rounded-lg p-4 space-y-2">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        For Brands
                      </h3>
                      <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                        <li>Create your brand account</li>
                        <li>Browse and discover creators</li>
                        <li>Book services (payment held in escrow)</li>
                        <li>Receive and review deliverables</li>
                        <li>Approve to release payment</li>
                      </ol>
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <h4 className="font-semibold flex items-center gap-2 text-amber-800 dark:text-amber-200">
                      <Clock className="h-4 w-4" />
                      Important: 72-Hour Auto-Release Policy
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-2">
                      After a creator delivers their work, brands have <strong>72 hours</strong> to review, request revisions, or open a dispute. 
                      If no action is taken within 72 hours, payment is <strong>automatically released</strong> to the creator. 
                      This protects creators from indefinite payment holds.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* For Creators */}
            <TabsContent value="creators" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Creator FAQs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {creatorFaqs.map((faq, index) => (
                      <AccordionItem key={index} value={`creator-${index}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            {/* For Brands */}
            <TabsContent value="brands" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Brand FAQs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {brandFaqs.map((faq, index) => (
                      <AccordionItem key={index} value={`brand-${index}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payments & Disputes */}
            <TabsContent value="payments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Payment & Dispute Process
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Payment Timeline</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-sm font-semibold text-primary">1</span>
                        </div>
                        <div>
                          <p className="font-medium">Booking Created</p>
                          <p className="text-sm text-muted-foreground">Brand pays upfront. Payment held securely in escrow.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-sm font-semibold text-primary">2</span>
                        </div>
                        <div>
                          <p className="font-medium">Creator Delivers Work</p>
                          <p className="text-sm text-muted-foreground">72-hour review window begins. Brand receives notification.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-sm font-semibold text-primary">3</span>
                        </div>
                        <div>
                          <p className="font-medium">Brand Reviews (72 hours)</p>
                          <p className="text-sm text-muted-foreground">Options: Approve (release payment), Request Revision, or Open Dispute.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center shrink-0">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Payment Released</p>
                          <p className="text-sm text-muted-foreground">Upon approval OR auto-release after 72 hours of inaction.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      Dispute Resolution Process
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-sm font-semibold text-amber-600">1</span>
                        </div>
                        <div>
                          <p className="font-medium">Dispute Opened (Day 0)</p>
                          <p className="text-sm text-muted-foreground">Either party can open dispute with reason and evidence.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-sm font-semibold text-amber-600">2</span>
                        </div>
                        <div>
                          <p className="font-medium">Response Period (3 Days)</p>
                          <p className="text-sm text-muted-foreground">Other party has 3 days to respond. Reminders sent at 48h and 24h.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-sm font-semibold text-amber-600">3</span>
                        </div>
                        <div>
                          <p className="font-medium">Admin Review (7 Days)</p>
                          <p className="text-sm text-muted-foreground">If unresolved, escalates to admin. Decision within 7 days.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-sm font-semibold text-primary">4</span>
                        </div>
                        <div>
                          <p className="font-medium">Resolution</p>
                          <p className="text-sm text-muted-foreground">Possible outcomes: Full payment release, full refund, or split payment. Admin decision is final.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Policies */}
            <TabsContent value="policies" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Platform Policies
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Content Guidelines</h3>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li>All content must be original or properly licensed</li>
                      <li>No explicit adult content or nudity</li>
                      <li>No hate speech, discrimination, or harassment</li>
                      <li>No promotion of illegal activities</li>
                      <li>Must comply with FTC advertising disclosure requirements</li>
                      <li>No misleading claims or fake engagement metrics</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Account Requirements</h3>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li>Phone verification required for all accounts</li>
                      <li>Accurate social media metrics (fake followers = account termination)</li>
                      <li>One account per person/company</li>
                      <li>Must be 18+ years old to use the platform</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Prohibited Activities</h3>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li>Circumventing platform fees by conducting transactions outside CollabHunts</li>
                      <li>Creating fake accounts or impersonating others</li>
                      <li>Manipulating reviews or ratings</li>
                      <li>Sharing login credentials</li>
                      <li>Harassing other users</li>
                    </ul>
                  </div>

                  <div className="flex gap-4 pt-4 border-t">
                    <a href="/terms" className="text-sm text-primary hover:underline">
                      Full Terms of Service →
                    </a>
                    <a href="/privacy" className="text-sm text-primary hover:underline">
                      Privacy Policy →
                    </a>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default KnowledgeBase;