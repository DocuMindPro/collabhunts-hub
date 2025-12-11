import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Send, Users, AlertTriangle, Save, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MassMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCreators: Array<{ id: string; display_name: string }>;
  brandProfileId: string;
  planType: string;
}

interface Template {
  id: string;
  name: string;
  content: string;
}

const MassMessageDialog = ({ 
  isOpen, 
  onClose, 
  selectedCreators, 
  brandProfileId,
  planType 
}: MassMessageDialogProps) => {
  const [message, setMessage] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [newTemplateName, setNewTemplateName] = useState("");
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [sending, setSending] = useState(false);
  const [dailyUsed, setDailyUsed] = useState(0);
  const [weeklyUsed, setWeeklyUsed] = useState(0);

  const dailyLimit = planType === 'premium' ? 100 : 50;
  const weeklyLimit = planType === 'premium' ? 300 : 150;

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      fetchUsage();
    }
  }, [isOpen]);

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
      setMessage(template.content);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
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
          message: message.trim(),
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
        `Messages sent to ${result.sent}/${result.total} creators`,
        {
          description: result.filtered > 0 
            ? `${result.filtered} creators filtered (opted out or recently messaged)`
            : undefined
        }
      );

      setMessage("");
      setSelectedTemplate("");
      setNewTemplateName("");
      setSaveAsTemplate(false);
      onClose();
    } catch (error) {
      console.error('Mass message error:', error);
      toast.error("Failed to send messages");
    } finally {
      setSending(false);
    }
  };

  const remainingDaily = dailyLimit - dailyUsed;
  const remainingWeekly = weeklyLimit - weeklyUsed;
  const wouldExceedLimit = selectedCreators.length > remainingDaily;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Send Mass Message
          </DialogTitle>
          <DialogDescription>
            Message {selectedCreators.length} selected creator{selectedCreators.length !== 1 ? 's' : ''} at once
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

          {/* Template Selector */}
          {templates.length > 0 && (
            <div className="space-y-2">
              <Label>Use Template (optional)</Label>
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

          {/* Message Input */}
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message to creators..."
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/500 characters
            </p>
          </div>

          {/* Save as Template */}
          {!selectedTemplate && (
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
                  Save as template for future use
                </Label>
              </div>
              {saveAsTemplate && (
                <Input
                  placeholder="Template name (e.g., 'Collaboration Intro')"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                />
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={sending || !message.trim() || wouldExceedLimit}
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
                Send to {selectedCreators.length} Creator{selectedCreators.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MassMessageDialog;
