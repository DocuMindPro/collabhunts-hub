import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Calendar, CheckCircle, Clock, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BrandOverviewTab = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSpent: 0,
    activeEvents: 0,
    completedEvents: 0,
    pendingRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("brand_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) return;

      const { data: bookingsData } = await supabase
        .from("bookings")
        .select("status, total_price_cents")
        .eq("brand_profile_id", profile.id);

      const completedBookings = bookingsData?.filter(b => b.status === "completed") || [];
      const totalSpent = completedBookings.reduce((sum, b) => sum + b.total_price_cents, 0);
      const activeEvents = bookingsData?.filter(b => b.status === "accepted").length || 0;
      const pendingRequests = bookingsData?.filter(b => b.status === "pending").length || 0;

      setStats({
        totalSpent: totalSpent / 100,
        activeEvents,
        completedEvents: completedBookings.length,
        pendingRequests,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Action Card */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Ready to book your next event?</h3>
              <p className="text-muted-foreground text-sm">
                Browse creators available for fan experiences, meet & greets, and more.
              </p>
            </div>
            <Button 
              onClick={() => navigate('/influencers')}
              className="gap-2 shrink-0"
            >
              <Users className="h-4 w-4" />
              Find Creators
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Header */}
      <Card>
        <CardHeader>
          <CardTitle>Event Overview</CardTitle>
          <CardDescription>Your booking activity at a glance</CardDescription>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">On completed events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEvents}</div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedEvents}</div>
            <p className="text-xs text-muted-foreground">Successful events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
      </div>

      {/* How It Works Section */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>Simple event booking in 3 steps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium">1. Find Creators</h4>
              <p className="text-sm text-muted-foreground">
                Browse verified creators and view their event packages
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium">2. Book an Event</h4>
              <p className="text-sm text-muted-foreground">
                Select a package, choose your date, and pay 50% deposit
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium">3. Host & Confirm</h4>
              <p className="text-sm text-muted-foreground">
                Event happens, you confirm completion, remaining balance is released
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandOverviewTab;
