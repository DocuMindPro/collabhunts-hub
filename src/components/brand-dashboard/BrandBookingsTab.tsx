import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Mail, Users, CheckCircle, MessageSquare, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentPlanType } from "@/lib/subscription-utils";

const BrandBookingsTab = () => {
  const navigate = useNavigate();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [planType, setPlanType] = useState<string>('none');

  useEffect(() => {
    const checkSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const plan = await getCurrentPlanType(session.user.id);
        setPlanType(plan);
        setIsSubscribed(plan !== 'none');
      }
    };
    checkSubscription();
  }, []);

  const handleContactUs = () => {
    window.location.href = "mailto:care@collabhunts.com?subject=Managed%20Collaboration%20Request";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold">My Bookings</h2>
        <p className="text-muted-foreground">Work with creators your way</p>
      </div>

      {/* Two Options Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Option 1: Self-Service */}
        <Card className={isSubscribed ? 'border-primary' : ''}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-heading font-bold">Self-Service</h3>
                {isSubscribed && (
                  <span className="text-xs text-primary font-medium">Your plan includes this</span>
                )}
              </div>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Message creators directly, negotiate terms, and manage collaborations yourself.
            </p>
            {isSubscribed ? (
              <Button 
                onClick={() => navigate('/influencers')}
                className="w-full gap-2"
              >
                <Users className="h-4 w-4" />
                Find Creators to Message
              </Button>
            ) : (
              <Button 
                onClick={() => navigate('/pricing')}
                variant="outline"
                className="w-full gap-2"
              >
                <Crown className="h-4 w-4" />
                Subscribe to Unlock
              </Button>
            )}
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Direct communication with creators</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>You control the terms and timeline</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Arrange payments directly</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Option 2: Managed Service */}
        <Card className="border-accent/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-heading font-bold">Managed Service</h3>
                <span className="text-xs text-muted-foreground font-medium">Available to everyone</span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Let CollabHunts handle everything—we coordinate with creators and manage delivery.
            </p>
            <Button 
              variant="outline"
              onClick={handleContactUs}
              className="w-full gap-2"
            >
              <Mail className="h-4 w-4" />
              Request Managed Booking
            </Button>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                <span>We handle all coordination</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                <span>Secure payments through us</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                <span>Service fee applies</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">No bookings yet</h4>
              <p className="text-sm text-muted-foreground">
                Once you start working with creators, your bookings will appear here. 
                Browse our marketplace to find creators, or contact us for managed service.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandBookingsTab;
