import { useState } from "react";
import { Package, Calendar, Clock, DollarSign, MessageSquare, CheckCircle, XCircle, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { EVENT_PACKAGES, type PackageType } from "@/config/packages";
import { type NegotiationData } from "./NegotiationMessage";

interface PackageInquiryMessageProps {
  content: string;
  isOwn: boolean;
  messageId: string;
  negotiationStatus?: string | null;
  onAccept?: (data: NegotiationData) => void;
  onCounter?: (data: NegotiationData) => void;
  onDecline?: (data: NegotiationData) => void;
  loading?: boolean;
}

// Legacy pattern for backwards compatibility
const LEGACY_PATTERN = /^Hi! I'm interested in your "([^"]+)" package \(\$([0-9.]+), (\d+) days? delivery\)\. I'd like to discuss the details before we proceed\.$/;

export const isPackageInquiry = (content: string): boolean => {
  // Check for new JSON format
  try {
    const parsed = JSON.parse(content);
    return parsed.type === "inquiry" || parsed.type === "counter_offer";
  } catch {
    // Check for legacy text format
    return LEGACY_PATTERN.test(content);
  }
};

export const parsePackageInquiry = (content: string, messageId: string): NegotiationData | null => {
  // Try new JSON format first
  try {
    const parsed = JSON.parse(content);
    if (parsed.type === "inquiry" || parsed.type === "counter_offer") {
      return {
        ...parsed,
        message_id: messageId,
      };
    }
  } catch {
    // Try legacy text format
    const match = content.match(LEGACY_PATTERN);
    if (match) {
      // Convert legacy format to NegotiationData
      const serviceType = match[1].toLowerCase().replace(/\s+/g, '_');
      return {
        type: "inquiry",
        message_id: messageId,
        package_type: serviceType,
        proposed_budget_cents: Math.round(parseFloat(match[2]) * 100),
        status: "pending",
      };
    }
  }
  return null;
};

const PackageInquiryMessage = ({ 
  content, 
  isOwn, 
  messageId,
  negotiationStatus,
  onAccept, 
  onCounter, 
  onDecline,
  loading = false 
}: PackageInquiryMessageProps) => {
  const data = parsePackageInquiry(content, messageId);
  
  if (!data) return null;

  const packageConfig = EVENT_PACKAGES[data.package_type as PackageType];
  const packageName = packageConfig?.name || data.package_type.replace(/_/g, " ");
  const price = (data.proposed_budget_cents / 100).toFixed(0);
  const isEventPackage = ["social_boost", "meet_greet", "competition"].includes(data.package_type);

  // Determine actual status from negotiationStatus column or data
  const effectiveStatus = negotiationStatus || data.status || "pending";

  // Show actions if pending and user is recipient (not sender)
  const showActions = effectiveStatus === "pending" && !isOwn && (onAccept || onCounter || onDecline);

  // Determine header based on type
  const getHeader = () => {
    if (data.type === "counter_offer") return "↔️ Counter Offer";
    return "📦 Package Inquiry";
  };

  // Determine status badge
  const getStatusBadge = () => {
    switch (effectiveStatus) {
      case "pending":
        return <Badge variant="outline" className="text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-600">Awaiting Response</Badge>;
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

  return (
    <Card className={`overflow-hidden ${isOwn ? "border-primary/30 bg-primary/5" : "border-border"}`}>
      {/* Header */}
      <div className={`px-3 py-2 border-b flex items-center justify-between ${
        isOwn ? "bg-primary/10" : "bg-muted"
      }`}>
        <span className="text-xs font-medium">{getHeader()}</span>
        {getStatusBadge()}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2.5">
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
                <span className="line-through opacity-60">
                  ${(data.previous_price_cents / 100).toFixed(0)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Event Details */}
        {isEventPackage && data.preferred_date && (
          <div className="flex flex-wrap gap-2.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{format(new Date(data.preferred_date), "MMM d, yyyy")}</span>
            </div>
            {data.preferred_time && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{data.preferred_time}</span>
              </div>
            )}
            {data.duration_hours && (
              <span>• {data.duration_hours}h</span>
            )}
          </div>
        )}

        {/* Notes */}
        {data.notes && (
          <div className="flex items-start gap-2 bg-muted/50 rounded-md p-2">
            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">{data.notes}</p>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="flex gap-2 pt-2 border-t">
            <Button
              size="sm"
              className="flex-1 gap-1 h-8"
              onClick={() => onAccept?.(data)}
              disabled={loading}
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Accept ${price}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1 h-8"
              onClick={() => onCounter?.(data)}
              disabled={loading}
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Counter
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="gap-1 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDecline?.(data)}
              disabled={loading}
            >
              <XCircle className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PackageInquiryMessage;
