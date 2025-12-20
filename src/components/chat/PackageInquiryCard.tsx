import { X, Send, Instagram, Youtube, Facebook, Video, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PackageData {
  service_type: string;
  price_cents: number;
  delivery_days: number;
}

interface PackageInquiryCardProps {
  packageData: PackageData;
  onSend: () => void;
  onDismiss: () => void;
}

const getServiceIcon = (serviceType: string) => {
  const type = serviceType.toLowerCase();
  if (type.includes('instagram')) return Instagram;
  if (type.includes('youtube')) return Youtube;
  if (type.includes('facebook')) return Facebook;
  if (type.includes('tiktok') || type.includes('video') || type.includes('reel')) return Video;
  return Package;
};

const formatServiceType = (serviceType: string) => {
  return serviceType
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const PackageInquiryCard = ({ packageData, onSend, onDismiss }: PackageInquiryCardProps) => {
  const Icon = getServiceIcon(packageData.service_type);
  const price = (packageData.price_cents / 100).toFixed(2);
  const deliveryDays = packageData.delivery_days;
  const serviceName = formatServiceType(packageData.service_type);

  return (
    <Card className="mx-4 mb-2 border-primary/20 bg-primary/5 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-primary/10 border-b border-primary/20">
        <span className="text-xs font-medium text-primary">Inquire about this package</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-muted-foreground hover:text-foreground"
          onClick={onDismiss}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      <div className="p-3 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{serviceName}</p>
          <p className="text-xs text-muted-foreground">
            ${price} • {deliveryDays} day{deliveryDays !== 1 ? 's' : ''} delivery
          </p>
        </div>
        <Button 
          size="sm" 
          onClick={onSend}
          className="flex-shrink-0 gap-1.5"
        >
          <Send className="h-3.5 w-3.5" />
          Send
        </Button>
      </div>
    </Card>
  );
};

export default PackageInquiryCard;
