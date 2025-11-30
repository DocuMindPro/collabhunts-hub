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
import { CheckCircle, XCircle, Eye, TrendingUp, DollarSign, Users, Building2, Palette, Search, KeyRound, CreditCard } from "lucide-react";
import AdminBrandSubscriptionsTab from "@/components/brand-dashboard/AdminBrandSubscriptionsTab";
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
  
  const { toast } = useToast();

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

      // Fetch creator profiles
      const { data: creatorProfilesData } = await supabase
        .from("creator_profiles")
        .select("id, user_id, display_name, status");

      // Fetch brand profiles
      const { data: brandProfilesData } = await supabase
        .from("brand_profiles")
        .select("id, user_id, company_name");

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

      <main className="flex-1 py-12 px-4 gradient-subtle">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-heading font-bold mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage users and platform settings</p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total Users
                </CardDescription>
                <CardTitle className="text-3xl">{stats.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Brands
                </CardDescription>
                <CardTitle className="text-3xl">{stats.brands}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Creators
                </CardDescription>
                <CardTitle className="text-3xl">{stats.creators}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Admins</CardDescription>
                <CardTitle className="text-3xl">{stats.admins}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Pending Approvals</CardDescription>
                <CardTitle className="text-3xl">{stats.pendingCreators}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList>
              <TabsTrigger value="users">All Users</TabsTrigger>
              <TabsTrigger value="approvals">
                Creator Approvals
                {stats.pendingCreators > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {stats.pendingCreators}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="subscriptions">
                <CreditCard className="h-4 w-4 mr-2" />
                Subscriptions
              </TabsTrigger>
              <TabsTrigger value="revenue">Revenue & Analytics</TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>All Users</CardTitle>
                      <CardDescription>View and manage platform users</CardDescription>
                    </div>
                    <div className="w-72">
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
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Full Name</TableHead>
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
                  )}
                </CardContent>
              </Card>
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

            {/* Revenue & Analytics Tab */}
            <TabsContent value="revenue">
              <div className="space-y-6">
                {/* Revenue Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        Platform Revenue (15%)
                      </CardDescription>
                      <CardTitle className="text-3xl text-green-600">
                        ${(revenueStats.totalRevenue / 100).toFixed(2)}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Total Volume
                      </CardDescription>
                      <CardTitle className="text-3xl">
                        ${(revenueStats.totalVolume / 100).toFixed(2)}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Active Bookings</CardDescription>
                      <CardTitle className="text-3xl">{revenueStats.activeBookings}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Completed</CardDescription>
                      <CardTitle className="text-3xl">{revenueStats.completedBookings}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardDescription>Avg Booking Value</CardDescription>
                      <CardTitle className="text-3xl">
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
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>All Transactions</CardTitle>
                        <CardDescription>
                          Complete transaction history with platform fees
                        </CardDescription>
                      </div>
                      <div className="flex gap-3">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-36">
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
                        <div className="relative w-64">
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

            {/* Brand Subscriptions Tab */}
            <TabsContent value="subscriptions">
              <AdminBrandSubscriptionsTab />
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
