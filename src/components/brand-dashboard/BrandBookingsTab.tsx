import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MessageSquare, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BrandBookingsTab = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold">My Bookings</h2>
        <p className="text-muted-foreground">Track your collaboration requests</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-2xl font-heading font-bold mb-2">Booking System Coming Soon</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            We're building a seamless booking system. For now, connect with creators directly through messages to discuss your project and arrange collaborations.
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
              onClick={() => navigate('/brand-dashboard?tab=messages')}
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
                <p className="text-sm font-medium">How it works for now</p>
                <p className="text-sm text-muted-foreground">
                  Browse creators, message them to discuss your project, and negotiate terms directly. Arrange payment offline until our secure booking system launches.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandBookingsTab;
