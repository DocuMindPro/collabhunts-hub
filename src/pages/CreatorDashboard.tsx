import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewTab from "@/components/creator-dashboard/OverviewTab";
import ServicesTab from "@/components/creator-dashboard/ServicesTab";
import BookingsTab from "@/components/creator-dashboard/BookingsTab";
import MessagesTab from "@/components/creator-dashboard/MessagesTab";
import { BarChart3, Package, Calendar, MessageSquare } from "lucide-react";

const CreatorDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold mb-2">Creator Dashboard</h1>
            <p className="text-muted-foreground">Manage your profile, bookings, and collaborations</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
              <TabsTrigger value="overview" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="services" className="gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Services</span>
              </TabsTrigger>
              <TabsTrigger value="bookings" className="gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Bookings</span>
              </TabsTrigger>
              <TabsTrigger value="messages" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Messages</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <OverviewTab />
            </TabsContent>

            <TabsContent value="services" className="space-y-6">
              <ServicesTab />
            </TabsContent>

            <TabsContent value="bookings" className="space-y-6">
              <BookingsTab />
            </TabsContent>

            <TabsContent value="messages" className="space-y-6">
              <MessagesTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreatorDashboard;
