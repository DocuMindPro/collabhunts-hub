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
import CampaignsTab from "@/components/creator-dashboard/CampaignsTab";
import PayoutsTab from "@/components/creator-dashboard/PayoutsTab";
import MobileBottomNav from "@/components/mobile/MobileBottomNav";
import { BarChart3, User, Package, Calendar, MessageSquare, Megaphone, Wallet } from "lucide-react";

const CreatorDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const isNative = Capacitor.isNativePlatform();

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
      {/* Hide navbar on native platforms for cleaner mobile experience */}
      {!isNative && <Navbar />}
      
      <main className="flex-1 py-4 md:py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Simplified header on native */}
          <div className={`${isNative ? 'mb-2' : 'mb-4 md:mb-8'}`}>
            <h1 className={`font-heading font-bold ${isNative ? 'text-xl' : 'text-2xl md:text-4xl'} mb-1 md:mb-2`}>
              {isNative ? 'Dashboard' : 'Creator Dashboard'}
            </h1>
            {!isNative && (
              <p className="text-sm md:text-base text-muted-foreground">
                Manage your profile, bookings, and collaborations
              </p>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4 md:space-y-6">
            {/* Hide tab list on native - using bottom nav instead */}
            {!isNative && (
              <TabsList className="flex w-full overflow-x-auto gap-1 lg:w-auto lg:inline-flex">
                <TabsTrigger value="overview" className="gap-2 shrink-0">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="campaigns" className="gap-2 shrink-0">
                  <Megaphone className="h-4 w-4" />
                  <span className="hidden sm:inline">Campaigns</span>
                </TabsTrigger>
                <TabsTrigger value="profile" className="gap-2 shrink-0">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="services" className="gap-2 shrink-0">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Services</span>
                </TabsTrigger>
                <TabsTrigger value="bookings" className="gap-2 shrink-0">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Bookings</span>
                </TabsTrigger>
                <TabsTrigger value="payouts" className="gap-2 shrink-0">
                  <Wallet className="h-4 w-4" />
                  <span className="hidden sm:inline">Payouts</span>
                </TabsTrigger>
                <TabsTrigger value="messages" className="gap-2 shrink-0">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Messages</span>
                </TabsTrigger>
              </TabsList>
            )}

            <TabsContent value="overview" className="space-y-6">
              <OverviewTab />
            </TabsContent>

            <TabsContent value="campaigns" className="space-y-6">
              <CampaignsTab openCampaignId={searchParams.get('apply')} />
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <ProfileTab />
            </TabsContent>

            <TabsContent value="services" className="space-y-6">
              <ServicesTab />
            </TabsContent>

            <TabsContent value="bookings" className="space-y-6">
              <BookingsTab />
            </TabsContent>

            <TabsContent value="payouts" className="space-y-6">
              <PayoutsTab />
            </TabsContent>

            <TabsContent value="messages" className="space-y-6">
              <MessagesTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Mobile bottom navigation for native platforms */}
      {isNative && (
        <MobileBottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      )}
    </div>
  );
};

export default CreatorDashboard;
