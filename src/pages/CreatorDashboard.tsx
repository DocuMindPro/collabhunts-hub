import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewTab from "@/components/creator-dashboard/OverviewTab";
import ProfileTab from "@/components/creator-dashboard/ProfileTab";
import ServicesTab from "@/components/creator-dashboard/ServicesTab";
import BookingsTab from "@/components/creator-dashboard/BookingsTab";
import MessagesTab from "@/components/creator-dashboard/MessagesTab";
import CampaignsTab from "@/components/creator-dashboard/CampaignsTab";
import PayoutsTab from "@/components/creator-dashboard/PayoutsTab";
import { BarChart3, User, Package, Calendar, MessageSquare, Megaphone, Wallet } from "lucide-react";

const CreatorDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-4 md:py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-4 md:mb-8">
            <h1 className="text-2xl md:text-4xl font-heading font-bold mb-1 md:mb-2">Creator Dashboard</h1>
            <p className="text-sm md:text-base text-muted-foreground">Manage your profile, bookings, and collaborations</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
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

            <TabsContent value="overview" className="space-y-6">
              <OverviewTab />
            </TabsContent>

            <TabsContent value="campaigns" className="space-y-6">
              <CampaignsTab />
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
    </div>
  );
};

export default CreatorDashboard;
