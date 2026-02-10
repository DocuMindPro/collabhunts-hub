import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Megaphone, Loader2, ExternalLink, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PushNotificationScheduler from "./PushNotificationScheduler";
import ScheduledNotificationsList from "./ScheduledNotificationsList";

const AdminAnnouncementsTab = () => {
  // Announcement banner states
  const [bannerEnabled, setBannerEnabled] = useState(false);
  const [bannerText, setBannerText] = useState("");
  const [bannerLink, setBannerLink] = useState("");
  const [bannerLinkText, setBannerLinkText] = useState("");
  const [bannerStyle, setBannerStyle] = useState("info");
  const [isSavingBanner, setIsSavingBanner] = useState(false);
  const [isLoadingBanner, setIsLoadingBanner] = useState(true);

  const [scheduledListKey, setScheduledListKey] = useState(0);

  useEffect(() => {
    fetchBannerSettings();
  }, []);

  const fetchBannerSettings = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["announcement_enabled", "announcement_text", "announcement_link", "announcement_link_text", "announcement_style"]);

    if (data) {
      const settings: Record<string, string> = {};
      data.forEach(item => { settings[item.key] = item.value || ""; });
      setBannerEnabled(settings.announcement_enabled === "true");
      setBannerText(settings.announcement_text || "");
      setBannerLink(settings.announcement_link || "");
      setBannerLinkText(settings.announcement_link_text || "");
      setBannerStyle(settings.announcement_style || "info");
    }
    setIsLoadingBanner(false);
  };

  const saveBannerSettings = async () => {
    setIsSavingBanner(true);
    try {
      // Verify auth session first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to save settings. Please refresh and log in again.");
        return;
      }

      const updates = [
        { key: "announcement_enabled", value: bannerEnabled.toString() },
        { key: "announcement_text", value: bannerText },
        { key: "announcement_link", value: bannerLink.trim() },
        { key: "announcement_link_text", value: bannerLinkText },
        { key: "announcement_style", value: bannerStyle },
      ];

      for (const { key, value } of updates) {
        const { data, error } = await supabase
          .from("site_settings")
          .update({ value, updated_at: new Date().toISOString() })
          .eq("key", key)
          .select();

        if (error) throw error;
        if (!data || data.length === 0) {
          throw new Error("Save failed - you may not have admin permissions");
        }
      }

      toast.success("Announcement banner settings saved!");
    } catch (error: any) {
      console.error("Error saving banner settings:", error);
      toast.error(error.message || "Failed to save banner settings");
    } finally {
      setIsSavingBanner(false);
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

              <div className="grid md:grid-cols-3 gap-4">
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
                  <Label htmlFor="banner-link-text">Link Text (optional)</Label>
                  <Input
                    id="banner-link-text"
                    placeholder="Learn More"
                    value={bannerLinkText}
                    onChange={(e) => setBannerLinkText(e.target.value)}
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
                          {bannerLinkText || "Learn More"}
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
      <PushNotificationScheduler onScheduled={() => setScheduledListKey(prev => prev + 1)} />

      {/* Scheduled Notifications List */}
      <ScheduledNotificationsList key={scheduledListKey} />
    </div>
  );
};

export default AdminAnnouncementsTab;
