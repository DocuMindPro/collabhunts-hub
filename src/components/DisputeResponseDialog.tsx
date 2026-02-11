import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MessageSquare, Clock, AlertTriangle } from "lucide-react";
import { formatDistanceToNow, isPast } from "date-fns";
import { sendAdminEmail } from "@/lib/email-utils";

interface DisputeResponseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disputeId: string;
  disputeReason: string;
  openerName: string;
  responseDeadline: string;
  onResponseSubmitted?: () => void;
}

export const DisputeResponseDialog = ({
  open,
  onOpenChange,
  disputeId,
  disputeReason,
  openerName,
  responseDeadline,
  onResponseSubmitted
}: DisputeResponseDialogProps) => {
  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isOverdue = isPast(new Date(responseDeadline));
  const timeRemaining = formatDistanceToNow(new Date(responseDeadline), { addSuffix: true });

  const handleSubmit = async () => {
    if (response.trim().length < 50) {
      toast.error("Please provide a detailed response (minimum 50 characters)");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("booking_disputes")
        .update({
          response_text: response.trim(),
          response_submitted_at: new Date().toISOString(),
          status: "pending_admin_review"
        })
        .eq("id", disputeId);

      if (error) throw error;

      toast.success("Response submitted. An admin will review the dispute soon.");
      
      // Notify admin that dispute is ready for review
      sendAdminEmail("admin_dispute_resolution_reminder", {
        dispute_id: disputeId,
        opener_name: openerName,
      });
      
      onOpenChange(false);
      onResponseSubmitted?.();
      setResponse("");
    } catch (error: any) {
      console.error("Error submitting response:", error);
      toast.error(error.message || "Failed to submit response");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Respond to Dispute
          </DialogTitle>
          <DialogDescription>
            {openerName} has opened a dispute. Please provide your response.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Deadline warning */}
          <div className={`p-3 rounded-lg border ${isOverdue 
            ? 'bg-destructive/10 border-destructive/20' 
            : 'bg-yellow-500/10 border-yellow-500/20'}`}
          >
            <div className="flex items-start gap-2">
              {isOverdue ? (
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
              ) : (
                <Clock className="h-4 w-4 text-yellow-600 mt-0.5" />
              )}
              <div className="text-sm">
                <p className={`font-medium ${isOverdue ? 'text-destructive' : 'text-yellow-600'}`}>
                  {isOverdue ? 'Response Overdue!' : 'Response Deadline'}
                </p>
                <p className="text-muted-foreground">
                  {isOverdue 
                    ? 'Your response is overdue. Submit immediately to avoid automatic escalation.'
                    : `You have ${timeRemaining} to respond`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Original dispute reason */}
          <div className="space-y-2">
            <Label>Dispute Reason from {openerName}</Label>
            <div className="p-3 bg-muted rounded-lg text-sm">
              {disputeReason}
            </div>
          </div>

          {/* Response input */}
          <div className="space-y-2">
            <Label htmlFor="response">
              Your Response <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="response"
              placeholder="Provide your side of the story. Be specific and factual..."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              {response.length}/50 characters minimum
              {response.length >= 50 && " ✓"}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitting || response.length < 50}
          >
            {submitting ? "Submitting..." : "Submit Response"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DisputeResponseDialog;
