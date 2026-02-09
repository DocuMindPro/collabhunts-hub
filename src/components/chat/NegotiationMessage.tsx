import { useState } from "react";
import { 
  Package, Calendar, Clock, DollarSign, MessageSquare, 
  CheckCircle, XCircle, ArrowLeftRight, FileText, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { EVENT_PACKAGES, type PackageType } from "@/config/packages";

export interface NegotiationData {
  type: "inquiry" | "counter_offer" | "accepted" | "declined";
  message_id: string;
  parent_message_id?: string;
  package_type: string;
  preferred_date?: string;
  preferred_time?: string;
  duration_hours?: number;
  proposed_budget_cents: number;
  notes?: string;
  status: "pending" | "accepted" | "declined" | "countered";
  // For counter offers
  previous_price_cents?: number;
}

interface NegotiationMessageProps {
  data: NegotiationData;
  isOwn: boolean;
  isCreator: boolean;
  onAccept?: () => void;
  onCounter?: () => void;
  onDecline?: () => void;
  onSendAgreement?: () => void;
  loading?: boolean;
}

const NegotiationMessage = ({
  data,
  isOwn,
  isCreator,
  onAccept,
  onCounter,
  onDecline,
  onSendAgreement,
  loading = false,
}: NegotiationMessageProps) => {
  const packageConfig = EVENT_PACKAGES[data.package_type as PackageType];
  const packageName = packageConfig?.name || data.package_type.replace(/_/g, " ");
  const price = (data.proposed_budget_cents / 100).toFixed(0);
  const isEventPackage = ["social_boost", "meet_greet", "competition"].includes(data.package_type);

  // Determine header label
  const getHeaderLabel = () => {
    if (data.type === "inquiry") return "📦 Package Inquiry";
    if (data.type === "counter_offer") return "↔️ Counter Offer";
    if (data.type === "accepted") return "✅ Accepted";
    if (data.type === "declined") return "❌ Declined";
    return "Negotiation";
  };

  // Determine status badge
  const getStatusBadge = () => {
    switch (data.status) {
      case "pending":
        return <Badge variant="outline" className="text-amber-600 border-amber-300">Awaiting Response</Badge>;
      case "accepted":
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Accepted</Badge>;
      case "declined":
        return <Badge variant="destructive">Declined</Badge>;
      case "countered":
        return <Badge variant="secondary">Countered</Badge>;
      default:
        return null;
    }
  };

  // Show actions if this is a pending message and user is the recipient
  const showActions = data.status === "pending" && !isOwn;
  
  // Send Agreement button removed - only brands can send agreements now
  const showSendAgreement = false;

  return (
    <Card className={`overflow-hidden ${isOwn ? "border-primary/30 bg-primary/5" : "border-border"}`}>
      {/* Header */}
      <div className={`px-3 py-2 border-b flex items-center justify-between ${
        isOwn ? "bg-primary/10" : "bg-muted"
      }`}>
        <span className="text-xs font-medium">{getHeaderLabel()}</span>
        {getStatusBadge()}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Package Info */}
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
            isOwn ? "bg-primary/20" : "bg-primary/10"
          }`}>
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{packageName}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              <span className="font-medium text-foreground">${price}</span>
              {data.previous_price_cents && data.previous_price_cents !== data.proposed_budget_cents && (
                <span className="line-through text-muted-foreground/60">
                  ${(data.previous_price_cents / 100).toFixed(0)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Event Details */}
        {isEventPackage && data.preferred_date && (
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{format(new Date(data.preferred_date), "MMM d, yyyy")}</span>
            </div>
            {data.preferred_time && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{data.preferred_time}</span>
              </div>
            )}
            {data.duration_hours && (
              <div className="flex items-center gap-1.5">
                <span>{data.duration_hours}h</span>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {data.notes && (
          <div className="flex items-start gap-2 bg-muted/50 rounded-md p-2.5">
            <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">{data.notes}</p>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="flex gap-2 pt-2 border-t">
            <Button
              size="sm"
              className="flex-1 gap-1.5"
              onClick={onAccept}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle className="h-3.5 w-3.5" />
              )}
              Accept ${price}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1.5"
              onClick={onCounter}
              disabled={loading}
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Counter
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5 text-destructive hover:text-destructive"
              onClick={onDecline}
              disabled={loading}
            >
              <XCircle className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* Send Agreement Button (for creator when inquiry/counter is accepted) */}
        {showSendAgreement && (
          <div className="pt-2 border-t">
            <Button
              size="sm"
              className="w-full gap-1.5"
              onClick={onSendAgreement}
              disabled={loading}
            >
              <FileText className="h-3.5 w-3.5" />
              Send Agreement
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default NegotiationMessage;
