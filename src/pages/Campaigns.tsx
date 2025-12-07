import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, DollarSign, Users, Search } from "lucide-react";
import { formatPrice } from "@/lib/stripe-mock";
import { toast } from "sonner";

interface Campaign {
  id: string;
  title: string;
  description: string;
  campaign_type: string;
  budget_cents: number;
  spots_available: number;
  spots_filled: number;
  deadline: string;
  requirements: string;
  created_at: string;
  brand_profile_id: string;
  brand_profiles: {
    company_name: string;
    logo_url: string;
  } | null;
}

const Campaigns = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [user, setUser] = useState<any>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [isBrand, setIsBrand] = useState(false);
  const [brandProfileId, setBrandProfileId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    fetchCampaigns();
  }, []);

  useEffect(() => {
    filterCampaigns();
  }, [campaigns, searchQuery, filterType]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (user) {
      // Check if user is a creator
      const { data: creatorProfile } = await supabase
        .from('creator_profiles')
        .select('id, status')
        .eq('user_id', user.id)
        .single();
      
      setIsCreator(creatorProfile?.status === 'approved');

      // Check if user is a brand
      const { data: brandProfile } = await supabase
        .from('brand_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (brandProfile) {
        setIsBrand(true);
        setBrandProfileId(brandProfile.id);
      }
    }
  };

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          brand_profiles(company_name, logo_url)
        `)
        .eq('status', 'active')
        .gt('deadline', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const filterCampaigns = () => {
    let filtered = campaigns;

    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.brand_profiles?.company_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter(c => c.campaign_type === filterType);
    }

    setFilteredCampaigns(filtered);
  };

  const handleApply = (campaignId: string) => {
    if (!user) {
      toast.error('Please login to apply');
      navigate('/login');
      return;
    }

    if (!isCreator) {
      toast.error('Only approved creators can apply to campaigns');
      navigate('/creator-signup');
      return;
    }

    navigate('/creator-dashboard', { state: { openCampaign: campaignId } });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Loading campaigns...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold mb-2">Brand Campaigns</h1>
            <p className="text-muted-foreground">Discover and apply to exciting collaboration opportunities</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="instagram_post">Instagram Post</SelectItem>
                <SelectItem value="instagram_story">Instagram Story</SelectItem>
                <SelectItem value="instagram_reel">Instagram Reel</SelectItem>
                <SelectItem value="tiktok_video">TikTok Video</SelectItem>
                <SelectItem value="youtube_video">YouTube Video</SelectItem>
                <SelectItem value="ugc_content">UGC Content</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredCampaigns.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchQuery || filterType !== "all" 
                    ? "No campaigns match your search criteria" 
                    : "No active campaigns available at the moment"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {filteredCampaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        {campaign.brand_profiles?.logo_url && (
                          <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <img 
                              src={campaign.brand_profiles.logo_url} 
                              alt="" 
                              className="h-full w-full object-cover" 
                            />
                          </div>
                        )}
                        <div>
                          <CardTitle>{campaign.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {campaign.brand_profiles?.company_name || 'Brand'}
                          </p>
                        </div>
                      </div>
                      <Badge className="capitalize">
                        {campaign.campaign_type.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <CardDescription className="mt-2">{campaign.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Budget</p>
                          <p className="font-semibold">{formatPrice(campaign.budget_cents)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Spots</p>
                          <p className="font-semibold">
                            {campaign.spots_available - campaign.spots_filled} left
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Deadline</p>
                          <p className="font-semibold">
                            {new Date(campaign.deadline).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    {campaign.requirements && (
                      <div className="mb-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">Requirements</p>
                        <p className="text-sm text-muted-foreground">{campaign.requirements}</p>
                      </div>
                    )}
                    {isBrand && campaign.brand_profile_id === brandProfileId ? (
                      <Button 
                        onClick={() => navigate('/brand-dashboard?tab=campaigns')}
                        variant="secondary"
                        className="w-full"
                      >
                        View Applications
                      </Button>
                    ) : isBrand ? (
                      null
                    ) : (
                      <Button 
                        onClick={() => handleApply(campaign.id)}
                        disabled={campaign.spots_filled >= campaign.spots_available}
                        className="w-full"
                      >
                        {campaign.spots_filled >= campaign.spots_available 
                          ? 'No Spots Available' 
                          : user && isCreator 
                            ? 'Apply Now' 
                            : 'Login to Apply'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Campaigns;
