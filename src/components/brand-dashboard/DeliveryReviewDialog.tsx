import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Download, 
  CheckCircle, 
  RotateCcw, 
  Loader2, 
  FileVideo, 
  FileImage,
  ExternalLink,
  Archive,
  AlertTriangle
} from "lucide-react";

interface Deliverable {
  id: string;
  file_name: string;
  file_type: string;
  mime_type: string;
  file_size_bytes: number;
  r2_key: string;
  description: string | null;
  version: number;
  created_at: string;
}

interface DeliveryReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  creatorName: string;
  creatorProfileId: string;
  revisionCount: number;
  totalPrice: number;
  onReviewComplete: () => void;
}

const DeliveryReviewDialog = ({
  open,
  onOpenChange,
  bookingId,
  creatorName,
  creatorProfileId,
  revisionCount,
  totalPrice,
  onReviewComplete,
}: DeliveryReviewDialogProps) => {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [processing, setProcessing] = useState(false);

  const r2PublicUrl = import.meta.env.VITE_R2_PUBLIC_URL || "https://pub-8e40ee1af298451eb91691f88d6fc102.r2.dev";
  const maxRevisions = 2;

  useEffect(() => {
    if (open) {
      fetchDeliverables();
    }
  }, [open, bookingId]);

  const fetchDeliverables = async () => {
    try {
      const { data, error } = await supabase
        .from("booking_deliverables")
        .select("*")
        .eq("booking_id", bookingId)
        .order("version", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDeliverables(data || []);
    } catch (error) {
      console.error("Error fetching deliverables:", error);
      toast.error("Failed to load deliverables");
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileUrl = (r2Key: string) => {
    return `${r2PublicUrl}/${r2Key}`;
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({
          delivery_status: "confirmed",
          confirmed_at: new Date().toISOString(),
          payment_status: "paid", // Release payment
        })
        .eq("id", bookingId);

      if (error) throw error;

      toast.success("Delivery approved! Payment released to creator.");
      onReviewComplete();
      onOpenChange(false);
    } catch (error) {
      console.error("Error approving delivery:", error);
      toast.error("Failed to approve delivery");
    } finally {
      setProcessing(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionNotes.trim()) {
      toast.error("Please provide details about what changes you need");
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({
          delivery_status: "revision_requested",
          revision_count: revisionCount + 1,
          revision_notes: revisionNotes,
        })
        .eq("id", bookingId);

      if (error) throw error;

      toast.success("Revision request sent to creator");
      setRevisionNotes("");
      setShowRevisionForm(false);
      onReviewComplete();
      onOpenChange(false);
    } catch (error) {
      console.error("Error requesting revision:", error);
      toast.error("Failed to request revision");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadAll = async () => {
    deliverables.forEach((d, i) => {
      setTimeout(() => {
        const link = document.createElement("a");
        link.href = getFileUrl(d.r2_key);
        link.download = d.file_name;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, i * 500);
    });
    toast.success("Downloading files...");
  };

  const latestVersion = deliverables.length > 0 ? Math.max(...deliverables.map(d => d.version)) : 0;
  const latestDeliverables = deliverables.filter(d => d.version === latestVersion);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5 text-primary" />
            Review Deliverables
          </DialogTitle>
          <DialogDescription>
            {creatorName} has submitted their work. Review and approve to release payment.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : deliverables.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No deliverables found
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Payment Info */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Collaboration value</p>
                  <p className="text-2xl font-bold">${(totalPrice / 100).toFixed(2)}</p>
                </div>
                <Badge variant="outline" className="gap-1">
                  Version {latestVersion}
                  {revisionCount > 0 && ` (Revision ${revisionCount})`}
                </Badge>
              </div>
            </div>

            {/* Deliverables Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{latestDeliverables.length} file(s)</p>
                <Button variant="outline" size="sm" onClick={handleDownloadAll} className="gap-2">
                  <Download className="h-4 w-4" />
                  Download All
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {latestDeliverables.map((deliverable) => (
                  <div
                    key={deliverable.id}
                    className="group relative aspect-video bg-muted rounded-lg overflow-hidden border"
                  >
                    {deliverable.file_type === "video" ? (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <FileVideo className="h-10 w-10 text-muted-foreground" />
                      </div>
                    ) : (
                      <img
                        src={getFileUrl(deliverable.r2_key)}
                        alt={deliverable.file_name}
                        className="w-full h-full object-cover"
                      />
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                      <p className="text-xs text-white text-center truncate w-full">
                        {deliverable.file_name}
                      </p>
                      <p className="text-xs text-white/70">
                        {formatFileSize(deliverable.file_size_bytes)}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-7 gap-1"
                          onClick={() => window.open(getFileUrl(deliverable.r2_key), "_blank")}
                        >
                          <ExternalLink className="h-3 w-3" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-7 gap-1"
                          asChild
                        >
                          <a href={getFileUrl(deliverable.r2_key)} download={deliverable.file_name}>
                            <Download className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Creator Notes */}
            {latestDeliverables[0]?.description && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Notes from creator:</p>
                <p className="text-sm">{latestDeliverables[0].description}</p>
              </div>
            )}

            {/* Revision Form */}
            {showRevisionForm && (
              <div className="p-4 border border-yellow-500/30 bg-yellow-500/5 rounded-lg space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-600 dark:text-yellow-400">
                      Request Revision ({revisionCount + 1}/{maxRevisions})
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Describe what changes you need. Be specific and clear.
                    </p>
                  </div>
                </div>
                <Textarea
                  placeholder="Please describe the changes you need..."
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {revisionNotes.length}/500 characters
                </p>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowRevisionForm(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRequestRevision}
                    disabled={!revisionNotes.trim() || processing}
                    className="gap-2"
                  >
                    {processing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RotateCcw className="h-4 w-4" />
                    )}
                    Send Request
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!showRevisionForm && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowRevisionForm(true)}
                disabled={revisionCount >= maxRevisions || processing}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Request Revision
                {revisionCount >= maxRevisions && " (limit reached)"}
              </Button>
              <Button
                onClick={handleApprove}
                disabled={processing || deliverables.length === 0}
                className="gap-2"
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Approve & Release ${(totalPrice / 100).toFixed(2)}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeliveryReviewDialog;
