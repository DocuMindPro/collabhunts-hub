import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import PageTransition from "./components/PageTransition";
import CookieConsent from "./components/CookieConsent";
import PageLoader from "./components/PageLoader";
import useSiteSettings from "./hooks/useSiteSettings";
import PushNotificationProvider from "./components/PushNotificationProvider";
// Eager load most visited pages
import Index from "./pages/Index";
import Login from "./pages/Login";

// Lazy load all other pages for code splitting
const Influencers = lazy(() => import("./pages/Influencers"));
const Campaigns = lazy(() => import("./pages/Campaigns"));
const Pricing = lazy(() => import("./pages/Pricing"));
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
const CreatorProfile = lazy(() => import("./pages/CreatorProfile"));
const CreatorDashboard = lazy(() => import("./pages/CreatorDashboard"));
const BrandDashboard = lazy(() => import("./pages/BrandDashboard"));
const FranchiseDashboard = lazy(() => import("./pages/FranchiseDashboard"));
const AffiliateDashboard = lazy(() => import("./pages/AffiliateDashboard"));
const Admin = lazy(() => import("./pages/Admin"));
const BackupHistory = lazy(() => import("./pages/BackupHistory"));
const KnowledgeBase = lazy(() => import("./pages/KnowledgeBase"));
const KnowledgeBaseCategory = lazy(() => import("./pages/KnowledgeBaseCategory"));
const KnowledgeBaseArticle = lazy(() => import("./pages/KnowledgeBaseArticle"));
const WhatsNew = lazy(() => import("./pages/WhatsNew"));
const Changelog = lazy(() => import("./pages/Changelog"));
const Advertising = lazy(() => import("./pages/Advertising"));
const BecomeAffiliate = lazy(() => import("./pages/BecomeAffiliate"));
const FranchiseOpportunities = lazy(() => import("./pages/FranchiseOpportunities"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy load protected route components
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const CreatorProtectedRoute = lazy(() => import("./components/CreatorProtectedRoute"));
const BrandProtectedRoute = lazy(() => import("./components/BrandProtectedRoute"));
const FranchiseProtectedRoute = lazy(() => import("./components/FranchiseProtectedRoute"));
const AffiliateProtectedRoute = lazy(() => import("./components/AffiliateProtectedRoute"));

const queryClient = new QueryClient();

// Component to initialize site settings (favicon, meta tags)
const SiteSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  useSiteSettings();
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SiteSettingsProvider>
    <PushNotificationProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PageTransition>
          <Suspense fallback={<PageLoader />}>
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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </PageTransition>
        <CookieConsent />
      </BrowserRouter>
    </TooltipProvider>
    </PushNotificationProvider>
    </SiteSettingsProvider>
  </QueryClientProvider>
);

export default App;
