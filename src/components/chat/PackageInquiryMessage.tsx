import { Instagram, Youtube, Facebook, Video, Package } from "lucide-react";

interface PackageInquiryMessageProps {
  content: string;
  isOwn: boolean;
}

const PACKAGE_INQUIRY_PATTERN = /^Hi! I'm interested in your "([^"]+)" package \(\$([0-9.]+), (\d+) days? delivery\)\. I'd like to discuss the details before we proceed\.$/;

export const isPackageInquiry = (content: string): boolean => {
  return PACKAGE_INQUIRY_PATTERN.test(content);
};

export const parsePackageInquiry = (content: string) => {
  const match = content.match(PACKAGE_INQUIRY_PATTERN);
  if (!match) return null;
  
  return {
    serviceType: match[1],
    price: match[2],
    deliveryDays: parseInt(match[3], 10)
  };
};

const getServiceIcon = (serviceType: string) => {
  const type = serviceType.toLowerCase();
  if (type.includes('instagram')) return Instagram;
  if (type.includes('youtube')) return Youtube;
  if (type.includes('facebook')) return Facebook;
  if (type.includes('tiktok') || type.includes('video') || type.includes('reel')) return Video;
  return Package;
};

const PackageInquiryMessage = ({ content, isOwn }: PackageInquiryMessageProps) => {
  const packageData = parsePackageInquiry(content);
  
  if (!packageData) return null;

  const Icon = getServiceIcon(packageData.serviceType);

  return (
    <div className={`rounded-lg overflow-hidden ${isOwn ? 'bg-primary/90' : 'bg-card border'}`}>
      {/* Header */}
      <div className={`px-3 py-1.5 text-xs font-medium ${
        isOwn ? 'bg-primary-foreground/10 text-primary-foreground' : 'bg-muted text-muted-foreground'
      }`}>
        📦 Package Inquiry
      </div>
      
      {/* Content */}
      <div className="p-3 flex items-center gap-3">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isOwn ? 'bg-primary-foreground/20' : 'bg-primary/10'
        }`}>
          <Icon className={`h-5 w-5 ${isOwn ? 'text-primary-foreground' : 'text-primary'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm truncate ${isOwn ? 'text-primary-foreground' : ''}`}>
            {packageData.serviceType}
          </p>
          <p className={`text-xs ${isOwn ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
            ${packageData.price} • {packageData.deliveryDays} day{packageData.deliveryDays !== 1 ? 's' : ''} delivery
          </p>
        </div>
      </div>
      
      {/* Footer message */}
      <div className={`px-3 pb-3 text-xs ${isOwn ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
        {isOwn ? "You inquired about this package" : "Interested in discussing this package"}
      </div>
    </div>
  );
};

export default PackageInquiryMessage;
