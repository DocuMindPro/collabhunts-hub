import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Bell, Settings } from "lucide-react";
import { BrandRegistrationContext } from "@/contexts/BrandRegistrationContext";
import BrandMessagesTab from "@/components/brand-dashboard/BrandMessagesTab";
import BrandBookingsTab from "@/components/brand-dashboard/BrandBookingsTab";
import BrandAccountTab from "@/components/brand-dashboard/BrandAccountTab";
import NativeBrandNotifications from "@/components/mobile/NativeBrandNotifications";
import NativeBrandSearch from "@/components/mobile/NativeBrandSearch";
import NativeBrandHome from "@/components/mobile/NativeBrandHome";

interface NativeBrandDashboardProps {
  brandName?: string;
}

const NativeBrandDashboard = ({ brandName }: NativeBrandDashboardProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "home";

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const getTitle = () => {
    switch (currentTab) {
      case "home": return brandName || "Dashboard";
      case "messages": return "Messages";
      case "bookings": return "Bookings";
      case "search": return "Find Creators";
      case "notifications": return "Notifications";
      case "account": return "Account";
      default: return brandName || "Dashboard";
    }
  };

  const renderTab = () => {
    switch (currentTab) {
      case "home":
        return <NativeBrandHome brandName={brandName} onTabChange={handleTabChange} />;
      case "messages":
        return <BrandMessagesTab registrationCompleted />;
      case "bookings":
        return <BrandBookingsTab registrationCompleted />;
      case "notifications":
        return <NativeBrandNotifications />;
      case "search":
        return <NativeBrandSearch />;
      case "account":
        return <BrandAccountTab />;
      default:
        return <NativeBrandHome brandName={brandName} onTabChange={handleTabChange} />;
    }
  };

  return (
    <BrandRegistrationContext.Provider value={{ registrationCompleted: true }}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 safe-area-top">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-foreground truncate">
              {getTitle()}
            </h1>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleTabChange("notifications")}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <Bell className="h-5 w-5 text-muted-foreground" />
              </button>
              <button
                onClick={() => handleTabChange("account")}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <Settings className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab content */}
        <div className="pb-20">{renderTab()}</div>
      </div>
    </BrandRegistrationContext.Provider>
  );
};

export default NativeBrandDashboard;
