import { X, Send, Package, MapPin, Zap, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EVENT_PACKAGES, type PackageType } from "@/config/packages";

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

// Package type icons based on our event model
const getServiceIcon = (serviceType: string) => {
  switch (serviceType) {
    case 'unbox_review':
      return Gift;
    case 'social_boost':
    case 'meet_greet':
      return MapPin;
    case 'competition':
    case 'custom':
      return Zap;
    default:
      return Package;
  }
};

const PackageInquiryCard = ({ packageData, onSend, onDismiss }: PackageInquiryCardProps) => {
  const Icon = getServiceIcon(packageData.service_type);
  const packageConfig = EVENT_PACKAGES[packageData.service_type as PackageType];
  const serviceName = packageConfig?.name || packageData.service_type.replace(/_/g, ' ');
  const price = (packageData.price_cents / 100).toFixed(0);
  
  // Determine what secondary info to show
  const isHomePackage = packageData.service_type === 'unbox_review';
  const isEventPackage = ['social_boost', 'meet_greet'].includes(packageData.service_type);
  const isConsultation = ['competition', 'custom'].includes(packageData.service_type);
  
  let secondaryInfo = '';
  if (isConsultation) {
    secondaryInfo = 'Managed Event';
  } else if (isEventPackage && packageConfig?.durationRange) {
    secondaryInfo = `${packageConfig.durationRange.min}-${packageConfig.durationRange.max} hrs`;
  } else if (isHomePackage && packageData.delivery_days > 0) {
    secondaryInfo = `${packageData.delivery_days} day delivery`;
  }

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
            {isConsultation ? 'Contact for quote' : `$${price}`}
            {secondaryInfo && ` • ${secondaryInfo}`}
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
