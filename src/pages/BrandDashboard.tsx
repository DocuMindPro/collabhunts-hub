import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BrandOverviewTab from "@/components/brand-dashboard/BrandOverviewTab";
import BrandBookingsTab from "@/components/brand-dashboard/BrandBookingsTab";
import BrandMessagesTab from "@/components/brand-dashboard/BrandMessagesTab";
import BrandAccountTab from "@/components/brand-dashboard/BrandAccountTab";
import { BarChart3, Calendar, MessageSquare, MapPin, User } from "lucide-react";

const BrandDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');

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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-4 md:py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-4 md:mb-8">
            <h1 className="text-2xl md:text-4xl font-heading font-bold mb-1 md:mb-2">Brand Dashboard</h1>
            <p className="text-sm md:text-base text-muted-foreground">Manage your brand and creator events</p>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4 md:space-y-6">
            <TabsList className="flex w-full overflow-x-auto gap-1 lg:w-auto lg:inline-flex">
              <TabsTrigger value="overview" className="gap-2 shrink-0">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="venue" className="gap-2 shrink-0">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Brand Profile</span>
              </TabsTrigger>
              <TabsTrigger value="bookings" className="gap-2 shrink-0">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Events</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="gap-2 shrink-0">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Account</span>
              </TabsTrigger>
              <TabsTrigger value="messages" className="gap-2 shrink-0">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Messages</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <BrandOverviewTab />
            </TabsContent>

            <TabsContent value="venue" className="space-y-6">
              <BrandAccountTab />
            </TabsContent>

            <TabsContent value="bookings" className="space-y-6">
              <BrandBookingsTab />
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
              <BrandAccountTab />
            </TabsContent>

            <TabsContent value="messages" className="space-y-6">
              <BrandMessagesTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default BrandDashboard;
