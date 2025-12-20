import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AlertTriangle, Clock } from "lucide-react";
import { addDays } from "date-fns";

interface DisputeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  otherPartyName: string;
  totalPrice: number;
  userRole: "brand" | "creator";
  onDisputeCreated?: () => void;
}

export const DisputeDialog = ({
  open,
  onOpenChange,
  bookingId,
  otherPartyName,
  totalPrice,
  userRole,
  onDisputeCreated
}: DisputeDialogProps) => {
  const [reason, setReason] = useState("");
  const [evidence, setEvidence] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (reason.trim().length < 50) {
      toast.error("Please provide a detailed reason (minimum 50 characters)");
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Calculate deadlines
      const responseDeadline = addDays(new Date(), 3); // 3 days to respond
      const resolutionDeadline = addDays(new Date(), 7); // 7 days total

      const { error } = await supabase
        .from("booking_disputes")
        .insert({
          booking_id: bookingId,
          opened_by_user_id: user.id,
          opened_by_role: userRole,
          reason: reason.trim(),
          evidence_description: evidence.trim() || null,
          response_deadline: responseDeadline.toISOString(),
          resolution_deadline: resolutionDeadline.toISOString(),
          status: "pending_response"
        });

      if (error) throw error;

      // Update booking payment status to disputed
      await supabase
        .from("bookings")
        .update({ payment_status: "disputed" })
        .eq("id", bookingId);

      toast.success("Dispute opened successfully. The other party has 3 days to respond.");
      onOpenChange(false);
      onDisputeCreated?.();
      setReason("");
      setEvidence("");
    } catch (error: any) {
      console.error("Error creating dispute:", error);
      toast.error(error.message || "Failed to open dispute");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Open a Dispute
          </DialogTitle>
          <DialogDescription>
            File a dispute regarding your collaboration with {otherPartyName}. 
            Our team will review and help resolve the issue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-600">Dispute Timeline</p>
                <ul className="text-muted-foreground mt-1 space-y-1">
                  <li>• {otherPartyName} has <strong>3 days</strong> to respond</li>
                  <li>• Admin will review and resolve within <strong>7 days</strong></li>
                  <li>• You'll be notified of all updates</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason for Dispute <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Explain why you're opening this dispute. Be specific about the issue..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              {reason.length}/50 characters minimum
              {reason.length >= 50 && " ✓"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="evidence">
              Supporting Evidence (Optional)
            </Label>
            <Textarea
              id="evidence"
              placeholder="Describe any evidence you have (screenshots, messages, etc.)..."
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitting || reason.length < 50}
            variant="destructive"
          >
            {submitting ? "Submitting..." : "Open Dispute"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DisputeDialog;
