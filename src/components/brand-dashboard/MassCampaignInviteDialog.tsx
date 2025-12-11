import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Users, AlertTriangle, Save, Loader2, Megaphone, DollarSign, Calendar, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface MassCampaignInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCreatorIds: string[];
  brandProfileId: string;
  onSuccess?: () => void;
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  budget_cents: number;
  spots_available: number;
  spots_filled: number;
  deadline: string;
  status: string;
}

interface Template {
  id: string;
  name: string;
  content: string;
}

const MassCampaignInviteDialog = ({ 
  open, 
  onOpenChange, 
  selectedCreatorIds, 
  brandProfileId,
  onSuccess 
}: MassCampaignInviteDialogProps) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [customMessage, setCustomMessage] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [newTemplateName, setNewTemplateName] = useState("");
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [sending, setSending] = useState(false);
  const [dailyUsed, setDailyUsed] = useState(0);
  const [weeklyUsed, setWeeklyUsed] = useState(0);
  const [planType, setPlanType] = useState<string>("pro");
  const [selectedCreators, setSelectedCreators] = useState<Array<{ id: string; display_name: string }>>([]);

  const dailyLimit = planType === 'premium' ? 100 : 50;
  const weeklyLimit = planType === 'premium' ? 300 : 150;

  useEffect(() => {
    if (open) {
      fetchCampaigns();
      fetchTemplates();
      fetchUsage();
      fetchCreatorNames();
      fetchPlanType();
    }
  }, [open, selectedCreatorIds]);

  const fetchCampaigns = async () => {
    const { data } = await supabase
      .from('campaigns')
      .select('*')
      .eq('brand_profile_id', brandProfileId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (data) setCampaigns(data);
  };

  const fetchPlanType = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data: brandProfile } = await supabase
      .from('brand_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!brandProfile) return;

    const { data: subscription } = await supabase
      .from('brand_subscriptions')
      .select('plan_type')
      .eq('brand_profile_id', brandProfile.id)
      .eq('status', 'active')
      .order('plan_type', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subscription) {
      setPlanType(subscription.plan_type);
    }
  };

  const fetchCreatorNames = async () => {
    if (selectedCreatorIds.length === 0) {
      setSelectedCreators([]);
      return;
    }

    const { data } = await supabase
      .from('creator_profiles')
      .select('id, display_name')
      .in('id', selectedCreatorIds);

    if (data) {
      setSelectedCreators(data);
    }
  };

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from('mass_message_templates')
      .select('*')
      .eq('brand_profile_id', brandProfileId)
      .order('created_at', { ascending: false });
    
    if (data) setTemplates(data);
  };

  const fetchUsage = async () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const { data: todayLogs } = await supabase
      .from('mass_messages_log')
      .select('message_count')
      .eq('brand_profile_id', brandProfileId)
      .gte('sent_at', todayStart.toISOString());

    const { data: weekLogs } = await supabase
      .from('mass_messages_log')
      .select('message_count')
      .eq('brand_profile_id', brandProfileId)
      .gte('sent_at', weekStart.toISOString());

    setDailyUsed(todayLogs?.reduce((sum, log) => sum + log.message_count, 0) || 0);
    setWeeklyUsed(weekLogs?.reduce((sum, log) => sum + log.message_count, 0) || 0);
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setCustomMessage(template.content);
    }
  };

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);

  const handleSend = async () => {
    if (!selectedCampaignId) {
      toast.error("Please select a campaign");
      return;
    }

    if (selectedCreators.length === 0) {
      toast.error("No creators selected");
      return;
    }

    if (selectedCreators.length > 25) {
      toast.error("Maximum 25 creators per batch");
      return;
    }

    if (dailyUsed + selectedCreators.length > dailyLimit) {
      toast.error(`Would exceed daily limit. Remaining: ${dailyLimit - dailyUsed}`);
      return;
    }

    setSending(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Not authenticated");
        return;
      }

      const response = await supabase.functions.invoke('send-mass-message', {
        body: {
          creatorProfileIds: selectedCreators.map(c => c.id),
          campaignId: selectedCampaignId,
          customMessage: customMessage.trim() || undefined,
          templateId: selectedTemplate || undefined,
          templateName: saveAsTemplate && newTemplateName ? newTemplateName : undefined,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data;

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(
        `Campaign invitations sent to ${result.sent}/${result.total} creators`,
        {
          description: result.filtered > 0 
            ? `${result.filtered} creators filtered (opted out or recently messaged)`
            : undefined
        }
      );

      setCustomMessage("");
      setSelectedTemplate("");
      setSelectedCampaignId("");
      setNewTemplateName("");
      setSaveAsTemplate(false);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Campaign invite error:', error);
      toast.error("Failed to send invitations");
    } finally {
      setSending(false);
    }
  };

  const remainingDaily = dailyLimit - dailyUsed;
  const remainingWeekly = weeklyLimit - weeklyUsed;
  const wouldExceedLimit = selectedCreators.length > remainingDaily;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            Invite Creators to Campaign
          </DialogTitle>
          <DialogDescription>
            Invite {selectedCreators.length} creator{selectedCreators.length !== 1 ? 's' : ''} to apply to your campaign
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Usage Stats */}
          <div className="flex gap-2 flex-wrap">
            <Badge variant={remainingDaily > 10 ? "secondary" : "destructive"}>
              {remainingDaily}/{dailyLimit} daily
            </Badge>
            <Badge variant={remainingWeekly > 30 ? "secondary" : "destructive"}>
              {remainingWeekly}/{weeklyLimit} weekly
            </Badge>
          </div>

          {/* Warning if would exceed limit */}
          {wouldExceedLimit && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>
                Selecting {selectedCreators.length} creators would exceed your daily limit of {dailyLimit}. 
                You can send to {remainingDaily} more today.
              </span>
            </div>
          )}

          {/* Selected Creators Preview */}
          <div>
            <Label className="text-sm text-muted-foreground">Selected Creators</Label>
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedCreators.slice(0, 5).map(creator => (
                <Badge key={creator.id} variant="outline" className="text-xs">
                  {creator.display_name}
                </Badge>
              ))}
              {selectedCreators.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{selectedCreators.length - 5} more
                </Badge>
              )}
            </div>
          </div>

          {/* Campaign Selector */}
          <div className="space-y-2">
            <Label>Select Campaign *</Label>
            {campaigns.length === 0 ? (
              <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground text-sm">
                <Megaphone className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No active campaigns found.</p>
                <p className="text-xs mt-1">Create a campaign first to invite creators.</p>
              </div>
            ) : (
              <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a campaign to invite creators to" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map(campaign => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.title} - ${(campaign.budget_cents / 100).toFixed(0)} budget
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Campaign Preview */}
          {selectedCampaign && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4 space-y-2">
                <div className="font-medium">{selectedCampaign.title}</div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {selectedCampaign.description}
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    ${(selectedCampaign.budget_cents / 100).toFixed(0)} budget
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {selectedCampaign.spots_available - selectedCampaign.spots_filled} spots left
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Deadline: {format(new Date(selectedCampaign.deadline), "MMM d, yyyy")}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Personal Message Template Selector */}
          {templates.length > 0 && (
            <div className="space-y-2">
              <Label>Use Message Template (optional)</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a saved template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Custom Message Input */}
          <div className="space-y-2">
            <Label>Personal Message (optional)</Label>
            <Textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Add a personal note to your invitation (e.g., why you think they'd be a great fit)..."
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {customMessage.length}/300 characters
            </p>
          </div>

          {/* Save as Template */}
          {!selectedTemplate && customMessage.trim() && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="saveTemplate"
                  checked={saveAsTemplate}
                  onChange={(e) => setSaveAsTemplate(e.target.checked)}
                  className="rounded border-border"
                />
                <Label htmlFor="saveTemplate" className="text-sm cursor-pointer">
                  Save message as template for future use
                </Label>
              </div>
              {saveAsTemplate && (
                <Input
                  placeholder="Template name (e.g., 'Warm Intro')"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                />
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
            Cancel
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={sending || !selectedCampaignId || wouldExceedLimit || campaigns.length === 0}
            className="gap-2"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Invitation{selectedCreators.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MassCampaignInviteDialog;