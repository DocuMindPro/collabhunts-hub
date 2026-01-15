import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, Clock, CheckCircle, MessageSquare, Crown, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentPlanType } from "@/lib/subscription-utils";
import { useNavigate } from "react-router-dom";

interface BookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  service: {
    id: string;
    service_type: string;
    price_cents: number;
    delivery_days: number;
  } | null;
  creatorProfileId: string;
  creatorName?: string;
}

const BookingDialog = ({ isOpen, onClose, service, creatorProfileId, creatorName }: BookingDialogProps) => {
  const navigate = useNavigate();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkSubscription = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUserId(session.user.id);
        const planType = await getCurrentPlanType(session.user.id);
        // Basic, Pro, or Premium can message creators directly
        setIsSubscribed(planType !== 'none');
      } else {
        setIsSubscribed(false);
        setUserId(null);
      }
      setIsLoading(false);
    };

    if (isOpen) {
      checkSubscription();
    }
  }, [isOpen]);

  if (!service) return null;

  const serviceName = service.service_type.replace(/_/g, " ");
  const price = (service.price_cents / 100).toFixed(2);
  
  const emailSubject = encodeURIComponent(`Managed Booking Request: ${serviceName}`);
  const emailBody = encodeURIComponent(
    `Hi CollabHunts Team,\n\nI'd like CollabHunts to manage this collaboration for me:\n\n` +
    `• Creator: ${creatorName || 'Creator'}\n` +
    `• Service: ${serviceName}\n` +
    `• Listed Price: $${price}\n` +
    `• Estimated Delivery: ${service.delivery_days} days\n` +
    `• Creator ID: ${creatorProfileId}\n\n` +
    `Please contact me to discuss the service fee and next steps.\n\n` +
    `Thank you!`
  );

  const handleManagedBooking = () => {
    window.location.href = `mailto:care@collabhunts.com?subject=${emailSubject}&body=${emailBody}`;
    onClose();
  };

  const handleContactPage = () => {
    window.location.href = `/contact?subject=${encodeURIComponent(`Managed Booking Request: ${serviceName}`)}`;
    onClose();
  };

  const handleDirectMessage = () => {
    // Navigate to brand dashboard messages with creator pre-selected
    navigate(`/brand-dashboard?tab=messages&creator=${creatorProfileId}&package=${service.id}&price=${price}`);
    onClose();
  };

  const handleUpgrade = () => {
    navigate('/pricing');
    onClose();
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Book {serviceName}</DialogTitle>
          <DialogDescription>
            Choose how you'd like to proceed with this collaboration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Service Details */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Service:</span>
              <span className="font-medium capitalize">{serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Starting at:</span>
              <span className="font-medium">${price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Est. Delivery:</span>
              <span className="font-medium">{service.delivery_days} days</span>
            </div>
          </div>

          {/* Two Options */}
          <div className="grid gap-4">
            {/* Option 1: Direct Contact (Subscribers Only) */}
            <Card className={`relative ${isSubscribed ? 'border-primary' : 'border-muted opacity-75'}`}>
              {isSubscribed && (
                <div className="absolute -top-2 left-4 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded">
                  Your Plan Includes This
                </div>
              )}
              <CardContent className="p-4 pt-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Message Creator Directly</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Contact the creator yourself, negotiate terms, and arrange payment directly.
                    </p>
                    {isSubscribed ? (
                      <Button onClick={handleDirectMessage} className="w-full gradient-hero hover:opacity-90 gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Start Conversation
                      </Button>
                    ) : (
                      <Button onClick={handleUpgrade} variant="outline" className="w-full gap-2">
                        <Crown className="h-4 w-4" />
                        Subscribe to Unlock
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Option 2: Managed Service (Available to All) */}
            <Card className="border-accent/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Let CollabHunts Handle It</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      We'll coordinate with the creator, manage the project, and handle all payments. Service fee applies.
                    </p>
                    <div className="space-y-2">
                      <Button onClick={handleManagedBooking} variant="outline" className="w-full gap-2">
                        <Mail className="h-4 w-4" />
                        Email Us to Book
                      </Button>
                      <Button variant="ghost" onClick={handleContactPage} className="w-full gap-2 text-sm">
                        <Phone className="h-4 w-4" />
                        Use Contact Form
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* How Managed Service Works */}
          <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              How Managed Service Works
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="text-primary font-medium">1.</span>
                <span>Contact us with your project requirements</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-medium">2.</span>
                <span>We'll provide a quote including our service fee</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-medium">3.</span>
                <span>We coordinate with the creator and manage the project</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-medium">4.</span>
                <span>Receive your content—we handle everything</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            <Clock className="h-3 w-3 inline mr-1" />
            We typically respond within 24 hours
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
