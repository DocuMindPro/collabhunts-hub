import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Eye, TrendingUp, DollarSign, Users, Building2, Palette, Search, KeyRound, CreditCard, Megaphone, Database, FlaskConical, Phone, X, Gavel, BookOpen, BadgeCheck } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import AdminBrandSubscriptionsTab from "@/components/brand-dashboard/AdminBrandSubscriptionsTab";
import AdminCampaignsTab from "@/components/admin/AdminCampaignsTab";
import AdminTestingTab from "@/components/admin/AdminTestingTab";
import AdminCreatorsTab from "@/components/admin/AdminCreatorsTab";
import AdminBrandsTab from "@/components/admin/AdminBrandsTab";
import AdminDisputesTab from "@/components/admin/AdminDisputesTab";
import AdminPlatformManualTab from "@/components/admin/AdminPlatformManualTab";
import AdminVerificationsTab from "@/components/admin/AdminVerificationsTab";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  user_type: string | null;
  created_at: string;
  roles: string[];
  is_creator: boolean;
  is_brand: boolean;
  creator_status?: string;
  brand_name?: string;
  creator_display_name?: string;
  total_earned_cents?: number;
  total_spent_cents?: number;
  booking_count?: number;
  creator_phone?: string | null;
  creator_phone_verified?: boolean | null;
  brand_phone?: string | null;
  brand_phone_verified?: boolean | null;
}

interface CreatorProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string | null;
  location_city: string | null;
  location_state: string | null;
  location_country: string | null;
  categories: string[];
  status: string;
  rejection_reason: string | null;
  created_at: string;
  profiles?: {
    email: string;
  };
  creator_social_accounts?: Array<{
    platform: string;
    username: string;
    follower_count: number;
  }>;
  creator_services?: Array<{
    service_type: string;
    price_cents: number;
  }>;
}

interface Booking {
  id: string;
  created_at: string;
  booking_date: string | null;
  total_price_cents: number;
  platform_fee_cents: number;
  status: string;
  creator_profile_id: string;
  brand_profile_id: string;
  creator_profiles?: {
    display_name: string;
  };
  brand_profiles?: {
    company_name: string;
  };
  creator_services?: {
    service_type: string;
  };
}

interface RevenueStats {
  totalRevenue: number;
  totalVolume: number;
  activeBookings: number;
  completedBookings: number;
  avgBookingValue: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
  volume: number;
  bookings: number;
}

