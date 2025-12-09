import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Eye, Phone, CheckCircle, XCircle, MapPin, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface CreatorData {
  id: string;
  user_id: string;
  display_name: string;
  bio: string | null;
  phone_number: string | null;
  phone_verified: boolean | null;
  profile_image_url: string | null;
  location_city: string | null;
  location_state: string | null;
  location_country: string | null;
  categories: string[];
  status: string;
  gender: string | null;
  ethnicity: string | null;
  primary_language: string | null;
  secondary_languages: string[] | null;
  created_at: string;
  email?: string;
  total_followers?: number;
  services_count?: number;
  total_earned_cents?: number;
}

const AdminCreatorsTab = () => {
  const [creators, setCreators] = useState<CreatorData[]>([]);
  const [filteredCreators, setFilteredCreators] = useState<CreatorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCreator, setSelectedCreator] = useState<CreatorData | null>(null);
  
  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [phoneFilter, setPhoneFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  
  const { toast } = useToast();

  // Get unique values for filter dropdowns
  const countries = [...new Set(creators.map(c => c.location_country).filter(Boolean))];
  const categories = [...new Set(creators.flatMap(c => c.categories || []))];

  useEffect(() => {
    fetchCreators();
  }, []);

  useEffect(() => {
    let filtered = creators;

    // Search filter
    if (search) {
      filtered = filtered.filter(c =>
        c.display_name.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone_number?.includes(search)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    // Phone verification filter
    if (phoneFilter !== "all") {
      filtered = filtered.filter(c => 
        phoneFilter === "verified" ? c.phone_verified : !c.phone_verified
      );
    }

    // Country filter
    if (countryFilter !== "all") {
      filtered = filtered.filter(c => c.location_country === countryFilter);
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(c => c.categories?.includes(categoryFilter));
    }

    // Gender filter
    if (genderFilter !== "all") {
      filtered = filtered.filter(c => c.gender === genderFilter);
    }

    setFilteredCreators(filtered);
  }, [search, statusFilter, phoneFilter, countryFilter, categoryFilter, genderFilter, creators]);

  const fetchCreators = async () => {
    try {
      setLoading(true);

      // Fetch all creator profiles
      const { data: creatorsData, error: creatorsError } = await supabase
        .from("creator_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (creatorsError) throw creatorsError;

      if (!creatorsData) {
        setCreators([]);
        return;
      }

      // Fetch related data
      const userIds = creatorsData.map(c => c.user_id);
      const creatorIds = creatorsData.map(c => c.id);

      const [profilesRes, socialsRes, servicesRes, bookingsRes] = await Promise.all([
        supabase.from("profiles").select("id, email").in("id", userIds),
        supabase.from("creator_social_accounts").select("creator_profile_id, follower_count").in("creator_profile_id", creatorIds),
        supabase.from("creator_services").select("creator_profile_id").in("creator_profile_id", creatorIds),
        supabase.from("bookings").select("creator_profile_id, total_price_cents, status").in("creator_profile_id", creatorIds)
      ]);

      const creatorsWithDetails = creatorsData.map(creator => {
        const profile = profilesRes.data?.find(p => p.id === creator.user_id);
        const socials = socialsRes.data?.filter(s => s.creator_profile_id === creator.id) || [];
        const services = servicesRes.data?.filter(s => s.creator_profile_id === creator.id) || [];
        const completedBookings = bookingsRes.data?.filter(
          b => b.creator_profile_id === creator.id && b.status === "completed"
        ) || [];

        return {
          ...creator,
          email: profile?.email,
          total_followers: socials.reduce((sum, s) => sum + (s.follower_count || 0), 0),
          services_count: services.length,
          total_earned_cents: completedBookings.reduce((sum, b) => sum + (b.total_price_cents * 0.85), 0)
        };
      });

      setCreators(creatorsWithDetails);
      setFilteredCreators(creatorsWithDetails);
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

  const handleApprove = async (creatorId: string) => {
    try {
      const { error } = await supabase
        .from("creator_profiles")
        .update({ status: "approved" })
        .eq("id", creatorId);

      if (error) throw error;

      toast({ title: "Creator Approved" });
      fetchCreators();
      setSelectedCreator(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleReject = async (creatorId: string) => {
    try {
      const { error } = await supabase
        .from("creator_profiles")
        .update({ status: "rejected" })
        .eq("id", creatorId);

      if (error) throw error;

      toast({ title: "Creator Rejected" });
      fetchCreators();
      setSelectedCreator(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const PhoneDisplay = ({ phone, verified }: { phone?: string | null; verified?: boolean | null }) => {
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
  };

  return (
    <Card>
      <CardHeader className="p-4 md:p-6">
        <div className="flex flex-col gap-4">
          <div>
            <CardTitle className="text-lg md:text-xl">All Creators</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Comprehensive creator management ({filteredCreators.length} of {creators.length})
            </CardDescription>
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            <div className="col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={phoneFilter} onValueChange={setPhoneFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Phone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Phones</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>

            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map(country => (
                  <SelectItem key={country} value={country!}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="non-binary">Non-binary</SelectItem>
                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 md:p-6 pt-0">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredCreators.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No creators found
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Creator</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Followers</TableHead>
                  <TableHead>Earnings</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCreators.map((creator) => (
                  <TableRow key={creator.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={creator.profile_image_url || undefined} />
                          <AvatarFallback>{creator.display_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{creator.display_name}</p>
                          <p className="text-xs text-muted-foreground">{creator.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <PhoneDisplay phone={creator.phone_number} verified={creator.phone_verified} />
                    </TableCell>
                    <TableCell>
                      {creator.location_country ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {[creator.location_city, creator.location_country].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          creator.status === "approved"
                            ? "default"
                            : creator.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                        className="capitalize"
                      >
                        {creator.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {creator.total_followers?.toLocaleString() || "0"}
                    </TableCell>
                    <TableCell>
                      {creator.total_earned_cents && creator.total_earned_cents > 0 ? (
                        <span className="text-green-600 font-medium">
                          ${(creator.total_earned_cents / 100).toFixed(2)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(creator.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCreator(creator)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <Link to={`/creator/${creator.id}`} target="_blank">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
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

      {/* Creator Detail Modal */}
      <Dialog open={!!selectedCreator} onOpenChange={() => setSelectedCreator(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Creator Details</DialogTitle>
          </DialogHeader>
          {selectedCreator && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedCreator.profile_image_url || undefined} />
                  <AvatarFallback className="text-xl">{selectedCreator.display_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedCreator.display_name}</h3>
                  <p className="text-muted-foreground">{selectedCreator.email}</p>
                  <PhoneDisplay phone={selectedCreator.phone_number} verified={selectedCreator.phone_verified} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm mb-1">Status</h4>
                  <Badge variant={selectedCreator.status === "approved" ? "default" : selectedCreator.status === "pending" ? "secondary" : "destructive"} className="capitalize">
                    {selectedCreator.status}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Location</h4>
                  <p className="text-sm text-muted-foreground">
                    {[selectedCreator.location_city, selectedCreator.location_state, selectedCreator.location_country].filter(Boolean).join(", ") || "—"}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Gender</h4>
                  <p className="text-sm text-muted-foreground capitalize">{selectedCreator.gender || "—"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Ethnicity</h4>
                  <p className="text-sm text-muted-foreground capitalize">{selectedCreator.ethnicity || "—"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Primary Language</h4>
                  <p className="text-sm text-muted-foreground">{selectedCreator.primary_language || "—"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Total Followers</h4>
                  <p className="text-sm text-muted-foreground">{selectedCreator.total_followers?.toLocaleString() || "0"}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-1">Bio</h4>
                <p className="text-sm text-muted-foreground">{selectedCreator.bio || "No bio provided"}</p>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Categories</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedCreator.categories?.map((cat) => (
                    <Badge key={cat} variant="outline" className="text-xs">{cat}</Badge>
                  )) || <span className="text-sm text-muted-foreground">None</span>}
                </div>
              </div>

              {selectedCreator.status === "pending" && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={() => handleApprove(selectedCreator.id)} className="flex-1">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button variant="destructive" onClick={() => handleReject(selectedCreator.id)} className="flex-1">
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminCreatorsTab;
