import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import PageTransition from "./components/PageTransition";
import CookieConsent from "./components/CookieConsent";
import useSiteSettings from "./hooks/useSiteSettings";
import PushNotificationProvider from "./components/PushNotificationProvider";
import NativeErrorBoundary from "./components/NativeErrorBoundary";
import NativeAppGate from "./components/NativeAppGate";

import PageLoader from "./components/PageLoader";

// Eager load pages used by native app
import CreatorDashboard from "./pages/CreatorDashboard";
import CreatorProfile from "./pages/CreatorProfile";

// Protected route components (small, used immediately)
import ProtectedRoute from "./components/ProtectedRoute";
import CreatorProtectedRoute from "./components/CreatorProtectedRoute";
import BrandProtectedRoute from "./components/BrandProtectedRoute";

// Lazy load web-only pages for code splitting
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
const BrandDashboard = lazy(() => import("./pages/BrandDashboard"));
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

// Native App Routes - Focused creator experience with auth gate (no lazy loading needed)
const NativeAppRoutes = () => (
  <NativeAppGate>
    <Routes>
      <Route path="/" element={<Navigate to="/creator-dashboard" replace />} />
      <Route path="/creator-dashboard" element={<CreatorDashboard />} />
      <Route path="/creator/:id" element={<CreatorProfile />} />
      <Route path="*" element={<Navigate to="/creator-dashboard" replace />} />
    </Routes>
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
      <Route path="/brand-signup" element={<BrandSignup />} />
      <Route path="/brand-onboarding" element={<BrandOnboarding />} />
      <Route path="/brand-welcome" element={<BrandWelcome />} />
      <Route path="/creator-signup" element={<CreatorSignup />} />
      <Route path="/creator/:id" element={<CreatorProfile />} />
      <Route 
        path="/creator-dashboard" 
        element={
          <CreatorProtectedRoute>
            <CreatorDashboard />
          </CreatorProtectedRoute>
        } 
      />
      <Route 
        path="/brand-dashboard" 
        element={
          <BrandProtectedRoute>
            <BrandDashboard />
          </BrandProtectedRoute>
        } 
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
              {/* Only show cookie consent on web */}
              {!isNativePlatform && <CookieConsent />}
            </PushNotificationProvider>
          </Router>
        </TooltipProvider>
      </SiteSettingsProvider>
    </QueryClientProvider>
  </NativeErrorBoundary>
);

export default App;