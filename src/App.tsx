import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import PageTransition from "./components/PageTransition";
import CookieConsent from "./components/CookieConsent";
import useSiteSettings from "./hooks/useSiteSettings";
import PushNotificationProvider from "./components/PushNotificationProvider";
import NativeErrorBoundary from "./components/NativeErrorBoundary";

// Eager load all pages for native compatibility
import Index from "./pages/Index";
import Login from "./pages/Login";
import Influencers from "./pages/Influencers";
import Campaigns from "./pages/Campaigns";
import Pricing from "./pages/Pricing";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import Brand from "./pages/Brand";
import Creator from "./pages/Creator";
import BrandSignup from "./pages/BrandSignup";
import BrandOnboarding from "./pages/BrandOnboarding";
import BrandWelcome from "./pages/BrandWelcome";
import CreatorSignup from "./pages/CreatorSignup";
import CreatorProfile from "./pages/CreatorProfile";
import CreatorDashboard from "./pages/CreatorDashboard";
import BrandDashboard from "./pages/BrandDashboard";
import FranchiseDashboard from "./pages/FranchiseDashboard";
import AffiliateDashboard from "./pages/AffiliateDashboard";
import Admin from "./pages/Admin";
import BackupHistory from "./pages/BackupHistory";
import KnowledgeBase from "./pages/KnowledgeBase";
import KnowledgeBaseCategory from "./pages/KnowledgeBaseCategory";
import KnowledgeBaseArticle from "./pages/KnowledgeBaseArticle";
import WhatsNew from "./pages/WhatsNew";
import Changelog from "./pages/Changelog";
import Advertising from "./pages/Advertising";
import BecomeAffiliate from "./pages/BecomeAffiliate";
import FranchiseOpportunities from "./pages/FranchiseOpportunities";
import Download from "./pages/Download";
import Debug from "./pages/Debug";
import NotFound from "./pages/NotFound";

// Protected route components
import ProtectedRoute from "./components/ProtectedRoute";
import CreatorProtectedRoute from "./components/CreatorProtectedRoute";
import BrandProtectedRoute from "./components/BrandProtectedRoute";
import FranchiseProtectedRoute from "./components/FranchiseProtectedRoute";
import AffiliateProtectedRoute from "./components/AffiliateProtectedRoute";

const queryClient = new QueryClient();

// Use HashRouter for native apps (file:// protocol), BrowserRouter for web
const Router = Capacitor.isNativePlatform() ? HashRouter : BrowserRouter;

// Component to initialize site settings (favicon, meta tags)
const SiteSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  useSiteSettings();
  return <>{children}</>;
};

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
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/influencers" element={<Influencers />} />
                  <Route path="/campaigns" element={<Campaigns />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/refund" element={<RefundPolicy />} />
                  <Route path="/brand" element={<Brand />} />
                  <Route path="/creator" element={<Creator />} />
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
                    path="/franchise-dashboard" 
                    element={
                      <FranchiseProtectedRoute>
                        <FranchiseDashboard />
                      </FranchiseProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/affiliate-dashboard" 
                    element={
                      <AffiliateProtectedRoute>
                        <AffiliateDashboard />
                      </AffiliateProtectedRoute>
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
                  <Route path="/advertising" element={<Advertising />} />
                  <Route path="/become-affiliate" element={<BecomeAffiliate />} />
                  <Route path="/franchise" element={<FranchiseOpportunities />} />
                  <Route path="/download" element={<Download />} />
                  <Route path="/debug" element={<Debug />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </PageTransition>
              <CookieConsent />
            </PushNotificationProvider>
          </Router>
        </TooltipProvider>
      </SiteSettingsProvider>
    </QueryClientProvider>
  </NativeErrorBoundary>
);

export default App;
