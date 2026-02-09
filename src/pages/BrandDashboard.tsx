import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import BrandOverviewTab from "@/components/brand-dashboard/BrandOverviewTab";
import BrandBookingsTab from "@/components/brand-dashboard/BrandBookingsTab";
import BrandMessagesTab from "@/components/brand-dashboard/BrandMessagesTab";
import BrandAccountTab from "@/components/brand-dashboard/BrandAccountTab";
import BrandOpportunitiesTab from "@/components/brand-dashboard/BrandOpportunitiesTab";
import { CalendarTab } from "@/components/calendar/CalendarTab";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Calendar, CalendarDays, MessageSquare, User, Briefcase, Users } from "lucide-react";

const BrandDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [brandProfileId, setBrandProfileId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchBrandProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Check direct ownership first
      const { data } = await supabase
        .from("brand_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (data) {
        setBrandProfileId(data.id);
        return;
      }

      // Check delegate access
      const { data: delegate } = await supabase
        .from("account_delegates")
        .select("profile_id")
        .eq("delegate_user_id", user.id)
        .eq("account_type", "brand")
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (delegate) {
        setBrandProfileId(delegate.profile_id);
      }
    };
    fetchBrandProfile();
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-4 md:py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h1 className="text-xl md:text-2xl font-heading font-bold">Dashboard</h1>
            <Button onClick={() => navigate('/influencers')} size="sm" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Find Creators</span>
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4 md:space-y-6">
            <TabsList className="flex w-full h-auto overflow-x-auto gap-0.5 p-1 sm:h-10 lg:w-auto lg:inline-flex">
              <TabsTrigger value="overview" className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 shrink-0 min-w-[52px] px-1.5 py-1.5 sm:min-w-0 sm:px-3">
                <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-[9px] leading-tight sm:text-sm truncate">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="opportunities" className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 shrink-0 min-w-[52px] px-1.5 py-1.5 sm:min-w-0 sm:px-3">
                <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-[9px] leading-tight sm:text-sm truncate">Opps</span>
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 shrink-0 min-w-[52px] px-1.5 py-1.5 sm:min-w-0 sm:px-3">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-[9px] leading-tight sm:text-sm truncate">Events</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 shrink-0 min-w-[52px] px-1.5 py-1.5 sm:min-w-0 sm:px-3">
                <CalendarDays className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-[9px] leading-tight sm:text-sm truncate">Calendar</span>
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 shrink-0 min-w-[52px] px-1.5 py-1.5 sm:min-w-0 sm:px-3">
                <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-[9px] leading-tight sm:text-sm truncate">Messages</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 shrink-0 min-w-[52px] px-1.5 py-1.5 sm:min-w-0 sm:px-3">
                <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-[9px] leading-tight sm:text-sm truncate">Account</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <BrandOverviewTab />
            </TabsContent>

            <TabsContent value="opportunities" className="space-y-6">
              {brandProfileId && <BrandOpportunitiesTab brandProfileId={brandProfileId} />}
            </TabsContent>

            <TabsContent value="bookings" className="space-y-6">
              <BrandBookingsTab />
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6">
              <CalendarTab userType="brand" />
            </TabsContent>

            <TabsContent value="messages" className="space-y-6">
              <BrandMessagesTab />
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
              <BrandAccountTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default BrandDashboard;
