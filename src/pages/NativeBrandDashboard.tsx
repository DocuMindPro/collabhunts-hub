import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BrandRegistrationContext } from "@/contexts/BrandRegistrationContext";
import BrandMessagesTab from "@/components/brand-dashboard/BrandMessagesTab";
import BrandBookingsTab from "@/components/brand-dashboard/BrandBookingsTab";
import NativeBrandNotifications from "@/components/mobile/NativeBrandNotifications";
import NativeBrandSearch from "@/components/mobile/NativeBrandSearch";

interface NativeBrandDashboardProps {
  brandName?: string;
}

const NativeBrandDashboard = ({ brandName }: NativeBrandDashboardProps) => {
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "messages";

  const renderTab = () => {
    switch (currentTab) {
      case "messages":
        return <BrandMessagesTab registrationCompleted />;
      case "bookings":
        return <BrandBookingsTab registrationCompleted />;
      case "notifications":
        return <NativeBrandNotifications />;
      case "search":
        return <NativeBrandSearch />;
      default:
        return <BrandMessagesTab registrationCompleted />;
    }
  };

  return (
    <BrandRegistrationContext.Provider value={{ registrationCompleted: true }}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 safe-area-top">
          <h1 className="text-lg font-bold text-foreground truncate">
            {brandName || "Brand Dashboard"}
          </h1>
        </div>

        {/* Tab content */}
        <div className="pb-20">{renderTab()}</div>
      </div>
    </BrandRegistrationContext.Provider>
  );
};

export default NativeBrandDashboard;
