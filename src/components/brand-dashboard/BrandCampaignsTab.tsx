import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Calendar, DollarSign, Users, Eye, Lock } from "lucide-react";
import AiBioSuggestions from "@/components/AiBioSuggestions";
import { formatPrice, SUBSCRIPTION_PLANS, type PlanType } from "@/lib/stripe-mock";
import UpgradePrompt from "@/components/UpgradePrompt";

interface Campaign {
  id: string;
  title: string;
  description: string;
  campaign_type: string;
  budget_cents: number;
  spots_available: number;
  spots_filled: number;
  deadline: string;
  status: string;
  created_at: string;
}

interface Application {
  id: string;
  creator_profile_id: string;
  message: string;
  proposed_price_cents: number;
  status: string;
  created_at: string;
  creator_profiles: {
    display_name: string;
    profile_image_url: string;
  };
}

const BrandCampaignsTab = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewApplicationsOpen, setViewApplicationsOpen] = useState(false);
  const [brandProfileId, setBrandProfileId] = useState<string | null>(null);
  const [campaignLimit, setCampaignLimit] = useState(0);
  const [campaignsThisMonth, setCampaignsThisMonth] = useState(0);
  const [canPostCampaigns, setCanPostCampaigns] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    campaign_type: "instagram_post",
    budget_cents: "",
    spots_available: "1",
    deadline: "",
    requirements: "",
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: brandProfile } = await supabase
        .from('brand_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!brandProfile) return;
      setBrandProfileId(brandProfile.id);

      // Get subscription to check campaign limit
      const { data: subscription } = await supabase
        .from('brand_subscriptions')
        .select('plan_type')
        .eq('brand_profile_id', brandProfile.id)
        .eq('status', 'active')
        .maybeSingle();

      const planType = (subscription?.plan_type || 'basic') as PlanType;
      const limit = SUBSCRIPTION_PLANS[planType].campaignLimit;
      setCampaignLimit(limit);
      setCanPostCampaigns(limit > 0);

      // Count campaigns this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from('campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('brand_profile_id', brandProfile.id)
        .gte('created_at', startOfMonth.toISOString());

      setCampaignsThisMonth(count || 0);

      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('brand_profile_id', brandProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (campaignId: string) => {
    try {
      const { data, error } = await supabase
        .from('campaign_applications')
        .select(`
          *,
          creator_profiles(display_name, profile_image_url)
        `)
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandProfileId) return;

    try {
      const { error } = await supabase
        .from('campaigns')
        .insert({
          brand_profile_id: brandProfileId,
          title: formData.title,
          description: formData.description,
          campaign_type: formData.campaign_type,
          budget_cents: parseInt(formData.budget_cents) * 100,
          spots_available: parseInt(formData.spots_available),
          deadline: new Date(formData.deadline).toISOString(),
          requirements: formData.requirements || null,
          status: 'pending',
        });

      if (error) throw error;

      toast.success('Campaign created! Pending admin approval.');
      setCreateDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        campaign_type: "instagram_post",
        budget_cents: "",
        spots_available: "1",
        deadline: "",
        requirements: "",
      });
      fetchCampaigns();
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    }
  };

  const handleApplicationStatus = async (applicationId: string, status: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('campaign_applications')
        .update({ status })
        .eq('id', applicationId);

      if (error) throw error;

      if (status === 'accepted' && selectedCampaign) {
        await supabase
          .from('campaigns')
          .update({ spots_filled: selectedCampaign.spots_filled + 1 })
          .eq('id', selectedCampaign.id);
      }

      toast.success(`Application ${status}!`);
      fetchApplications(selectedCampaign!.id);
      fetchCampaigns();
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application');
    }
  };

  const viewApplications = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    fetchApplications(campaign.id);
    setViewApplicationsOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading campaigns...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-heading font-bold">My Campaigns</h2>
          <p className="text-muted-foreground">Create and manage campaign collaborations</p>
          {canPostCampaigns && campaignLimit !== Infinity && (
            <p className="text-sm text-muted-foreground mt-1">
              {campaignsThisMonth}/{campaignLimit} campaigns used this month
            </p>
          )}
        </div>
        {!canPostCampaigns ? (
          <UpgradePrompt feature="campaigns" inline />
        ) : campaignLimit !== Infinity && campaignsThisMonth >= campaignLimit ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span className="text-sm">Monthly limit reached</span>
          </div>
        ) : (
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Campaign
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>Post a campaign for multiple creators to apply</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Campaign Title * <span className="text-xs text-muted-foreground">({formData.title.length}/10 min)</span></Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Summer Fashion Campaign"
                  required
                  minLength={10}
                />
                {formData.title.length < 10 && formData.title.length > 0 && (
                  <p className="text-xs text-destructive">Title must be at least 10 characters</p>
                )}
                <AiBioSuggestions
                  text={formData.title}
                  onSelect={(text) => setFormData({ ...formData, title: text })}
                  minLength={10}
                  type="campaign_title"
                  label="title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description * <span className="text-xs text-muted-foreground">({formData.description.length}/50 min)</span></Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your campaign goals and expectations..."
                  rows={4}
                  required
                  minLength={50}
                />
                {formData.description.length < 50 && formData.description.length > 0 && (
                  <p className="text-xs text-destructive">Description must be at least 50 characters</p>
                )}
                <AiBioSuggestions
                  text={formData.description}
                  onSelect={(text) => setFormData({ ...formData, description: text })}
                  minLength={50}
                  type="campaign_description"
                  label="description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign_type">Campaign Type *</Label>
                  <Select value={formData.campaign_type} onValueChange={(value) => setFormData({ ...formData, campaign_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram_post">Instagram Post</SelectItem>
                      <SelectItem value="instagram_story">Instagram Story</SelectItem>
                      <SelectItem value="instagram_reel">Instagram Reel</SelectItem>
                      <SelectItem value="tiktok_video">TikTok Video</SelectItem>
                      <SelectItem value="youtube_video">YouTube Video</SelectItem>
                      <SelectItem value="ugc_content">UGC Content</SelectItem>
                      <SelectItem value="multi_platform">Multi-Platform</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget_cents">Budget per Creator ($) *</Label>
                  <Input
                    id="budget_cents"
                    type="number"
                    value={formData.budget_cents}
                    onChange={(e) => setFormData({ ...formData, budget_cents: e.target.value })}
                    placeholder="500"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="spots_available">Number of Creators *</Label>
                  <Input
                    id="spots_available"
                    type="number"
                    value={formData.spots_available}
                    onChange={(e) => setFormData({ ...formData, spots_available: e.target.value })}
                    placeholder="3"
                    min="1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Application Deadline *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Additional Requirements</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="Special requirements, deliverables, timelines..."
                  rows={3}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={formData.title.length < 10 || formData.description.length < 50}
              >
                Create Campaign
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        )}

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">No campaigns yet</p>
            <Button onClick={() => setCreateDialogOpen(true)}>Create Your First Campaign</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{campaign.title}</CardTitle>
                    <CardDescription className="mt-2">{campaign.description}</CardDescription>
                  </div>
                  <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                    {campaign.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 mb-4">
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
                      <p className="font-semibold">{campaign.spots_filled}/{campaign.spots_available}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Deadline</p>
                      <p className="font-semibold">{new Date(campaign.deadline).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    <Button onClick={() => viewApplications(campaign)} variant="outline" className="w-full gap-2">
                      <Eye className="h-4 w-4" />
                      View Applications
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={viewApplicationsOpen} onOpenChange={setViewApplicationsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Applications for {selectedCampaign?.title}</DialogTitle>
            <DialogDescription>{applications.length} applications received</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {applications.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No applications yet</p>
            ) : (
              applications.map((app) => (
                <Card key={app.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                            {app.creator_profiles.profile_image_url ? (
                              <img src={app.creator_profiles.profile_image_url} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <span className="font-semibold">{app.creator_profiles.display_name[0]}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">{app.creator_profiles.display_name}</p>
                            <p className="text-sm text-muted-foreground">Proposed: {formatPrice(app.proposed_price_cents)}</p>
                          </div>
                        </div>
                        {app.message && (
                          <p className="text-sm text-muted-foreground mt-2">{app.message}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {app.status === 'pending' && (
                          <>
                            <Button size="sm" onClick={() => handleApplicationStatus(app.id, 'accepted')}>
                              Accept
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleApplicationStatus(app.id, 'rejected')}>
                              Reject
                            </Button>
                          </>
                        )}
                        {app.status !== 'pending' && (
                          <Badge variant={app.status === 'accepted' ? 'default' : 'secondary'}>
                            {app.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrandCampaignsTab;
