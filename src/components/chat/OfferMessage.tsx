import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Calendar, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  XCircle,
  Loader2,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { EVENT_PACKAGES, type PackageType, calculateDeposit } from "@/config/packages";
import AcceptOfferDialog from "./AcceptOfferDialog";

export interface OfferData {
  type: "offer";
  offer_id: string;
  package_type: string;
  package_name: string;
  price_cents: number;
  deposit_cents: number;
  event_date: string | null;
  event_time: string | null;
  duration_hours: number | null;
  notes: string | null;
  status?: "pending" | "accepted" | "declined" | "expired";
}

interface OfferMessageProps {
  content: string;
  isOwn: boolean;
  conversationId: string;
  onOfferAccepted?: () => void;
  offerStatus?: string;
}

export const isOfferMessage = (content: string): boolean => {
  try {
    const parsed = JSON.parse(content);
    return parsed.type === "offer";
  } catch {
    return false;
  }
};

export const parseOfferData = (content: string): OfferData | null => {
  try {
    const parsed = JSON.parse(content);
    if (parsed.type === "offer") {
      return parsed as OfferData;
    }
    return null;
  } catch {
    return null;
  }
};

const OfferMessage = ({ 
  content, 
  isOwn, 
  conversationId,
  onOfferAccepted,
  offerStatus 
}: OfferMessageProps) => {
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const offerData = parseOfferData(content);

  if (!offerData) return null;

  const pkg = EVENT_PACKAGES[offerData.package_type as PackageType];
  const isEventPackage = ['social_boost', 'meet_greet', 'competition'].includes(offerData.package_type);
  const status = offerStatus || offerData.status || "pending";

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusBadge = () => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-500">Accepted</Badge>;
      case "declined":
        return <Badge variant="destructive">Declined</Badge>;
      case "expired":
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge variant="outline" className="bg-primary/10 text-primary">Pending</Badge>;
    }
  };

  return (
    <>
      <Card className={`max-w-sm ${isOwn ? 'ml-auto' : ''} overflow-hidden`}>
        {/* Header */}
        <div className="bg-primary/10 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Offer</span>
          </div>
          {getStatusBadge()}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Package Name */}
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">{offerData.package_name || pkg?.name}</p>
              {pkg?.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{pkg.description}</p>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-bold text-lg">${(offerData.price_cents / 100).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                Deposit: ${(offerData.deposit_cents / 100).toFixed(2)} (50%)
              </p>
            </div>
          </div>

          {/* Event Details */}
          {isEventPackage && offerData.event_date && (
            <>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm">
                  {format(new Date(offerData.event_date), "EEEE, MMMM d, yyyy")}
                </p>
              </div>
              {offerData.event_time && (
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm">
                    {formatTime(offerData.event_time)}
                    {offerData.duration_hours && ` (${offerData.duration_hours} hour${offerData.duration_hours > 1 ? 's' : ''})`}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Notes */}
          {offerData.notes && (
            <div className="bg-muted/50 rounded-md p-3">
              <p className="text-sm text-muted-foreground">{offerData.notes}</p>
            </div>
          )}

          {/* Actions (only for brand, when pending) */}
          {!isOwn && status === "pending" && (
            <div className="pt-2">
              <Button 
                className="w-full" 
                onClick={() => setShowAcceptDialog(true)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept & Pay Deposit (${(offerData.deposit_cents / 100).toFixed(2)})
              </Button>
            </div>
          )}

          {/* Status Messages */}
          {status === "accepted" && (
            <div className="flex items-center gap-2 text-green-600 pt-2">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Offer accepted! Booking created.</span>
            </div>
          )}

          {status === "declined" && (
            <div className="flex items-center gap-2 text-destructive pt-2">
              <XCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Offer declined</span>
            </div>
          )}
        </div>
      </Card>

      {/* Accept Dialog */}
      <AcceptOfferDialog
        open={showAcceptDialog}
        onOpenChange={setShowAcceptDialog}
        offerData={offerData}
        conversationId={conversationId}
        onSuccess={() => {
          setShowAcceptDialog(false);
          onOfferAccepted?.();
        }}
      />
    </>
  );
};

export default OfferMessage;
