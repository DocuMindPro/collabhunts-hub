import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { DollarSign, Gift } from "lucide-react";
import { sendBrandEmail } from "@/lib/email-utils";

interface ApplyOpportunityDialogProps {
  opportunity: {
    id: string;
    title: string;
    is_paid: boolean;
    budget_cents: number | null;
  };
  creatorProfileId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ApplyOpportunityDialog = ({
  opportunity,
  creatorProfileId,
  open,
  onOpenChange,
  onSuccess,
}: ApplyOpportunityDialogProps) => {
  const [message, setMessage] = useState("");
  const [proposedPrice, setProposedPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);

    const applicationData: {
      opportunity_id: string;
      creator_profile_id: string;
      message: string;
      proposed_price_cents?: number;
    } = {
      opportunity_id: opportunity.id,
      creator_profile_id: creatorProfileId,
      message: message.trim(),
    };

    // Only include proposed price for paid opportunities
    if (opportunity.is_paid && proposedPrice) {
      applicationData.proposed_price_cents = Math.round(parseFloat(proposedPrice) * 100);
    }

    const { error } = await supabase
      .from("opportunity_applications")
      .insert(applicationData);

    if (error) {
      console.error("Error applying:", error);
      toast({
        title: "Application Failed",
        description: error.code === "23505" 
          ? "You have already applied to this opportunity."
          : "Failed to submit your application. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Application Submitted!",
        description: "The brand will review your application and get back to you.",
      });
      
      // Email the brand about the new application
      // Look up brand_profile_id from the opportunity
      supabase
        .from("brand_opportunities")
        .select("brand_profile_id")
        .eq("id", opportunity.id)
        .single()
        .then(({ data }) => {
          if (data) {
            sendBrandEmail("brand_new_application", data.brand_profile_id, {
              opportunity_title: opportunity.title,
              creator_name: "A creator",
            });
          }
        });
      
      onSuccess();
    }

    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Apply to Opportunity</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            {opportunity.title}
            {opportunity.is_paid ? (
              <span className="inline-flex items-center text-green-600">
                <DollarSign className="h-3 w-3" /> Paid
              </span>
            ) : (
              <span className="inline-flex items-center text-amber-600">
                <Gift className="h-3 w-3" /> Free Invite
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Proposed Price (only for paid opportunities) */}
          {opportunity.is_paid && (
            <div className="space-y-2">
              <Label htmlFor="price">Your Rate ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="price"
                  type="number"
                  placeholder={opportunity.budget_cents 
                    ? `Brand's budget: $${(opportunity.budget_cents / 100).toFixed(0)}`
                    : "Enter your rate"
                  }
                  value={proposedPrice}
                  onChange={(e) => setProposedPrice(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {opportunity.budget_cents 
                  ? `The brand has budgeted $${(opportunity.budget_cents / 100).toFixed(0)} per creator.`
                  : "Propose your rate for this collaboration."
                }
              </p>
            </div>
          )}

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message to Brand</Label>
            <Textarea
              id="message"
              placeholder="Introduce yourself and explain why you'd be a great fit for this opportunity..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Share relevant experience, your content style, and why you're interested.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyOpportunityDialog;
