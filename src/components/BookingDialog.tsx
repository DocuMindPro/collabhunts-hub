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
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Phone, Clock, MessageSquare, Zap, Package, MapPin, Users, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { EVENT_PACKAGES, type PackageType } from "@/config/packages";

interface BookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  service: {
    id: string;
    service_type: string;
    price_cents: number;
    delivery_days: number;
    story_upsell_price_cents?: number | null;
  } | null;
  creatorProfileId: string;
  creatorName?: string;
}

// Package type classification
const CONSULTATION_PACKAGES = ['competition', 'custom'];
const EVENT_PACKAGES_LIST = ['social_boost', 'meet_greet'];
const HOME_PACKAGES = ['unbox_review'];

const BookingDialog = ({ isOpen, onClose, service, creatorProfileId, creatorName }: BookingDialogProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [hasBrandProfile, setHasBrandProfile] = useState(false);
  const [includeStories, setIncludeStories] = useState(false);

  useEffect(() => {
    const checkBrandProfile = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: brandProfile } = await supabase
          .from('brand_profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        setHasBrandProfile(!!brandProfile);
      } else {
        setHasBrandProfile(false);
      }
      setIsLoading(false);
    };

    if (isOpen) {
      checkBrandProfile();
      setIncludeStories(false); // Reset on open
    }
  }, [isOpen]);

  if (!service) return null;

  // Determine package type
  const serviceType = service.service_type;
  const requiresConsultation = CONSULTATION_PACKAGES.includes(serviceType);
  const isEventPackage = EVENT_PACKAGES_LIST.includes(serviceType);
  const isHomePackage = HOME_PACKAGES.includes(serviceType);
  
  // Get package config from our central config
  const packageConfig = EVENT_PACKAGES[serviceType as PackageType];
  
  // Check if stories upsell is available
  const hasStoriesUpsell = service.story_upsell_price_cents && service.story_upsell_price_cents > 0;
  const storiesPrice = hasStoriesUpsell ? (service.story_upsell_price_cents! / 100).toFixed(0) : "0";
  
  const serviceName = packageConfig?.name || service.service_type.replace(/_/g, " ");
  const basePrice = service.price_cents / 100;
  const totalPrice = includeStories && hasStoriesUpsell 
    ? basePrice + (service.story_upsell_price_cents! / 100) 
    : basePrice;
  const price = totalPrice.toFixed(0);
  
  // Email content for managed events
  const emailSubject = encodeURIComponent(`Managed Event Inquiry: ${serviceName}`);
  const emailBody = encodeURIComponent(
    `Hi CollabHunts Team,\n\nI'm interested in booking a ${serviceName} with this creator:\n\n` +
    `• Creator: ${creatorName || 'Creator'}\n` +
    `• Package: ${serviceName}\n` +
    `• Creator ID: ${creatorProfileId}\n\n` +
    `Please contact me to discuss event details and pricing.\n\n` +
    `Thank you!`
  );

  const handleManagedBooking = () => {
    window.location.href = `mailto:care@collabhunts.com?subject=${emailSubject}&body=${emailBody}`;
    onClose();
  };

  const handleContactPage = () => {
    window.location.href = `/contact?subject=${encodeURIComponent(`Managed Event Inquiry: ${serviceName}`)}`;
    onClose();
  };

  const handleDirectMessage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Login Required",
          description: "Please login to message creators",
          variant: "destructive"
        });
        navigate("/login");
        onClose();
        return;
      }

      // Get brand profile
      const { data: brandProfile } = await supabase
        .from("brand_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!brandProfile) {
        toast({
          title: "Brand Profile Required",
          description: "Please create a brand profile to message creators",
          variant: "destructive"
        });
        navigate("/brand-signup");
        onClose();
        return;
      }

      // Build package context for messages
      const packageData = encodeURIComponent(JSON.stringify({
        service_type: service.service_type,
        price_cents: service.price_cents,
        delivery_days: service.delivery_days,
        creator_name: creatorName,
        include_stories: includeStories,
        story_upsell_price_cents: includeStories ? service.story_upsell_price_cents : null,
        total_price_cents: Math.round(totalPrice * 100)
      }));

      // Check if conversation exists
      const { data: existingConversation } = await supabase
        .from("conversations")
        .select("id")
        .eq("brand_profile_id", brandProfile.id)
        .eq("creator_profile_id", creatorProfileId)
        .single();

      if (existingConversation) {
        navigate(`/brand-dashboard?tab=messages&conversation=${existingConversation.id}&package=${packageData}`);
      } else {
        // Create new conversation
        const { data: newConversation, error } = await supabase
          .from("conversations")
          .insert({
            brand_profile_id: brandProfile.id,
            creator_profile_id: creatorProfileId
          })
          .select("id")
          .single();

        if (error) throw error;
        navigate(`/brand-dashboard?tab=messages&conversation=${newConversation.id}&package=${packageData}`);
      }
      
      onClose();
    } catch (error: any) {
      console.error("Error starting conversation:", error);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRegisterAsBrand = () => {
    navigate('/brand-signup');
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {requiresConsultation ? `${serviceName} Inquiry` : `Book ${serviceName}`}
          </DialogTitle>
          <DialogDescription>
            {requiresConsultation 
              ? "This package requires a consultation with our team"
              : "Start a conversation with the creator to book"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Package Details */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Package:</span>
              <span className="font-medium capitalize">{serviceName}</span>
            </div>
            
            {/* Pricing - different display for consultation vs direct */}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                {requiresConsultation ? "Pricing:" : "Base Price:"}
              </span>
              <span className="font-medium">
                {requiresConsultation ? "Contact for quote" : `$${basePrice.toFixed(0)}`}
              </span>
            </div>
            
            {/* Stories upsell included indicator */}
            {includeStories && hasStoriesUpsell && (
              <div className="flex justify-between text-primary">
                <span className="text-sm">+ Instagram Stories:</span>
                <span className="font-medium">+${storiesPrice}</span>
              </div>
            )}
            
            {/* Total if different from base */}
            {includeStories && hasStoriesUpsell && (
              <div className="flex justify-between border-t pt-2">
                <span className="text-sm font-medium">Total:</span>
                <span className="font-bold">${price}</span>
              </div>
            )}
            
            {/* Delivery days - only for at-home packages */}
            {isHomePackage && service.delivery_days > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Est. Delivery:</span>
                <span className="font-medium">{service.delivery_days} days</span>
              </div>
            )}
            
            {/* Event duration - for event packages */}
            {isEventPackage && packageConfig?.durationRange && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Event Duration:</span>
                <span className="font-medium">
                  {packageConfig.durationRange.min}-{packageConfig.durationRange.max} hours
                </span>
              </div>
            )}
            
            {/* Managed event indicator for consultation packages */}
            {requiresConsultation && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Type:</span>
                <span className="font-medium text-primary">Managed Event</span>
              </div>
            )}
          </div>
          
          {/* Stories Upsell Option */}
          {!requiresConsultation && hasStoriesUpsell && (
            <Card className="border-dashed">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Camera className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Add Instagram Stories</p>
                      <p className="text-xs text-muted-foreground">
                        Extra story coverage for more reach
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-primary">+${storiesPrice}</span>
                    <Checkbox
                      checked={includeStories}
                      onCheckedChange={(checked) => setIncludeStories(!!checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conditional CTA based on package type */}
          {requiresConsultation ? (
            // Consultation Flow - Contact CollabHunts
            <>
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">This is a Managed Event</h4>
                      <p className="text-sm text-muted-foreground">
                        CollabHunts handles creator coordination, event setup, 
                        and all logistics. We'll provide a custom quote.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-2">
                <Button onClick={handleManagedBooking} className="w-full gradient-hero gap-2">
                  <Mail className="h-4 w-4" />
                  Contact CollabHunts
                </Button>
                <Button variant="ghost" onClick={handleContactPage} className="w-full gap-2 text-sm">
                  <Phone className="h-4 w-4" />
                  Use Contact Form
                </Button>
              </div>
              
              <p className="text-xs text-center text-muted-foreground">
                <Clock className="h-3 w-3 inline mr-1" />
                We typically respond within 24 hours
              </p>
            </>
          ) : (
            // Direct Booking Flow - Message Creator
            <>
              {hasBrandProfile ? (
                <>
                  <Button onClick={handleDirectMessage} className="w-full gradient-hero gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Message Creator to Book
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    {isHomePackage 
                      ? "Discuss product details, shipping, and content requirements"
                      : "Coordinate event date, venue details, and content requirements"}
                  </p>
                </>
              ) : (
                <>
                  <Card className="border-muted">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <Users className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Brand Profile Required</h4>
                          <p className="text-sm text-muted-foreground">
                            Create a free brand profile to message creators directly.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Button onClick={handleRegisterAsBrand} className="w-full gradient-hero gap-2">
                    <Users className="h-4 w-4" />
                    Register as a Brand
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    Free to sign up • No commitment required
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
