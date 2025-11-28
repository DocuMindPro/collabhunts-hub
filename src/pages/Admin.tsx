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
import { CheckCircle, XCircle, Eye } from "lucide-react";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  user_type: string | null;
  created_at: string;
  roles: string[];
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

const Admin = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [pendingCreators, setPendingCreators] = useState<CreatorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCreators, setLoadingCreators] = useState(true);
  const [stats, setStats] = useState({ total: 0, brands: 0, creators: 0, admins: 0, pendingCreators: 0 });
  const [selectedCreator, setSelectedCreator] = useState<CreatorProfile | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchProfiles();
    fetchPendingCreators();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      const profilesWithRoles = (profilesData || []).map((profile) => ({
        ...profile,
        roles: (rolesData || [])
          .filter((role) => role.user_id === profile.id)
          .map((role) => role.role),
      }));

      setProfiles(profilesWithRoles);

      const total = profilesWithRoles.length;
      const brands = profilesWithRoles.filter((p) => p.user_type === "brand").length;
      const creators = profilesWithRoles.filter((p) => p.user_type === "creator").length;
      const admins = profilesWithRoles.filter((p) => p.roles.includes("admin")).length;

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
          // Fetch profile email
          const { data: profileData } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", creator.user_id)
            .single();

          // Fetch social accounts
          const { data: socialData } = await supabase
            .from("creator_social_accounts")
            .select("*")
            .eq("creator_profile_id", creator.id);

          // Fetch services
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
                <CardDescription>Total Users</CardDescription>
                <CardTitle className="text-3xl">{stats.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Brands</CardDescription>
                <CardTitle className="text-3xl">{stats.brands}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Creators</CardDescription>
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
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>View and manage platform users</CardDescription>
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
                          <TableHead>User Type</TableHead>
                          <TableHead>Roles</TableHead>
                          <TableHead>Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {profiles.map((profile) => (
                          <TableRow key={profile.id}>
                            <TableCell className="font-medium">{profile.email}</TableCell>
                            <TableCell>{profile.full_name || "—"}</TableCell>
                            <TableCell>
                              {profile.user_type ? (
                                <Badge variant="outline" className="capitalize">
                                  {profile.user_type}
                                </Badge>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {profile.roles.map((role) => (
                                  <Badge key={role} variant="secondary" className="capitalize">
                                    {role}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(profile.created_at).toLocaleDateString()}
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
          </Tabs>
        </div>
      </main>
    </div>
  );
};

const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <label className={`text-sm font-medium leading-none ${className}`}>{children}</label>
);

export default Admin;