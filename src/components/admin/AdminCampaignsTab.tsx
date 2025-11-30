import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Calendar, DollarSign, Users, CheckCircle, XCircle, Clock } from "lucide-react";
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
  status: string;
  created_at: string;
  brand_profiles: {
    company_name: string;
    logo_url: string;
  } | null;
}

const AdminCampaignsTab = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          brand_profiles(company_name, logo_url)
        `)
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

  const handleApprove = async (campaignId: string) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: 'active' })
        .eq('id', campaignId);

      if (error) throw error;

      toast.success('Campaign approved successfully');
      fetchCampaigns();
    } catch (error) {
      console.error('Error approving campaign:', error);
      toast.error('Failed to approve campaign');
    }
  };

  const handleReject = async () => {
    if (!selectedCampaign || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ 
          status: 'rejected',
          requirements: `REJECTED: ${rejectionReason}`
        })
        .eq('id', selectedCampaign.id);

      if (error) throw error;

      toast.success('Campaign rejected');
      setRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedCampaign(null);
      fetchCampaigns();
    } catch (error) {
      console.error('Error rejecting campaign:', error);
      toast.error('Failed to reject campaign');
    }
  };

  const openRejectDialog = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setRejectDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const renderCampaignCard = (campaign: Campaign) => (
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
          <div className="flex items-center gap-2">
            {getStatusBadge(campaign.status)}
            <Badge className="capitalize">{campaign.campaign_type.replace(/_/g, ' ')}</Badge>
          </div>
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
              <p className="font-semibold">{campaign.spots_available} total</p>
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
        {campaign.status === 'pending' && (
          <div className="flex gap-2">
            <Button 
              onClick={() => handleApprove(campaign.id)}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button 
              onClick={() => openRejectDialog(campaign)}
              variant="destructive"
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div className="text-center py-8">Loading campaigns...</div>;
  }

  const pendingCampaigns = campaigns.filter(c => c.status === 'pending');
  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const rejectedCampaigns = campaigns.filter(c => c.status === 'rejected');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold">Campaign Management</h2>
        <p className="text-muted-foreground">Review and manage brand campaigns</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">
            Pending {pendingCampaigns.length > 0 && `(${pendingCampaigns.length})`}
          </TabsTrigger>
          <TabsTrigger value="active">Active ({activeCampaigns.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedCampaigns.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingCampaigns.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No pending campaigns</p>
              </CardContent>
            </Card>
          ) : (
            pendingCampaigns.map(renderCampaignCard)
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeCampaigns.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No active campaigns</p>
              </CardContent>
            </Card>
          ) : (
            activeCampaigns.map(renderCampaignCard)
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedCampaigns.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No rejected campaigns</p>
              </CardContent>
            </Card>
          ) : (
            rejectedCampaigns.map(renderCampaignCard)
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Campaign</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this campaign
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection-reason">Rejection Reason *</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this campaign is being rejected..."
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setRejectDialogOpen(false);
                  setRejectionReason("");
                  setSelectedCampaign(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleReject}
                className="flex-1"
              >
                Reject Campaign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCampaignsTab;
