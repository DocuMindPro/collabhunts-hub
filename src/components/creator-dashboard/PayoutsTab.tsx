import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Clock, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PayoutsTab = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold">Payouts</h2>
        <p className="text-muted-foreground">Manage your earnings and payouts</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Wallet className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-2xl font-heading font-bold mb-2">Payout System Coming Soon</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            We're building a secure payment system with Stripe Connect integration. For now, arrange payments directly with brands through messaging.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => navigate('/creator-dashboard?tab=messages')}
              className="gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Go to Messages
            </Button>
          </div>
          <div className="mt-8 p-4 bg-muted/50 rounded-lg max-w-md">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium">What's coming</p>
                <p className="text-sm text-muted-foreground">
                  Stripe Connect for instant payouts, earnings dashboard, and payout history tracking.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayoutsTab;
