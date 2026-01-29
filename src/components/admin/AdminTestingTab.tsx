import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Play, Users, Building2, Mail, Send, CheckCircle, XCircle, Loader2, Sparkles, Shield, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CreatorOnboardingPreview from "./CreatorOnboardingPreview";
import BrandOnboardingPreview from "./BrandOnboardingPreview";

const AdminTestingTab = () => {
  const [showCreatorPreview, setShowCreatorPreview] = useState(false);
  const [showBrandPreview, setShowBrandPreview] = useState(false);
  
  // Email testing states
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  
  // Platform update states
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateDescription, setUpdateDescription] = useState("");
  const [updateCategory, setUpdateCategory] = useState<string>("feature");
  const [updateRoles, setUpdateRoles] = useState<string>("all");
  const [isSendingUpdate, setIsSendingUpdate] = useState(false);

  // Verification settings states
  const [requirePhoneVerification, setRequirePhoneVerification] = useState(true);
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);
  const [isLoadingVerificationSettings, setIsLoadingVerificationSettings] = useState(true);
  const [isSavingVerification, setIsSavingVerification] = useState(false);

  // Fetch verification settings on mount
  useEffect(() => {
    const fetchVerificationSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["require_phone_verification", "require_email_verification"]);

      if (data) {
        const phoneSetting = data.find(s => s.key === "require_phone_verification");
        const emailSetting = data.find(s => s.key === "require_email_verification");
        setRequirePhoneVerification(phoneSetting?.value !== "false");
        setRequireEmailVerification(emailSetting?.value !== "false");
      }
      setIsLoadingVerificationSettings(false);
    };

    fetchVerificationSettings();
  }, []);

  const updateVerificationSetting = async (key: string, value: boolean) => {
    setIsSavingVerification(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .update({ value: value.toString() })
        .eq("key", key);

      if (error) throw error;

      toast.success(`${key === "require_phone_verification" ? "Phone" : "Email"} verification ${value ? "enabled" : "disabled"}`);
    } catch (error: any) {
      console.error("Error updating verification setting:", error);
      toast.error("Failed to update setting");
      // Revert the toggle on error
      if (key === "require_phone_verification") {
        setRequirePhoneVerification(!value);
      } else {
        setRequireEmailVerification(!value);
      }
    } finally {
      setIsSavingVerification(false);
    }
  };

  const handlePhoneVerificationToggle = (checked: boolean) => {
    setRequirePhoneVerification(checked);
    updateVerificationSetting("require_phone_verification", checked);
  };

  const handleEmailVerificationToggle = (checked: boolean) => {
    setRequireEmailVerification(checked);
    updateVerificationSetting("require_email_verification", checked);
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast.error("Please enter an email address");
      return;
    }

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("send-notification-email", {
        body: {
          type: "test_email",
          to_email: testEmail,
          to_name: "Test User",
          data: {
            recipient_email: testEmail,
          },
        },
      });

      if (error) throw error;

      setTestResult({ success: true, message: "Test email sent successfully!" });
      toast.success("Test email sent! Check your inbox.");
    } catch (error: any) {
      console.error("Error sending test email:", error);
      setTestResult({ success: false, message: error.message || "Failed to send test email" });
      toast.error("Failed to send test email");
    } finally {
      setIsSendingTest(false);
    }
  };

  const sendPlatformUpdate = async (testMode: boolean) => {
    if (!updateTitle || !updateDescription) {
      toast.error("Please fill in title and description");
      return;
    }

    setIsSendingUpdate(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-platform-update`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: updateTitle,
            description: updateDescription,
            category: updateCategory,
            roles: updateRoles === "all" ? ["all"] : [updateRoles],
            test_email: testMode ? testEmail : undefined,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Failed to send update");

      if (testMode) {
        toast.success(`Test update sent to ${testEmail}`);
      } else {
        toast.success(`Platform update sent to ${result.sent} users`);
      }

      if (!testMode) {
        setUpdateTitle("");
        setUpdateDescription("");
      }
    } catch (error: any) {
      console.error("Error sending platform update:", error);
      toast.error(error.message || "Failed to send platform update");
    } finally {
      setIsSendingUpdate(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Verification Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verification Settings
          </CardTitle>
          <CardDescription>
            Control verification requirements for testing signup flows.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoadingVerificationSettings ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="phone-verification" className="text-base font-medium">
                    Phone Verification Required
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Users must verify phone via OTP during signup
                  </p>
                </div>
                <Switch
                  id="phone-verification"
                  checked={requirePhoneVerification}
                  onCheckedChange={handlePhoneVerificationToggle}
                  disabled={isSavingVerification}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-verification" className="text-base font-medium">
                    Email Verification Required
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Users must verify email before accessing dashboard
                  </p>
                </div>
                <Switch
                  id="email-verification"
                  checked={requireEmailVerification}
                  onCheckedChange={handleEmailVerificationToggle}
                  disabled={isSavingVerification}
                />
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800 dark:text-amber-300">
                  <strong>Testing Only:</strong> Disabling verification is for development and testing purposes. 
                  Make sure to enable both in production for security!
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Email Testing Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Testing
          </CardTitle>
          <CardDescription>
            Test email notifications to verify SendGrid is working correctly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="test-email">Test Email Address</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="your@email.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            <Button 
              onClick={sendTestEmail}
              disabled={isSendingTest || !testEmail}
              className="gap-2"
            >
              {isSendingTest ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send Test
            </Button>
          </div>

          {testResult && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${testResult.success ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'}`}>
              {testResult.success ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Update Broadcast Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Send Platform Update
          </CardTitle>
          <CardDescription>
            Broadcast new feature announcements to users via email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="update-title">Update Title</Label>
              <Input
                id="update-title"
                placeholder="e.g., New Content Library Features"
                value={updateTitle}
                onChange={(e) => setUpdateTitle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={updateCategory} onValueChange={setUpdateCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feature">🚀 New Feature</SelectItem>
                    <SelectItem value="improvement">⚡ Improvement</SelectItem>
                    <SelectItem value="fix">🔧 Bug Fix</SelectItem>
                    <SelectItem value="announcement">📢 Announcement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select value={updateRoles} onValueChange={setUpdateRoles}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Everyone</SelectItem>
                    <SelectItem value="creator">Creators Only</SelectItem>
                    <SelectItem value="brand">Brands Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="update-description">Description</Label>
            <Textarea
              id="update-description"
              placeholder="Brief description of the update..."
              value={updateDescription}
              onChange={(e) => setUpdateDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => sendPlatformUpdate(true)}
              disabled={isSendingUpdate || !updateTitle || !updateDescription || !testEmail}
              className="gap-2"
            >
              {isSendingUpdate ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              Send Test to {testEmail || "..."}
            </Button>
            <Button
              onClick={() => sendPlatformUpdate(false)}
              disabled={isSendingUpdate || !updateTitle || !updateDescription}
              className="gap-2"
            >
              {isSendingUpdate ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Broadcast to All Users
            </Button>
          </div>

          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-sm">
            <strong>⚠️ Warning:</strong> Broadcasting will send emails to ALL users matching the target audience. Use the test button first!
          </div>
        </CardContent>
      </Card>

      {/* Onboarding Testing Card */}
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Testing</CardTitle>
          <CardDescription>
            Preview the onboarding flows without creating accounts. Changes are not saved to the database.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Creator Onboarding Preview */}
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 rounded-full bg-primary/10">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Creator Onboarding</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Test the 7-step creator signup flow including profile photos, social accounts, and services
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowCreatorPreview(true)}
                    className="gap-2 w-full"
                  >
                    <Play className="h-4 w-4" />
                    Test Creator Flow
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Brand Onboarding Preview */}
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 rounded-full bg-primary/10">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Brand Onboarding</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Test the 4-step brand onboarding flow for intent, budget, categories, and platforms
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowBrandPreview(true)}
                    className="gap-2 w-full"
                    variant="secondary"
                  >
                    <Play className="h-4 w-4" />
                    Test Brand Flow
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <strong>Note:</strong> Preview mode allows you to navigate through all steps without:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Creating actual user accounts</li>
              <li>Saving data to the database</li>
              <li>Uploading files to storage</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Creator Preview Dialog */}
      <Dialog open={showCreatorPreview} onOpenChange={setShowCreatorPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Badge variant="outline" className="text-amber-600 border-amber-600">PREVIEW MODE</Badge>
              Creator Onboarding Preview
            </DialogTitle>
          </DialogHeader>
          <CreatorOnboardingPreview onClose={() => setShowCreatorPreview(false)} />
        </DialogContent>
      </Dialog>

      {/* Brand Preview Dialog */}
      <Dialog open={showBrandPreview} onOpenChange={setShowBrandPreview}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Badge variant="outline" className="text-amber-600 border-amber-600">PREVIEW MODE</Badge>
              Brand Onboarding Preview
            </DialogTitle>
          </DialogHeader>
          <BrandOnboardingPreview onClose={() => setShowBrandPreview(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTestingTab;
