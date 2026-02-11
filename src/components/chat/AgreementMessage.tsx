import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Check, X, Loader2, Calendar, DollarSign, Eye, CheckCircle2, Star } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AGREEMENT_TEMPLATES } from "@/config/agreement-templates";
import { ReviewDialog } from "@/components/ReviewDialog";

interface AgreementMessageProps {
  messageContent: {
    agreement_id: string;
    template_type: string;
    template_name: string;
    price_cents: number;
    event_date?: string;
    deliverables_count: number;
  };
  isOwnMessage: boolean;
  onAgreementUpdated?: () => void;
}

interface Agreement {
  id: string;
  template_type: string;
  content: string;
  deliverables: { description: string; quantity: number }[];
  proposed_price_cents: number;
  event_date: string | null;
  event_time: string | null;
  duration_hours: number | null;
  status: string;
  confirmed_at: string | null;
  declined_at: string | null;
  creator_profile_id: string;
  brand_profile_id: string;
}

const AgreementMessage = ({ messageContent, isOwnMessage, onAgreementUpdated }: AgreementMessageProps) => {
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [existingReview, setExistingReview] = useState<{ id: string; rating: number; review_text: string | null } | undefined>();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [creatorDisplayName, setCreatorDisplayName] = useState("");

  useEffect(() => {
    fetchAgreement();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });
  }, [messageContent.agreement_id]);

  const fetchAgreement = async () => {
    try {
      const { data, error } = await supabase
        .from("creator_agreements")
        .select("*")
        .eq("id", messageContent.agreement_id)
        .single();

      if (error) throw error;
      if (data) {
        setAgreement({
          ...data,
          deliverables: (data.deliverables as { description: string; quantity: number }[]) || [],
        });

        // Fetch creator name for review dialog
        const { data: creator } = await supabase
          .from("creator_profiles")
          .select("display_name")
          .eq("id", data.creator_profile_id)
          .maybeSingle();
        if (creator) setCreatorDisplayName(creator.display_name);

        // Check for existing review on this agreement
        const { data: review } = await supabase
          .from("reviews")
          .select("id, rating, review_text")
          .eq("agreement_id", data.id)
          .eq("brand_profile_id", data.brand_profile_id)
          .maybeSingle();
        if (review) setExistingReview(review);
      }
    } catch (error) {
      console.error("Error fetching agreement:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("creator_agreements")
        .update({
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
        })
        .eq("id", messageContent.agreement_id);

      if (error) throw error;

      // Send a confirmation message
      const { data: { user } } = await supabase.auth.getUser();
      if (user && agreement) {
        await supabase.from("messages").insert({
          conversation_id: (await supabase
            .from("creator_agreements")
            .select("conversation_id")
            .eq("id", messageContent.agreement_id)
            .single()).data?.conversation_id,
          sender_id: user.id,
          content: `✅ Agreement confirmed! I've agreed to the ${messageContent.template_name} for $${(messageContent.price_cents / 100).toFixed(2)}. Please arrange payment directly.`,
          message_type: "text",
        });
      }

      toast.success("Agreement confirmed!");
      setShowConfirmDialog(false);
      fetchAgreement();
      onAgreementUpdated?.();
    } catch (error: any) {
      console.error("Error confirming agreement:", error);
      toast.error(error.message || "Failed to confirm agreement");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("creator_agreements")
        .update({
          status: 'declined',
          declined_at: new Date().toISOString(),
        })
        .eq("id", messageContent.agreement_id);

      if (error) throw error;

      toast.info("Agreement declined");
      fetchAgreement();
      onAgreementUpdated?.();
    } catch (error: any) {
      console.error("Error declining agreement:", error);
      toast.error(error.message || "Failed to decline agreement");
    } finally {
      setActionLoading(false);
    }
  };

  const canReview = () => {
    if (!agreement || agreement.status !== 'confirmed' || !agreement.confirmed_at) return false;
    // Only the brand (who sent the agreement = isOwnMessage) can review
    if (!isOwnMessage) return false;
    const eventPassed = agreement.event_date ? new Date(agreement.event_date) < new Date() : false;
    const sevenDaysPassed = new Date(agreement.confirmed_at).getTime() + 7 * 24 * 60 * 60 * 1000 < Date.now();
    return eventPassed || sevenDaysPassed;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending Response</Badge>;
      case 'confirmed':
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Confirmed</Badge>;
      case 'declined':
        return <Badge variant="destructive">Declined</Badge>;
      case 'completed':
        return <Badge className="bg-primary/20 text-primary">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const template = AGREEMENT_TEMPLATES[messageContent.template_type as keyof typeof AGREEMENT_TEMPLATES];

  if (loading) {
    return (
      <Card className="p-4 max-w-sm">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading agreement...</span>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className={`p-4 max-w-sm ${isOwnMessage ? 'bg-primary/5' : 'bg-muted/50'}`}>
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{template?.icon || '📄'}</span>
              <div>
                <p className="font-medium text-sm">{messageContent.template_name}</p>
                <p className="text-xs text-muted-foreground">Agreement Proposal</p>
              </div>
            </div>
            {agreement && getStatusBadge(agreement.status)}
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5" />
              <span>${(messageContent.price_cents / 100).toFixed(2)}</span>
            </div>
            {messageContent.event_date && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{format(new Date(messageContent.event_date), "MMM d, yyyy")}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{messageContent.deliverables_count} deliverables</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(true)}
              className="flex-1"
            >
              <Eye className="h-3.5 w-3.5 mr-1" />
              View Details
            </Button>
            
            {!isOwnMessage && agreement?.status === 'pending' && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={actionLoading}
                  className="flex-1"
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Confirm
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDecline}
                  disabled={actionLoading}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </>
            )}

            {canReview() && (
              <Button
                variant={existingReview ? "ghost" : "outline"}
                size="sm"
                onClick={() => setShowReviewDialog(true)}
                className="flex-1"
              >
                <Star className={`h-3.5 w-3.5 mr-1 ${existingReview ? "fill-primary text-primary" : ""}`} />
                {existingReview ? `${existingReview.rating}★ Edit` : "Leave Review"}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-lg max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-xl">{template?.icon || '📄'}</span>
              {messageContent.template_name}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {agreement && (
              <div className="space-y-4">
                {/* Status */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  {getStatusBadge(agreement.status)}
                </div>

                {/* Price & Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Proposed Price</span>
                    <p className="font-semibold text-lg">${(agreement.proposed_price_cents / 100).toFixed(2)}</p>
                  </div>
                  {agreement.event_date && (
                    <div>
                      <span className="text-sm text-muted-foreground">Event Date</span>
                      <p className="font-medium">{format(new Date(agreement.event_date), "PPP")}</p>
                      {agreement.event_time && (
                        <p className="text-sm text-muted-foreground">at {agreement.event_time}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Deliverables */}
                {agreement.deliverables && agreement.deliverables.length > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground">Deliverables</span>
                    <ul className="mt-2 space-y-1">
                      {agreement.deliverables.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          <span>{item.description}</span>
                          {item.quantity > 1 && (
                            <Badge variant="secondary" className="text-xs">x{item.quantity}</Badge>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Content */}
                <div>
                  <span className="text-sm text-muted-foreground">Agreement Terms</span>
                  <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm font-sans">{agreement.content}</pre>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Agreement</DialogTitle>
            <DialogDescription>
              By confirming, you agree to the terms outlined in this agreement. Payment will be arranged directly between you and the creator.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service:</span>
                <span className="font-medium">{messageContent.template_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Agreed Price:</span>
                <span className="font-medium">${(messageContent.price_cents / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={actionLoading}>
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Confirm Agreement
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {agreement && (
        <ReviewDialog
          open={showReviewDialog}
          onOpenChange={setShowReviewDialog}
          agreementId={agreement.id}
          creatorName={creatorDisplayName || "Creator"}
          creatorProfileId={agreement.creator_profile_id}
          brandProfileId={agreement.brand_profile_id}
          existingReview={existingReview}
        />
      )}
    </>
  );
};

export default AgreementMessage;
