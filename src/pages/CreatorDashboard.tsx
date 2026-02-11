import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewTab from "@/components/creator-dashboard/OverviewTab";
import ProfileTab from "@/components/creator-dashboard/ProfileTab";
import ServicesTab from "@/components/creator-dashboard/ServicesTab";
import BookingsTab from "@/components/creator-dashboard/BookingsTab";
import MessagesTab from "@/components/creator-dashboard/MessagesTab";
import OpportunitiesTab from "@/components/creator-dashboard/OpportunitiesTab";
import FeaturingTab from "@/components/creator-dashboard/FeaturingTab";
import StatsUpdateBanner from "@/components/creator-dashboard/StatsUpdateBanner";
import { CalendarTab } from "@/components/calendar/CalendarTab";

import { supabase } from "@/integrations/supabase/client";
import { BarChart3, User, Package, Calendar, CalendarDays, MessageSquare, Briefcase, Rocket } from "lucide-react";

const CreatorDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [creatorProfileId, setCreatorProfileId] = useState<string | null>(null);
  const [statsUpdateRequired, setStatsUpdateRequired] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    const fetchCreatorProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Check direct ownership first
      const { data } = await supabase
        .from("creator_profiles")
        .select("id, stats_update_required")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (data) {
        setCreatorProfileId(data.id);
        setStatsUpdateRequired(data.stats_update_required ?? false);
        return;
      }

      // Check delegate access
      const { data: delegate } = await supabase
        .from("account_delegates")
        .select("profile_id")
        .eq("delegate_user_id", user.id)
        .eq("account_type", "creator")
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (delegate) {
        setCreatorProfileId(delegate.profile_id);
      }
    };
    fetchCreatorProfile();
  }, []);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  return (
    <div className={`min-h-screen flex flex-col ${isNative ? 'pb-20' : ''}`}>
      {!isNative && <Navbar />}
      
      <main className="flex-1 py-4 md:py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className={`${isNative ? 'mb-2' : 'mb-4 md:mb-8'}`}>
            <h1 className={`font-heading font-bold ${isNative ? 'text-xl' : 'text-2xl md:text-4xl'} mb-1 md:mb-2`}>
              {isNative ? 'Dashboard' : 'My Dashboard'}
            </h1>
            {!isNative && (
              <p className="text-sm md:text-base text-muted-foreground">
                Manage your events, availability, and earnings
              </p>
            )}
          </div>

          {statsUpdateRequired && creatorProfileId && (
            <StatsUpdateBanner
              creatorProfileId={creatorProfileId}
              onNavigateToProfile={() => handleTabChange("profile")}
              onDismissed={() => setStatsUpdateRequired(false)}
            />
          )}

          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4 md:space-y-6">
            {isNative ? null : (
            <TabsList className="flex w-full h-auto overflow-x-auto gap-0.5 p-1 sm:h-10 lg:w-auto lg:inline-flex">
                <TabsTrigger value="overview" className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 shrink-0 min-w-[52px] px-1.5 py-1.5 sm:min-w-0 sm:px-3">
                  <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="text-[9px] leading-tight sm:text-sm truncate">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 shrink-0 min-w-[52px] px-1.5 py-1.5 sm:min-w-0 sm:px-3">
                  <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="text-[9px] leading-tight sm:text-sm truncate">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="services" className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 shrink-0 min-w-[52px] px-1.5 py-1.5 sm:min-w-0 sm:px-3">
                  <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="text-[9px] leading-tight sm:text-sm truncate">My Packages</span>
                </TabsTrigger>
              <TabsTrigger value="bookings" className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 shrink-0 min-w-[52px] px-1.5 py-1.5 sm:min-w-0 sm:px-3">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-[9px] leading-tight sm:text-sm truncate">Agreements</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 shrink-0 min-w-[52px] px-1.5 py-1.5 sm:min-w-0 sm:px-3">
                <CalendarDays className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-[9px] leading-tight sm:text-sm truncate">Calendar</span>
              </TabsTrigger>
              <TabsTrigger value="opportunities" className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 shrink-0 min-w-[52px] px-1.5 py-1.5 sm:min-w-0 sm:px-3">
                <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-[9px] leading-tight sm:text-sm truncate">Opps</span>
              </TabsTrigger>
              <TabsTrigger value="boost" className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 shrink-0 min-w-[52px] px-1.5 py-1.5 sm:min-w-0 sm:px-3">
                <Rocket className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-[9px] leading-tight sm:text-sm truncate">Boost</span>
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 shrink-0 min-w-[52px] px-1.5 py-1.5 sm:min-w-0 sm:px-3">
                <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-[9px] leading-tight sm:text-sm truncate">Messages</span>
              </TabsTrigger>
            </TabsList>
            )}

            <TabsContent value="overview" className="space-y-6">
              <OverviewTab />
            </TabsContent>

            <TabsContent value="profile" className="space-y-4">
              <ProfileTab />
            </TabsContent>

            <TabsContent value="services" className="space-y-6">
              <ServicesTab />
            </TabsContent>

            <TabsContent value="bookings" className="space-y-6">
              <BookingsTab />
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6">
              <CalendarTab userType="creator" />
            </TabsContent>

            <TabsContent value="opportunities" className="space-y-6">
              {creatorProfileId && <OpportunitiesTab creatorProfileId={creatorProfileId} />}
            </TabsContent>

            <TabsContent value="boost" className="space-y-6">
              {creatorProfileId && <FeaturingTab creatorProfileId={creatorProfileId} />}
            </TabsContent>

            <TabsContent value="messages" className="space-y-6">
              <MessagesTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>

    </div>
  );
};

export default CreatorDashboard;
