import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Clock, CheckCircle } from "lucide-react";

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
}

const BookingDialog = ({ isOpen, onClose, service, creatorProfileId }: BookingDialogProps) => {
  if (!service) return null;

  const serviceName = service.service_type.replace(/_/g, " ");
  const price = (service.price_cents / 100).toFixed(2);
  
  const emailSubject = encodeURIComponent(`Booking Request: ${serviceName}`);
  const emailBody = encodeURIComponent(
    `Hi CollabHunts Team,\n\nI'd like to book the following service:\n\n` +
    `• Service: ${serviceName}\n` +
    `• Listed Price: $${price}\n` +
    `• Estimated Delivery: ${service.delivery_days} days\n` +
    `• Creator ID: ${creatorProfileId}\n\n` +
    `Please contact me to discuss the details and next steps.\n\n` +
    `Thank you!`
  );

  const handleEmailClick = () => {
    window.location.href = `mailto:care@collabhunts.com?subject=${emailSubject}&body=${emailBody}`;
    onClose();
  };

  const handleContactPage = () => {
    window.location.href = `/contact?subject=${encodeURIComponent(`Booking Request: ${serviceName}`)}`;
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book {serviceName}</DialogTitle>
          <DialogDescription>
            Contact our team to arrange this collaboration
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

          {/* How It Works */}
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h4 className="font-medium text-sm mb-3">How It Works</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Contact us with your project requirements</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>We coordinate with the creator and finalize terms</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Make payment securely to CollabHunts</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Receive your content—we handle everything</span>
              </div>
            </div>
          </div>

          {/* Contact Options */}
          <div className="space-y-2">
            <Button onClick={handleEmailClick} className="w-full gradient-hero hover:opacity-90 gap-2">
              <Mail className="h-4 w-4" />
              Email Us to Book
            </Button>
            <Button variant="outline" onClick={handleContactPage} className="w-full gap-2">
              <Phone className="h-4 w-4" />
              Use Contact Form
            </Button>
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