const Admin = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'users');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [pendingCreators, setPendingCreators] = useState<CreatorProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCreators, setLoadingCreators] = useState(true);
  const [loadingRevenue, setLoadingRevenue] = useState(true);
  const [stats, setStats] = useState({ total: 0, brands: 0, creators: 0, admins: 0, pendingCreators: 0 });
  const [revenueStats, setRevenueStats] = useState<RevenueStats>({
    totalRevenue: 0,
    totalVolume: 0,
    activeBookings: 0,
    completedBookings: 0,
    avgBookingValue: 0,
  });
  const [selectedCreator, setSelectedCreator] = useState<CreatorProfile | null>(null);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [resetPasswordUser, setResetPasswordUser] = useState<Profile | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  
  // Filters
  const [userSearch, setUserSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [transactionSearch, setTransactionSearch] = useState("");
  
  // Unified search
  const [globalSearch, setGlobalSearch] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const { toast } = useToast();

  // Unified search results
  interface SearchResult {
    type: "user" | "creator" | "brand" | "booking";
    id: string;
    title: string;
    subtitle: string;
    tab: string;
  }

  const getSearchResults = (): SearchResult[] => {
    if (!globalSearch.trim() || globalSearch.length < 2) return [];
    
    const query = globalSearch.toLowerCase();
    const results: SearchResult[] = [];
    
    // Search users
    profiles.forEach(p => {
      if (
        p.email.toLowerCase().includes(query) ||
        p.full_name?.toLowerCase().includes(query) ||
        p.brand_name?.toLowerCase().includes(query) ||
        p.creator_display_name?.toLowerCase().includes(query)
      ) {
        results.push({
          type: "user",
          id: p.id,
          title: p.email,
          subtitle: p.is_creator ? `Creator: ${p.creator_display_name}` : p.is_brand ? `Brand: ${p.brand_name}` : "User",
          tab: "users"
        });
      }
    });

    // Search pending creators
    pendingCreators.forEach(c => {
      if (
        c.display_name.toLowerCase().includes(query) ||
        c.profiles?.email?.toLowerCase().includes(query)
      ) {
        results.push({
          type: "creator",
          id: c.id,
          title: c.display_name,
          subtitle: `Pending Creator • ${c.profiles?.email}`,
          tab: "approvals"
        });
      }
    });

    // Search bookings
    bookings.forEach(b => {
      if (
        b.creator_profiles?.display_name?.toLowerCase().includes(query) ||
        b.brand_profiles?.company_name?.toLowerCase().includes(query) ||
        b.creator_services?.service_type?.toLowerCase().includes(query)
      ) {
        results.push({
          type: "booking",
          id: b.id,
          title: `${b.brand_profiles?.company_name} → ${b.creator_profiles?.display_name}`,
          subtitle: `$${(b.total_price_cents / 100).toFixed(2)} • ${b.status}`,
          tab: "revenue"
        });
      }
    });

    return results.slice(0, 10); // Limit to 10 results
  };

  const searchResults = getSearchResults();

  const handleSearchResultClick = (result: SearchResult) => {
    setGlobalSearch("");
    setShowSearchResults(false);
    handleTabChange(result.tab);
    
    // Set the local search filter for that tab
    if (result.tab === "users") {
      setUserSearch(result.title);
    } else if (result.tab === "revenue") {
      setTransactionSearch(result.title.split(" → ")[0]);
    }
  };

  // Sync active tab with URL params
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

  useEffect(() => {
    fetchProfiles();
    fetchPendingCreators();
    fetchBookingsAndRevenue();
  }, []);

  useEffect(() => {
    // Filter profiles based on search
    const filtered = profiles.filter(profile => 
      profile.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      profile.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      profile.brand_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      profile.creator_display_name?.toLowerCase().includes(userSearch.toLowerCase())
    );
    setFilteredProfiles(filtered);
  }, [userSearch, profiles]);

  useEffect(() => {
    // Filter bookings based on status and search
    let filtered = bookings;
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(b => b.status === statusFilter);
    }
    
    if (transactionSearch) {
      filtered = filtered.filter(b =>
        b.creator_profiles?.display_name?.toLowerCase().includes(transactionSearch.toLowerCase()) ||
        b.brand_profiles?.company_name?.toLowerCase().includes(transactionSearch.toLowerCase()) ||
        b.creator_services?.service_type?.toLowerCase().includes(transactionSearch.toLowerCase())
      );
    }
    
    setFilteredBookings(filtered);
  }, [statusFilter, transactionSearch, bookings]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Fetch creator profiles with phone
      const { data: creatorProfilesData } = await supabase
        .from("creator_profiles")
        .select("id, user_id, display_name, status, phone_number, phone_verified");

      // Fetch brand profiles with phone
      const { data: brandProfilesData } = await supabase
        .from("brand_profiles")
        .select("id, user_id, company_name, phone_number, phone_verified");

      // Fetch all bookings for stats calculations
      const { data: allBookingsData } = await supabase
        .from("bookings")
        .select("creator_profile_id, brand_profile_id, total_price_cents, status");

      const profilesWithDetails = (profilesData || []).map((profile) => {
        const roles = (rolesData || [])
          .filter((role) => role.user_id === profile.id)
          .map((role) => role.role);

        const creatorProfile = creatorProfilesData?.find((cp) => cp.user_id === profile.id);
        const brandProfile = brandProfilesData?.find((bp) => bp.user_id === profile.id);

        // Calculate earnings for creators (85% of completed bookings)
        let totalEarned = 0;
        let creatorBookingCount = 0;
        if (creatorProfile) {
          const creatorBookings = (allBookingsData || []).filter(
            b => b.creator_profile_id === creatorProfile.id && b.status === "completed"
          );
          totalEarned = creatorBookings.reduce((sum, b) => sum + (b.total_price_cents * 0.85), 0);
          creatorBookingCount = creatorBookings.length;
        }

        // Calculate spending for brands (100% of completed bookings)
        let totalSpent = 0;
        let brandBookingCount = 0;
        if (brandProfile) {
          const brandBookings = (allBookingsData || []).filter(
            b => b.brand_profile_id === brandProfile.id && b.status === "completed"
          );
          totalSpent = brandBookings.reduce((sum, b) => sum + b.total_price_cents, 0);
          brandBookingCount = brandBookings.length;
        }

        return {
          ...profile,
          roles,
          is_creator: !!creatorProfile,
          is_brand: !!brandProfile,
          creator_status: creatorProfile?.status,
          creator_display_name: creatorProfile?.display_name,
          brand_name: brandProfile?.company_name,
          total_earned_cents: totalEarned,
          total_spent_cents: totalSpent,
          booking_count: creatorProfile ? creatorBookingCount : brandBookingCount,
          creator_phone: creatorProfile?.phone_number,
          creator_phone_verified: creatorProfile?.phone_verified,
          brand_phone: brandProfile?.phone_number,
          brand_phone_verified: brandProfile?.phone_verified,
        };
      });

      setProfiles(profilesWithDetails);
      setFilteredProfiles(profilesWithDetails);

      const total = profilesWithDetails.length;
      const brands = profilesWithDetails.filter((p) => p.is_brand).length;
      const creators = profilesWithDetails.filter((p) => p.is_creator).length;
      const admins = profilesWithDetails.filter((p) => p.roles.includes("admin")).length;

      setStats(prev => ({ ...prev, total, brands, creators, admins }));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCreators = async () => {
    try {
      setLoadingCreators(true);

      const { data: creatorsData, error: creatorsError } = await supabase
        .from("creator_profiles")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (creatorsError) throw creatorsError;

      if (!creatorsData || creatorsData.length === 0) {
        setPendingCreators([]);
        setStats(prev => ({ ...prev, pendingCreators: 0 }));
        return;
      }

      // Fetch related data for each creator
      const creatorsWithDetails = await Promise.all(
        creatorsData.map(async (creator) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", creator.user_id)
            .single();

          const { data: socialData } = await supabase
            .from("creator_social_accounts")
            .select("*")
            .eq("creator_profile_id", creator.id);

          const { data: servicesData } = await supabase
            .from("creator_services")
            .select("*")
            .eq("creator_profile_id", creator.id);

          return {
            ...creator,
            profiles: profileData || { email: "N/A" },
            creator_social_accounts: socialData || [],
            creator_services: servicesData || []
          };
        })
      );

      setPendingCreators(creatorsWithDetails);
      setStats(prev => ({ ...prev, pendingCreators: creatorsWithDetails.length }));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingCreators(false);
    }
  };

  const handleApprove = async (creatorId: string) => {
    try {
      const { error } = await supabase
        .from("creator_profiles")
        .update({ status: "approved" })
        .eq("id", creatorId);

      if (error) throw error;

      toast({
        title: "Creator Approved",
        description: "The creator profile has been approved successfully."
      });

      fetchPendingCreators();
      setSelectedCreator(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleReject = async (creatorId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("creator_profiles")
        .update({ 
          status: "rejected",
          rejection_reason: rejectionReason
        })
        .eq("id", creatorId);

      if (error) throw error;

      toast({
        title: "Creator Rejected",
        description: "The creator profile has been rejected."
      });

      fetchPendingCreators();
      setSelectedCreator(null);
      setRejectionReason("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchBookingsAndRevenue = async () => {
    try {
      setLoadingRevenue(true);

      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select(`
          *,
          creator_profiles(display_name),
          brand_profiles(company_name),
          creator_services(service_type)
        `)
        .order("created_at", { ascending: false });

      if (bookingsError) throw bookingsError;

      setBookings(bookingsData || []);
      setFilteredBookings(bookingsData || []);

      // Calculate revenue stats
      const completedBookings = (bookingsData || []).filter((b) => b.status === "completed");
      const activeBookings = (bookingsData || []).filter(
        (b) => b.status === "pending" || b.status === "accepted"
      );

      const totalRevenue = completedBookings.reduce(
        (sum, b) => sum + (b.platform_fee_cents || 0),
        0
      );

      const totalVolume = completedBookings.reduce(
        (sum, b) => sum + b.total_price_cents,
        0
      );

      const avgBookingValue = completedBookings.length > 0
        ? totalVolume / completedBookings.length
        : 0;

      setRevenueStats({
        totalRevenue,
        totalVolume,
        activeBookings: activeBookings.length,
        completedBookings: completedBookings.length,
        avgBookingValue,
      });

      // Calculate monthly data for chart
      const monthlyMap = new Map<string, { revenue: number; volume: number; bookings: number }>();
      
      completedBookings.forEach(booking => {
        const date = new Date(booking.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        const existing = monthlyMap.get(monthKey) || { revenue: 0, volume: 0, bookings: 0 };
        monthlyMap.set(monthKey, {
          revenue: existing.revenue + (booking.platform_fee_cents || 0),
          volume: existing.volume + booking.total_price_cents,
          bookings: existing.bookings + 1
        });
      });

      const monthly = Array.from(monthlyMap.entries())
        .map(([month, data]) => ({
          month: new Date(month + "-01").toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          revenue: data.revenue / 100,
          volume: data.volume / 100,
          bookings: data.bookings
        }))
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
        .slice(-6); // Last 6 months

      setMonthlyData(monthly);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingRevenue(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordUser || !newPassword) return;

    if (newPassword.length < 6) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsResettingPassword(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke('admin-reset-password', {
        body: {
          userId: resetPasswordUser.id,
          newPassword: newPassword,
        },
      });

      if (error) throw error;

      toast({
        title: "Password Reset",
        description: `Password successfully reset for ${resetPasswordUser.email}`,
      });

      setResetPasswordUser(null);
      setNewPassword("");
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-4 md:py-12 px-4 gradient-subtle">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-8">
            <div>
              <h1 className="text-2xl md:text-4xl font-heading font-bold mb-1 md:mb-2">Admin Dashboard</h1>
              <p className="text-sm md:text-base text-muted-foreground">Manage users and platform settings</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm" className="md:size-default">
                <Link to="/backup-history">
                  <Database className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Backups</span>
                </Link>
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm" className="md:size-default">
                Logout
              </Button>
            </div>
          </div>

          {/* Unified Global Search */}
          <div className="relative mb-4 md:mb-6">
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search across users, creators, brands, bookings..."
                value={globalSearch}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                className="pl-10 pr-10 h-12 text-base"
              />
              {globalSearch && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => {
                    setGlobalSearch("");
                    setShowSearchResults(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* Search Results Dropdown */}
            {showSearchResults && globalSearch.length >= 2 && (
              <div className="absolute top-full left-0 right-0 max-w-xl mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No results found for "{globalSearch}"
                  </div>
                ) : (
                  <>
                    <div className="p-2 border-b text-xs text-muted-foreground font-medium">
                      {searchResults.length} results found
                    </div>
                    {searchResults.map((result) => (
                      <button
                        key={`${result.type}-${result.id}`}
                        className="w-full text-left px-4 py-3 hover:bg-muted/50 flex items-center gap-3 border-b last:border-b-0"
                        onClick={() => handleSearchResultClick(result)}
                      >
                        <div className="shrink-0">
                          {result.type === "user" && <Users className="h-4 w-4 text-muted-foreground" />}
                          {result.type === "creator" && <Palette className="h-4 w-4 text-muted-foreground" />}
                          {result.type === "brand" && <Building2 className="h-4 w-4 text-muted-foreground" />}
                          {result.type === "booking" && <DollarSign className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{result.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                        </div>
                        <Badge variant="outline" className="shrink-0 capitalize text-xs">
                          {result.tab}
                        </Badge>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6 mb-4 md:mb-8">
            <Card>
              <CardHeader className="p-3 md:p-6 pb-3">
                <CardDescription className="flex items-center gap-2 text-xs md:text-sm">
                  <Users className="h-4 w-4" />
                  Total Users
                </CardDescription>
                <CardTitle className="text-2xl md:text-3xl">{stats.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="p-3 md:p-6 pb-3">
                <CardDescription className="flex items-center gap-2 text-xs md:text-sm">
                  <Building2 className="h-4 w-4" />
                  Brands
                </CardDescription>
                <CardTitle className="text-2xl md:text-3xl">{stats.brands}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="p-3 md:p-6 pb-3">
                <CardDescription className="flex items-center gap-2 text-xs md:text-sm">
                  <Palette className="h-4 w-4" />
                  Creators
                </CardDescription>
                <CardTitle className="text-2xl md:text-3xl">{stats.creators}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="p-3 md:p-6 pb-3">
                <CardDescription className="text-xs md:text-sm">Admins</CardDescription>
                <CardTitle className="text-2xl md:text-3xl">{stats.admins}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="p-3 md:p-6 pb-3">
                <CardDescription className="text-xs md:text-sm">Pending</CardDescription>
                <CardTitle className="text-2xl md:text-3xl">{stats.pendingCreators}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4 md:space-y-6">
            <TabsList className="flex w-full overflow-x-auto gap-1 lg:w-auto lg:inline-flex h-auto p-1">
              <TabsTrigger value="users" className="gap-2 shrink-0">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">All Users</span>
              </TabsTrigger>
              <TabsTrigger value="creators" className="gap-2 shrink-0">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Creators</span>
              </TabsTrigger>
              <TabsTrigger value="brands" className="gap-2 shrink-0">
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Brands</span>
              </TabsTrigger>
              <TabsTrigger value="approvals" className="gap-2 shrink-0">
                <CheckCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Approvals</span>
                {stats.pendingCreators > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {stats.pendingCreators}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="campaigns" className="gap-2 shrink-0">
                <Megaphone className="h-4 w-4" />
                <span className="hidden sm:inline">Campaigns</span>
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="gap-2 shrink-0">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Subscriptions</span>
              </TabsTrigger>
              <TabsTrigger value="revenue" className="gap-2 shrink-0">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Revenue</span>
              </TabsTrigger>
              <TabsTrigger value="testing" className="gap-2 shrink-0">
                <FlaskConical className="h-4 w-4" />
                <span className="hidden sm:inline">Testing</span>
              </TabsTrigger>
              <TabsTrigger value="disputes" className="gap-2 shrink-0">
                <Gavel className="h-4 w-4" />
                <span className="hidden sm:inline">Disputes</span>
              </TabsTrigger>
              <TabsTrigger value="manual" className="gap-2 shrink-0">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Manual</span>
              </TabsTrigger>
              <TabsTrigger value="verifications" className="gap-2 shrink-0">
                <BadgeCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Verifications</span>
              </TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg md:text-xl">All Users</CardTitle>
                      <CardDescription className="text-xs md:text-sm">View and manage platform users</CardDescription>
                    </div>
                    <div className="w-full sm:w-72">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search users..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto -mx-4 md:mx-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Full Name</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Account Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Total Activity</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProfiles.map((profile) => (
                          <TableRow key={profile.id}>
                            <TableCell className="font-medium">{profile.email}</TableCell>
                            <TableCell>{profile.full_name || "—"}</TableCell>
                            <TableCell>
                              {(() => {
                                const phone = profile.creator_phone || profile.brand_phone;
                                const verified = profile.creator_phone ? profile.creator_phone_verified : profile.brand_phone_verified;
                                if (!phone) return <span className="text-muted-foreground">—</span>;
                                return (
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-sm">{phone}</span>
                                    {verified ? (
                                      <CheckCircle className="h-3 w-3 text-green-500" />
                                    ) : (
                                      <XCircle className="h-3 w-3 text-red-500" />
                                    )}
                                  </div>
                                );
                              })()}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {profile.is_creator && (
                                  <Badge variant="outline" className="gap-1">
                                    <Palette className="h-3 w-3" />
                                    Creator
                                  </Badge>
                                )}
                                {profile.is_brand && (
                                  <Badge variant="outline" className="gap-1">
                                    <Building2 className="h-3 w-3" />
                                    Brand
                                  </Badge>
                                )}
                                {profile.roles.includes("admin") && (
                                  <Badge variant="secondary" className="gap-1">
                                    Admin
                                  </Badge>
                                )}
                                {!profile.is_creator && !profile.is_brand && profile.roles.length === 0 && "—"}
                              </div>
                            </TableCell>
                            <TableCell>
                              {profile.is_creator && profile.creator_status && (
                                <Badge
                                  variant={
                                    profile.creator_status === "approved"
                                      ? "default"
                                      : profile.creator_status === "pending"
                                      ? "secondary"
                                      : "destructive"
                                  }
                                  className="capitalize"
                                >
                                  {profile.creator_status}
                                </Badge>
                              )}
                              {profile.is_brand && !profile.is_creator && (
                                <Badge variant="default">Active</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {profile.is_creator && profile.total_earned_cents && profile.total_earned_cents > 0 ? (
                                <span className="text-green-600 font-medium">
                                  ${(profile.total_earned_cents / 100).toFixed(2)} earned
                                </span>
                              ) : profile.is_brand && profile.total_spent_cents && profile.total_spent_cents > 0 ? (
                                <span className="text-blue-600 font-medium">
                                  ${(profile.total_spent_cents / 100).toFixed(2)} spent
                                </span>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                            <TableCell>
                              {new Date(profile.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedUser(profile)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setResetPasswordUser(profile)}
                                  title="Reset Password"
                                >
                                  <KeyRound className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Creators Tab */}
            <TabsContent value="creators">
              <AdminCreatorsTab />
            </TabsContent>

            {/* Brands Tab */}
            <TabsContent value="brands">
              <AdminBrandsTab />
            </TabsContent>

            {/* Creator Approvals Tab */}
            <TabsContent value="approvals">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Creator Approvals</CardTitle>
                  <CardDescription>Review and approve creator applications</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingCreators ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : pendingCreators.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No pending creator applications
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {pendingCreators.map((creator) => (
                        <div key={creator.id} className="border rounded-lg p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-heading font-semibold text-xl">{creator.display_name}</h3>
                              <p className="text-sm text-muted-foreground">{creator.profiles?.email}</p>
                            </div>
                            <Badge variant="secondary">Pending</Badge>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="font-semibold mb-2">Bio</h4>
                              <p className="text-sm text-muted-foreground">{creator.bio || "No bio provided"}</p>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">Location</h4>
                              <p className="text-sm text-muted-foreground">
                                {[creator.location_city, creator.location_state, creator.location_country]
                                  .filter(Boolean)
                                  .join(", ") || "No location provided"}
                              </p>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">Categories</h4>
                              <div className="flex flex-wrap gap-1">
                                {creator.categories.map((cat) => (
                                  <Badge key={cat} variant="outline" className="text-xs">
                                    {cat}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">Social Accounts</h4>
                              <div className="space-y-1">
                                {creator.creator_social_accounts?.map((account, idx) => (
                                  <p key={idx} className="text-sm text-muted-foreground capitalize">
                                    {account.platform}: @{account.username} ({account.follower_count.toLocaleString()} followers)
                                  </p>
                                )) || <p className="text-sm text-muted-foreground">No accounts added</p>}
                              </div>
                            </div>
                          </div>

                          <div className="mb-4">
                            <h4 className="font-semibold mb-2">Services</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {creator.creator_services?.map((service, idx) => (
                                <div key={idx} className="text-sm bg-muted p-2 rounded">
                                  <span className="font-medium capitalize">{service.service_type.replace(/_/g, " ")}</span>
                                  {" "}• ${(service.price_cents / 100).toFixed(2)}
                                </div>
                              )) || <p className="text-sm text-muted-foreground col-span-2">No services added</p>}
                            </div>
                          </div>

                          {selectedCreator?.id === creator.id ? (
                            <div className="space-y-3 border-t pt-4">
                              <div>
                                <Label>Rejection Reason</Label>
                                <Textarea
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  placeholder="Provide a detailed reason for rejection..."
                                  rows={3}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="destructive"
                                  onClick={() => handleReject(creator.id)}
                                  className="flex-1"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Confirm Rejection
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedCreator(null);
                                    setRejectionReason("");
                                  }}
                                  className="flex-1"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2 border-t pt-4">
                              <Button
                                onClick={() => handleApprove(creator.id)}
                                className="gradient-hero hover:opacity-90 flex-1"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => setSelectedCreator(creator)}
                                className="flex-1"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Campaigns Tab */}
            <TabsContent value="campaigns">
              <AdminCampaignsTab />
            </TabsContent>

            {/* Brand Subscriptions Tab */}
            <TabsContent value="subscriptions">
              <AdminBrandSubscriptionsTab />
            </TabsContent>

            {/* Revenue & Analytics Tab */}
            <TabsContent value="revenue">
              <div className="space-y-6">
                {/* Revenue Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6">
                  <Card>
                    <CardHeader className="p-3 md:p-6 pb-3">
                      <CardDescription className="flex items-center gap-2 text-xs md:text-sm">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="hidden sm:inline">Platform</span> Revenue
                      </CardDescription>
                      <CardTitle className="text-xl md:text-3xl text-green-600">
                        ${(revenueStats.totalRevenue / 100).toFixed(2)}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="p-3 md:p-6 pb-3">
                      <CardDescription className="flex items-center gap-2 text-xs md:text-sm">
                        <TrendingUp className="h-4 w-4" />
                        Total Volume
                      </CardDescription>
                      <CardTitle className="text-xl md:text-3xl">
                        ${(revenueStats.totalVolume / 100).toFixed(2)}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="p-3 md:p-6 pb-3">
                      <CardDescription className="text-xs md:text-sm">Active</CardDescription>
                      <CardTitle className="text-xl md:text-3xl">{revenueStats.activeBookings}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="p-3 md:p-6 pb-3">
                      <CardDescription className="text-xs md:text-sm">Completed</CardDescription>
                      <CardTitle className="text-xl md:text-3xl">{revenueStats.completedBookings}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="p-3 md:p-6 pb-3">
                      <CardDescription className="text-xs md:text-sm">Avg Value</CardDescription>
                      <CardTitle className="text-xl md:text-3xl">
                        ${(revenueStats.avgBookingValue / 100).toFixed(2)}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                {/* Revenue Chart */}
                {monthlyData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue Trends</CardTitle>
                      <CardDescription>Monthly platform revenue and booking volume</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="month" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            name="Platform Revenue ($)"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="volume" 
                            stroke="hsl(var(--chart-2))" 
                            strokeWidth={2}
                            name="Total Volume ($)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Transactions Table */}
                <Card>
                  <CardHeader className="p-4 md:p-6">
                    <div className="flex flex-col gap-4">
                      <div>
                        <CardTitle className="text-lg md:text-xl">All Transactions</CardTitle>
                        <CardDescription className="text-xs md:text-sm">
                          Transaction history with platform fees
                        </CardDescription>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-full sm:w-36">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="relative w-full sm:w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search transactions..."
                            value={transactionSearch}
                            onChange={(e) => setTransactionSearch(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingRevenue ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : filteredBookings.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No transactions found
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Creator</TableHead>
                              <TableHead>Brand</TableHead>
                              <TableHead>Service</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Total Amount</TableHead>
                              <TableHead className="text-right">Platform Fee (15%)</TableHead>
                              <TableHead className="text-right">Creator Payout (85%)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredBookings.map((booking) => {
                              const creatorPayout = booking.total_price_cents - (booking.platform_fee_cents || 0);
                              return (
                                <TableRow key={booking.id}>
                                  <TableCell>
                                    {new Date(booking.created_at).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    {booking.creator_profiles?.display_name || "N/A"}
                                  </TableCell>
                                  <TableCell>
                                    {booking.brand_profiles?.company_name || "N/A"}
                                  </TableCell>
                                  <TableCell>
                                    <span className="capitalize">
                                      {booking.creator_services?.service_type?.replace(/_/g, " ") || "N/A"}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        booking.status === "completed"
                                          ? "default"
                                          : booking.status === "pending"
                                          ? "secondary"
                                          : booking.status === "accepted"
                                          ? "outline"
                                          : "destructive"
                                      }
                                      className="capitalize"
                                    >
                                      {booking.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right font-medium">
                                    ${(booking.total_price_cents / 100).toFixed(2)}
                                  </TableCell>
                                  <TableCell className="text-right text-green-600 font-medium">
                                    ${((booking.platform_fee_cents || 0) / 100).toFixed(2)}
                                  </TableCell>
                                  <TableCell className="text-right font-medium">
                                    ${(creatorPayout / 100).toFixed(2)}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Testing Tab */}
            <TabsContent value="testing">
              <AdminTestingTab />
            </TabsContent>

            {/* Disputes Tab */}
            <TabsContent value="disputes">
              <AdminDisputesTab />
            </TabsContent>

            {/* Platform Manual Tab */}
            <TabsContent value="manual">
              <AdminPlatformManualTab />
            </TabsContent>

            {/* Verifications Tab */}
            <TabsContent value="verifications">
              <AdminVerificationsTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetPasswordUser} onOpenChange={(open) => {
        if (!open) {
          setResetPasswordUser(null);
          setNewPassword("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Set a new password for this user account
            </p>
          </DialogHeader>
          {resetPasswordUser && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Reset password for <span className="font-semibold">{resetPasswordUser.email}</span>
                </p>
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <Input
                    type="password"
                    placeholder="Enter new password (min 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isResettingPassword}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setResetPasswordUser(null);
                    setNewPassword("");
                  }}
                  disabled={isResettingPassword}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleResetPassword}
                  disabled={isResettingPassword || !newPassword || newPassword.length < 6}
                >
                  {isResettingPassword ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Email</h4>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Full Name</h4>
                  <p className="font-medium">{selectedUser.full_name || "—"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Joined</h4>
                  <p className="font-medium">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Account Type</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedUser.is_creator && (
                      <Badge variant="outline" className="gap-1">
                        <Palette className="h-3 w-3" />
                        Creator
                      </Badge>
                    )}
                    {selectedUser.is_brand && (
                      <Badge variant="outline" className="gap-1">
                        <Building2 className="h-3 w-3" />
                        Brand
                      </Badge>
                    )}
                    {selectedUser.roles.includes("admin") && (
                      <Badge variant="secondary">Admin</Badge>
                    )}
                  </div>
                </div>
              </div>

              {selectedUser.is_creator && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Creator Profile</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Display Name</h4>
                      <p className="font-medium">{selectedUser.creator_display_name || "—"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                      <Badge
                        variant={
                          selectedUser.creator_status === "approved"
                            ? "default"
                            : selectedUser.creator_status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                        className="capitalize"
                      >
                        {selectedUser.creator_status}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Total Earned</h4>
                      <p className="font-medium text-green-600">
                        ${((selectedUser.total_earned_cents || 0) / 100).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Completed Bookings</h4>
                      <p className="font-medium">{selectedUser.booking_count || 0}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedUser.is_brand && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Brand Profile</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Company Name</h4>
                      <p className="font-medium">{selectedUser.brand_name || "—"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Total Spent</h4>
                      <p className="font-medium text-blue-600">
                        ${((selectedUser.total_spent_cents || 0) / 100).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Completed Bookings</h4>
                      <p className="font-medium">{selectedUser.booking_count || 0}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <label className={`text-sm font-medium leading-none ${className}`}>{children}</label>
);

export default Admin;
