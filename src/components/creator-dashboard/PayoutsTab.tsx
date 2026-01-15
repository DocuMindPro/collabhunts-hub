import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Mail, CheckCircle } from "lucide-react";

const PayoutsTab = () => {

  const handleContactUs = () => {
    window.location.href = "mailto:care@collabhunts.com?subject=Creator%20Payout%20Inquiry";
  };

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
          <h3 className="text-2xl font-heading font-bold mb-2">Managed Payments</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            CollabHunts handles all payments for collaborations. When a brand books your services through us, you'll receive payment after successful delivery.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleContactUs}
              className="gap-2"
            >
              <Mail className="h-4 w-4" />
              Payment Questions?
            </Button>
          </div>
          <div className="mt-8 p-4 bg-muted/50 rounded-lg max-w-md">
            <p className="text-sm font-medium mb-3">How Payments Work</p>
            <div className="space-y-2 text-left">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Brands pay CollabHunts when booking your services</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>You deliver the content as agreed</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Brand approves the deliverables</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>CollabHunts releases payment to you</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayoutsTab;
