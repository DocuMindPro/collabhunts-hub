import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Influencers from "./pages/Influencers";
import Campaigns from "./pages/Campaigns";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Brand from "./pages/Brand";
import Creator from "./pages/Creator";
import BrandSignup from "./pages/BrandSignup";
import CreatorSignup from "./pages/CreatorSignup";
import CreatorProfile from "./pages/CreatorProfile";
import CreatorDashboard from "./pages/CreatorDashboard";
import BrandDashboard from "./pages/BrandDashboard";
import Admin from "./pages/Admin";
import BackupHistory from "./pages/BackupHistory";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import CreatorProtectedRoute from "./components/CreatorProtectedRoute";
import BrandProtectedRoute from "./components/BrandProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/influencers" element={<Influencers />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/brand" element={<Brand />} />
          <Route path="/creator" element={<Creator />} />
          <Route path="/brand-signup" element={<BrandSignup />} />
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
