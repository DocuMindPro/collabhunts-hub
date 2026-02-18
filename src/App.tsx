import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route, Navigate, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import PageTransition from "./components/PageTransition";
import SupportWidget from "./components/SupportWidget";
import CookieConsent from "./components/CookieConsent";
import useSiteSettings from "./hooks/useSiteSettings";
import PushNotificationProvider from "./components/PushNotificationProvider";
import NativeErrorBoundary from "./components/NativeErrorBoundary";
import NativeAppGate from "./components/NativeAppGate";
import type { NativeRole } from "./components/NativeAppGate";
import SmartAppBanner from "./components/SmartAppBanner";

import PageLoader from "./components/PageLoader";

// Eager load pages used by native app
import CreatorDashboard from "./pages/CreatorDashboard";
import CreatorProfile from "./pages/CreatorProfile";
import NativeBrandDashboard from "./pages/NativeBrandDashboard";
import MobileBottomNav from "./components/mobile/MobileBottomNav";
import BrandBottomNav from "./components/mobile/BrandBottomNav";

// Protected route component (admin only — dashboards now gated to app)
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy load web-only pages for code splitting
const GetApp = lazy(() => import("./pages/GetApp"));
const WebAppGate = lazy(() => import("./components/WebAppGate"));
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Influencers = lazy(() => import("./pages/Influencers"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Contact = lazy(() => import("./pages/Contact"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const Brand = lazy(() => import("./pages/Brand"));
const Creator = lazy(() => import("./pages/Creator"));
const BrandSignup = lazy(() => import("./pages/BrandSignup"));
const BrandOnboarding = lazy(() => import("./pages/BrandOnboarding"));
const BrandWelcome = lazy(() => import("./pages/BrandWelcome"));
const CreatorSignup = lazy(() => import("./pages/CreatorSignup"));
// BrandDashboard is only used in native app (web users see WebAppGate)
const Admin = lazy(() => import("./pages/Admin"));
const BackupHistory = lazy(() => import("./pages/BackupHistory"));
const KnowledgeBase = lazy(() => import("./pages/KnowledgeBase"));
const KnowledgeBaseCategory = lazy(() => import("./pages/KnowledgeBaseCategory"));
const KnowledgeBaseArticle = lazy(() => import("./pages/KnowledgeBaseArticle"));
const WhatsNew = lazy(() => import("./pages/WhatsNew"));
const Changelog = lazy(() => import("./pages/Changelog"));
const Download = lazy(() => import("./pages/Download"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Events = lazy(() => import("./pages/Events"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
const Opportunities = lazy(() => import("./pages/Opportunities"));
const Careers = lazy(() => import("./pages/Careers"));
const CollaborationGuide = lazy(() => import("./pages/CollaborationGuide"));
const Feedback = lazy(() => import("./pages/Feedback"));

const queryClient = new QueryClient();

// Use HashRouter for native apps (file:// protocol), BrowserRouter for web
const Router = Capacitor.isNativePlatform() ? HashRouter : BrowserRouter;

// Check if running on native platform
const isNativePlatform = Capacitor.isNativePlatform();

// Component to initialize site settings (favicon, meta tags)
const SiteSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  useSiteSettings();
  return <>{children}</>;
};

// Native navigation wrapper for CREATOR mode
const CreatorBottomNavWrapper = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const currentTab = searchParams.get("tab") || "overview";
  const dashboardTabs = ["overview", "bookings", "messages", "profile", "services", "calendar", "boost", "account"];
  const activeTab = location.pathname === "/opportunities"
    ? "opportunities"
    : location.pathname === "/creator-dashboard"
      ? (dashboardTabs.includes(currentTab) ? currentTab : "overview")
      : "overview";

  const handleTabChange = (tab: string) => {
    if (tab === "opportunities") {
      navigate("/opportunities");
    } else {
      navigate(`/creator-dashboard?tab=${tab}`);
    }
  };

  return <MobileBottomNav activeTab={activeTab} onTabChange={handleTabChange} />;
};

// Native navigation wrapper for BRAND mode
const BrandBottomNavWrapper = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "messages";

  const handleTabChange = (tab: string) => {
    navigate(`/brand-dashboard?tab=${tab}`);
  };

  return <BrandBottomNav activeTab={activeTab} onTabChange={handleTabChange} />;
};

// Native App Routes - Dual-role experience with auth gate
const NativeAppRoutes = () => (
  <NativeAppGate>
    {(role, brandProfile) => (
      <div className="min-h-screen bg-background pb-20">
        {role === 'creator' ? (
          <>
            <Routes>
              <Route path="/" element={<Navigate to="/creator-dashboard" replace />} />
              <Route path="/creator-dashboard" element={<CreatorDashboard />} />
              <Route path="/creator/:id" element={<CreatorProfile />} />
              <Route path="/opportunities" element={
                <Suspense fallback={<PageLoader />}>
                  <Opportunities />
                </Suspense>
              } />
              <Route path="*" element={<Navigate to="/creator-dashboard" replace />} />
            </Routes>
            <CreatorBottomNavWrapper />
          </>
        ) : (
          <>
            <Routes>
              <Route path="/" element={<Navigate to="/brand-dashboard" replace />} />
              <Route path="/brand-dashboard" element={
                <NativeBrandDashboard brandName={brandProfile?.company_name} brandProfileId={brandProfile?.id} />
              } />
              <Route path="/creator/:id" element={<CreatorProfile />} />
              <Route path="*" element={<Navigate to="/brand-dashboard" replace />} />
            </Routes>
            <BrandBottomNavWrapper />
          </>
        )}
      </div>
    )}
  </NativeAppGate>
);

// Web App Routes - Full website experience with lazy loading
const WebAppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/influencers" element={<Influencers />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/refund" element={<RefundPolicy />} />
      <Route path="/brand" element={<Brand />} />
      <Route path="/creator" element={<Creator />} />
      <Route path="/events" element={<Events />} />
      <Route path="/event/:id" element={<EventDetail />} />
      <Route path="/opportunities" element={<Opportunities />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/collaborations/:slug" element={<CollaborationGuide />} />
      <Route path="/feedback" element={<Feedback />} />
      <Route path="/brand-signup" element={<BrandSignup />} />
      <Route path="/brand-onboarding" element={<BrandOnboarding />} />
      <Route path="/brand-welcome" element={<BrandWelcome />} />
      <Route path="/creator-signup" element={<CreatorSignup />} />
      <Route path="/creator/:id" element={<CreatorProfile />} />
      <Route 
        path="/creator-dashboard" 
        element={<WebAppGate featureName="Creator Dashboard" />}
      />
      <Route 
        path="/brand-dashboard" 
        element={<WebAppGate featureName="Brand Dashboard" />}
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requireAdmin>
            <Admin />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/backup-history" 
        element={
          <ProtectedRoute requireAdmin>
            <BackupHistory />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/knowledge-base" 
        element={
          <ProtectedRoute>
            <KnowledgeBase />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/knowledge-base/:categorySlug" 
        element={
          <ProtectedRoute>
            <KnowledgeBaseCategory />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/knowledge-base/:categorySlug/:articleSlug" 
        element={
          <ProtectedRoute>
            <KnowledgeBaseArticle />
          </ProtectedRoute>
        } 
      />
      <Route path="/whats-new" element={<WhatsNew />} />
      <Route 
        path="/knowledge-base/whats-new" 
        element={
          <ProtectedRoute>
            <WhatsNew />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/knowledge-base/changelog" 
        element={
          <ProtectedRoute>
            <Changelog />
          </ProtectedRoute>
        } 
      />
      <Route path="/download" element={<Download />} />
      <Route path="/get-app" element={<GetApp />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

const App = () => (
  <NativeErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <SiteSettingsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          
          <Router>
            <PushNotificationProvider>
              <PageTransition>
                {isNativePlatform ? <NativeAppRoutes /> : <WebAppRoutes />}
              </PageTransition>
              {/* Only show cookie consent, support widget, and app banner on web */}
              {!isNativePlatform && <SmartAppBanner />}
              {!isNativePlatform && <CookieConsent />}
              {!isNativePlatform && <SupportWidget />}
            </PushNotificationProvider>
          </Router>
        </TooltipProvider>
      </SiteSettingsProvider>
    </QueryClientProvider>
  </NativeErrorBoundary>
);

export default App;
