import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Calendar, DollarSign, Users, Send, CheckCircle, XCircle, Clock } from "lucide-react";
import { formatPrice } from "@/lib/stripe-mock";

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
  brand_profiles: {
    company_name: string;
    logo_url: string;
  } | null;
}

interface MyApplication {
  id: string;
  message: string;
  proposed_price_cents: number;
  status: string;
  created_at: string;
  campaigns: Campaign;
}

interface CampaignsTabProps {
  openCampaignId?: string | null;
}

const CampaignsTab = ({ openCampaignId }: CampaignsTabProps) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [myApplications, setMyApplications] = useState<MyApplication[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creatorProfileId, setCreatorProfileId] = useState<string | null>(null);

  const [applicationForm, setApplicationForm] = useState({
    message: "",
    proposed_price_cents: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-open apply dialog when navigating from public campaigns page
  useEffect(() => {
    if (openCampaignId && !loading && campaigns.length > 0) {
      const campaign = campaigns.find(c => c.id === openCampaignId);
      if (campaign && !hasApplied(campaign.id)) {
        openApplyDialog(campaign);
        // Clear the URL parameter to prevent re-opening
        const url = new URL(window.location.href);
        url.searchParams.delete('apply');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [openCampaignId, loading, campaigns]);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: creatorProfile } = await supabase
        .from('creator_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!creatorProfile) return;
      setCreatorProfileId(creatorProfile.id);

      // Fetch available campaigns
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select(`
          *,
          brand_profiles(company_name, logo_url)
        `)
        .eq('status', 'active')
        .gt('deadline', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (campaignsError) throw campaignsError;
      setCampaigns(campaignsData || []);

      // Fetch my applications
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('campaign_applications')
        .select(`
          *,
          campaigns(
            *,
            brand_profiles(company_name, logo_url)
          )
        `)
        .eq('creator_profile_id', creatorProfile.id)
        .order('created_at', { ascending: false });

      if (applicationsError) throw applicationsError;
      setMyApplications(applicationsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openApplyDialog = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setApplicationForm({
      message: "",
      proposed_price_cents: (campaign.budget_cents / 100).toString(),
    });
    setApplyDialogOpen(true);
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign || !creatorProfileId) return;

    try {
      const { error } = await supabase
        .from('campaign_applications')
        .insert({
          campaign_id: selectedCampaign.id,
          creator_profile_id: creatorProfileId,
          message: applicationForm.message.trim() || null,
          proposed_price_cents: parseInt(applicationForm.proposed_price_cents) * 100,
        });

      if (error) throw error;

      toast.success('Application submitted successfully!');
      setApplyDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error applying to campaign:', error);
      if (error.code === '23505') {
        toast.error('You have already applied to this campaign');
      } else {
        toast.error('Failed to submit application');
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const hasApplied = (campaignId: string) => {
    return myApplications.some(app => app.campaigns.id === campaignId);
  };

  if (loading) {
    return <div className="text-center py-8">Loading campaigns...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold">Campaigns</h2>
        <p className="text-muted-foreground">Browse and apply to brand campaigns</p>
      </div>

      <Tabs defaultValue="available" className="space-y-6">
        <TabsList>
          <TabsTrigger value="available">Available Campaigns</TabsTrigger>
          <TabsTrigger value="my-applications">My Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          {campaigns.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No active campaigns available</p>
              </CardContent>
            </Card>
          ) : (
            campaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      {campaign.brand_profiles?.logo_url && (
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img src={campaign.brand_profiles.logo_url} alt="" className="h-full w-full object-cover" />
                        </div>
                      )}
                      <div>
                        <CardTitle>{campaign.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{campaign.brand_profiles?.company_name || 'Brand'}</p>
                      </div>
                    </div>
                    <Badge className="capitalize">{campaign.campaign_type.replace(/_/g, ' ')}</Badge>
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
                        <p className="font-semibold">{campaign.spots_available - campaign.spots_filled} left</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Deadline</p>
                        <p className="font-semibold">{new Date(campaign.deadline).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  {campaign.requirements && (
                    <div className="mb-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-1">Requirements</p>
                      <p className="text-sm text-muted-foreground">{campaign.requirements}</p>
                    </div>
                  )}
                  <Button 
                    onClick={() => openApplyDialog(campaign)} 
                    disabled={hasApplied(campaign.id) || campaign.spots_filled >= campaign.spots_available}
                    className="w-full gap-2"
                  >
                    {hasApplied(campaign.id) ? (
                      <>Already Applied</>
                    ) : campaign.spots_filled >= campaign.spots_available ? (
                      <>No Spots Available</>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Apply to Campaign
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="my-applications" className="space-y-4">
          {myApplications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No applications yet</p>
              </CardContent>
            </Card>
          ) : (
            myApplications.map((app) => (
              <Card key={app.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{app.campaigns.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{app.campaigns.brand_profiles?.company_name || 'Brand'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(app.status)}
                      <Badge variant={app.status === 'accepted' ? 'default' : app.status === 'rejected' ? 'destructive' : 'secondary'}>
                        {app.status}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="mt-2">{app.campaigns.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Your Proposed Price</p>
                      <p className="font-semibold">{formatPrice(app.proposed_price_cents)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Applied On</p>
                      <p className="font-semibold">{new Date(app.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {app.message && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-1">Your Message</p>
                      <p className="text-sm text-muted-foreground">{app.message}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Apply to {selectedCampaign?.title}</DialogTitle>
            <DialogDescription>Submit your application to join this campaign</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleApply} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="proposed_price_cents">Your Proposed Price ($) *</Label>
              <Input
                id="proposed_price_cents"
                type="number"
                value={applicationForm.proposed_price_cents}
                onChange={(e) => setApplicationForm({ ...applicationForm, proposed_price_cents: e.target.value })}
                placeholder="500"
                min="1"
                required
              />
              <p className="text-xs text-muted-foreground">
                Brand's budget: {selectedCampaign && formatPrice(selectedCampaign.budget_cents)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                value={applicationForm.message}
                onChange={(e) => setApplicationForm({ ...applicationForm, message: e.target.value })}
                placeholder="Tell the brand why you're a great fit..."
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setApplyDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">Submit Application</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CampaignsTab;
