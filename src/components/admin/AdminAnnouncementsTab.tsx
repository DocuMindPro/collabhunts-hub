import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Bell, Megaphone, Send, Loader2, CheckCircle, XCircle, ExternalLink, X, CalendarIcon, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import ScheduledNotificationsList from "./ScheduledNotificationsList";

const AdminAnnouncementsTab = () => {
  // Announcement banner states
  const [bannerEnabled, setBannerEnabled] = useState(false);
  const [bannerText, setBannerText] = useState("");
  const [bannerLink, setBannerLink] = useState("");
  const [bannerStyle, setBannerStyle] = useState("info");
  const [isSavingBanner, setIsSavingBanner] = useState(false);
  const [isLoadingBanner, setIsLoadingBanner] = useState(true);

  // Push notification states
  const [pushTitle, setPushTitle] = useState("");
  const [pushBody, setPushBody] = useState("");
  const [sendMode, setSendMode] = useState<"now" | "schedule">("now");
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  const [scheduleTime, setScheduleTime] = useState("12:00");
  const [isSendingPush, setIsSendingPush] = useState(false);
  const [pushResult, setPushResult] = useState<{ success: boolean; message: string } | null>(null);
  const [scheduledListKey, setScheduledListKey] = useState(0);

  useEffect(() => {
    fetchBannerSettings();
  }, []);

  const fetchBannerSettings = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["announcement_enabled", "announcement_text", "announcement_link", "announcement_style"]);

    if (data) {
      const settings: Record<string, string> = {};
      data.forEach(item => { settings[item.key] = item.value || ""; });
      setBannerEnabled(settings.announcement_enabled === "true");
      setBannerText(settings.announcement_text || "");
      setBannerLink(settings.announcement_link || "");
      setBannerStyle(settings.announcement_style || "info");
    }
    setIsLoadingBanner(false);
  };

  const saveBannerSettings = async () => {
    setIsSavingBanner(true);
    try {
      const updates = [
        { key: "announcement_enabled", value: bannerEnabled.toString() },
        { key: "announcement_text", value: bannerText },
        { key: "announcement_link", value: bannerLink },
        { key: "announcement_style", value: bannerStyle },
      ];

      for (const { key, value } of updates) {
        const { error } = await supabase
          .from("site_settings")
          .upsert(
            { key, value, category: "announcement" },
            { onConflict: "key" }
          );
        if (error) throw error;
      }

      toast.success("Announcement banner settings saved!");
    } catch (error: any) {
      console.error("Error saving banner settings:", error);
      toast.error("Failed to save banner settings");
    } finally {
      setIsSavingBanner(false);
    }
  };

  const sendPushToCreators = async () => {
    if (!pushTitle || !pushBody) {
      toast.error("Please fill in title and message");
      return;
    }

    if (sendMode === "schedule") {
      if (!scheduleDate) {
        toast.error("Please select a date for scheduling");
        return;
      }

      setIsSendingPush(true);
      setPushResult(null);

      try {
        const [hours, minutes] = scheduleTime.split(":").map(Number);
        const scheduledAt = new Date(scheduleDate);
        scheduledAt.setHours(hours, minutes, 0, 0);

        if (scheduledAt <= new Date()) {
          toast.error("Scheduled time must be in the future");
          setIsSendingPush(false);
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { error } = await supabase
          .from("scheduled_push_notifications")
          .insert({
            title: pushTitle,
            body: pushBody,
            scheduled_at: scheduledAt.toISOString(),
            created_by: user.id,
          });

        if (error) throw error;

        setPushResult({
          success: true,
          message: `Notification scheduled for ${format(scheduledAt, "MMM d, yyyy 'at' h:mm a")}`,
        });
        toast.success("Notification scheduled!");
        setPushTitle("");
        setPushBody("");
        setScheduleDate(undefined);
        setScheduledListKey(prev => prev + 1);
      } catch (error: any) {
        console.error("Error scheduling push:", error);
        setPushResult({ success: false, message: error.message || "Failed to schedule notification" });
        toast.error(error.message || "Failed to schedule notification");
      } finally {
        setIsSendingPush(false);
      }
      return;
    }

    // Send Now mode
    setIsSendingPush(true);
    setPushResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-push-to-creators`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: pushTitle, body: pushBody }),
        }
      );

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Failed to send push notifications");

      setPushResult({
        success: true,
        message: `Sent to ${result.sent} device(s) across ${result.total_creators} creator(s). ${result.failed > 0 ? `${result.failed} failed.` : ""}`,
      });
      toast.success(`Push notification sent to ${result.sent} device(s)`);
      setPushTitle("");
      setPushBody("");
    } catch (error: any) {
      console.error("Error sending push:", error);
      setPushResult({ success: false, message: error.message || "Failed to send push notifications" });
      toast.error(error.message || "Failed to send push notifications");
    } finally {
      setIsSendingPush(false);
    }
  };

  const stylePreviewClasses: Record<string, string> = {
    info: "bg-primary/90 text-primary-foreground",
    warning: "bg-amber-500 text-white",
    success: "bg-emerald-600 text-white",
    promo: "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white",
  };

  return (
    <div className="space-y-6">
      {/* Announcement Banner Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Website Announcement Banner
          </CardTitle>
          <CardDescription>
            Display a banner at the top of the website. Users can dismiss it, but it reappears when you change the message.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {isLoadingBanner ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="banner-enabled" className="text-base font-medium">
                    Banner Enabled
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Show the announcement banner on the website
                  </p>
                </div>
                <Switch
                  id="banner-enabled"
                  checked={bannerEnabled}
                  onCheckedChange={setBannerEnabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="banner-text">Banner Message</Label>
                <Textarea
                  id="banner-text"
                  placeholder="e.g., 🎉 New feature: Book creators directly from their profile!"
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="banner-link">Link URL (optional)</Label>
                  <Input
                    id="banner-link"
                    placeholder="https://..."
                    value={bannerLink}
                    onChange={(e) => setBannerLink(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Banner Style</Label>
                  <Select value={bannerStyle} onValueChange={setBannerStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">ℹ️ Info (Primary)</SelectItem>
                      <SelectItem value="warning">⚠️ Warning (Amber)</SelectItem>
                      <SelectItem value="success">✅ Success (Green)</SelectItem>
                      <SelectItem value="promo">🎉 Promo (Gradient)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Live Preview */}
              {bannerText && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Preview</Label>
                  <div className={`relative w-full py-2.5 px-4 text-center text-sm font-medium rounded-lg ${stylePreviewClasses[bannerStyle] || stylePreviewClasses.info}`}>
                    <div className="flex items-center justify-center gap-2">
                      <span>{bannerText}</span>
                      {bannerLink && (
                        <span className="inline-flex items-center gap-1 underline underline-offset-2 font-semibold">
                          Learn More
                          <ExternalLink className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/20">
                      <X className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={saveBannerSettings}
                disabled={isSavingBanner}
                className="gap-2"
              >
                {isSavingBanner ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save Banner Settings
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Push Notifications to Creators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notification to Creators
          </CardTitle>
          <CardDescription>
            Send push notifications to all creators who have the mobile app installed. Send immediately or schedule for later.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="push-title">Notification Title</Label>
            <Input
              id="push-title"
              placeholder="e.g., New Opportunity Available!"
              value={pushTitle}
              onChange={(e) => setPushTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="push-body">Notification Message</Label>
            <Textarea
              id="push-body"
              placeholder="e.g., A brand is looking for creators in your area. Check it out!"
              value={pushBody}
              onChange={(e) => setPushBody(e.target.value)}
              rows={3}
            />
          </div>

          {/* Send Mode Toggle */}
          <div className="space-y-3">
            <Label>Delivery</Label>
            <RadioGroup
              value={sendMode}
              onValueChange={(v) => setSendMode(v as "now" | "schedule")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="now" id="mode-now" />
                <Label htmlFor="mode-now" className="font-normal cursor-pointer">Send Now</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="schedule" id="mode-schedule" />
                <Label htmlFor="mode-schedule" className="font-normal cursor-pointer">Schedule for Later</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Schedule Date/Time Picker */}
          {sendMode === "schedule" && (
            <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-lg border bg-muted/30">
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !scheduleDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduleDate ? format(scheduleDate, "MMM d, yyyy") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={scheduleDate}
                      onSelect={setScheduleDate}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule-time">Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="schedule-time"
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={sendPushToCreators}
            disabled={isSendingPush || !pushTitle || !pushBody || (sendMode === "schedule" && !scheduleDate)}
            className="gap-2"
          >
            {isSendingPush ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : sendMode === "schedule" ? (
              <Clock className="h-4 w-4" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {sendMode === "schedule" ? "Schedule Notification" : "Send to All Creators"}
          </Button>

          {pushResult && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${pushResult.success ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" : "bg-destructive/10 text-destructive"}`}>
              {pushResult.success ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              <span>{pushResult.message}</span>
            </div>
          )}

          <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <strong>Note:</strong> Push notifications are sent via Firebase Cloud Messaging. Only creators with the mobile app installed and push enabled will receive them. Firebase credentials must be configured.
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Notifications List */}
      <ScheduledNotificationsList key={scheduledListKey} />
    </div>
  );
};

export default AdminAnnouncementsTab;
