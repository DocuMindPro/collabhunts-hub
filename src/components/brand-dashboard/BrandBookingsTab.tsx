import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Mail, Users, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BrandBookingsTab = () => {
  const navigate = useNavigate();

  const handleContactUs = () => {
    window.location.href = "mailto:care@collabhunts.com?subject=Collaboration%20Request";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold">My Bookings</h2>
        <p className="text-muted-foreground">Request and track creator collaborations</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-2xl font-heading font-bold mb-2">Managed Collaborations</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            All creator bookings are managed by CollabHunts. Browse creators, find who you want to work with, then contact us to set up the collaboration.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => navigate('/influencers')}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Browse Creators
            </Button>
            <Button 
              variant="outline"
              onClick={handleContactUs}
              className="gap-2"
            >
              <Mail className="h-4 w-4" />
              Request a Booking
            </Button>
          </div>
          <div className="mt-8 p-4 bg-muted/50 rounded-lg max-w-md">
            <p className="text-sm font-medium mb-3">How It Works</p>
            <div className="space-y-2 text-left">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Browse and select creators you want to work with</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Contact us with your project requirements</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>We coordinate with creators and handle all the details</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Pay securely through CollabHunts and receive your content</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandBookingsTab;
