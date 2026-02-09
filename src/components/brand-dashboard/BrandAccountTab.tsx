import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Phone, Mail, Globe, MapPin, Calendar, CheckCircle2, AlertCircle, Loader2, Camera, Crown, ArrowUpRight } from "lucide-react";
import ProfileAvatar from "@/components/ProfileAvatar";
import PhoneInput from "@/components/PhoneInput";
import { getCurrentPlanType } from "@/lib/subscription-utils";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import BrandVerificationBadgeCard from "./BrandVerificationBadgeCard";
import TeamAccessCard from "@/components/team/TeamAccessCard";
import UpgradePlanDialog from "./UpgradePlanDialog";

interface BrandProfile {
  id: string;
  user_id: string;
  company_name: string;
  industry: string | null;
  company_size: string | null;
  website_url: string | null;
  location_country: string | null;
  phone_number: string | null;
  phone_verified: boolean | null;
  logo_url: string | null;
  created_at: string | null;
}

const BrandAccountTab = () => {
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [planType, setPlanType] = useState<string>("free");
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  useEffect(() => {
    fetchBrandProfile();
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const plan = await getCurrentPlanType(user.id);
      setPlanType(plan);
    }
  };

  const fetchBrandProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserEmail(user.email || null);
      const { data, error } = await supabase
        .from('brand_profiles')
        .select('id, user_id, company_name, industry, company_size, website_url, location_country, phone_number, phone_verified, logo_url, created_at')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      setBrandProfile(data);
      if (data?.phone_number) {
        setPhoneNumber(data.phone_number);
      }
    } catch (error) {
      console.error('Error fetching brand profile:', error);
      toast.error("Failed to load account information");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    setSendingOtp(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: phoneNumber });
      if (error) throw error;
      setOtpSent(true);
      toast.success("Verification code sent to your phone");
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast.error(error.message || "Failed to send verification code");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }
    setVerifyingOtp(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ phone: phoneNumber, token: otpCode, type: 'sms' });
      if (error) throw error;
      const { error: updateError } = await supabase
        .from('brand_profiles')
        .update({ phone_number: phoneNumber, phone_verified: true })
        .eq('id', brandProfile?.id);
      if (updateError) throw updateError;
      toast.success("Phone number verified successfully!");
      setOtpSent(false);
      setOtpCode("");
      setIsEditingPhone(false);
      fetchBrandProfile();
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast.error(error.message || "Invalid verification code");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleCancelPhoneEdit = () => {
    setIsEditingPhone(false);
    setOtpSent(false);
    setOtpCode("");
    setPhoneNumber(brandProfile?.phone_number || "");
  };

  const handleLogoUpload = async (file: File) => {
    if (!brandProfile) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo must be under 5MB");
      return;
    }
    setUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${brandProfile.user_id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('brand-logos').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage.from('brand-logos').getPublicUrl(filePath);
      const { error: updateError } = await supabase
        .from('brand_profiles')
        .update({ logo_url: publicUrlData.publicUrl })
        .eq('id', brandProfile.id);
      if (updateError) throw updateError;
      toast.success("Logo updated!");
      fetchBrandProfile();
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error("Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3 max-w-3xl">
      {/* Brand Identity Header — merged logo + plan */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <label className="cursor-pointer group relative flex-shrink-0">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleLogoUpload(file);
                }}
                disabled={uploadingLogo}
              />
              <ProfileAvatar
                src={brandProfile?.logo_url}
                fallbackName={brandProfile?.company_name || "B"}
                className="h-14 w-14"
              />
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingLogo ? (
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                ) : (
                  <Camera className="h-4 w-4 text-white" />
                )}
              </div>
            </label>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-semibold truncate">{brandProfile?.company_name}</h2>
                <Badge variant={planType === "free" ? "secondary" : "default"} className="text-[11px] px-2 py-0">
                  <Crown className="h-3 w-3 mr-1" />
                  {planType.charAt(0).toUpperCase() + planType.slice(1)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Hover logo to change</p>
            </div>
            <Button variant="outline" size="sm" className="gap-1 flex-shrink-0" onClick={() => setUpgradeOpen(true)}>
              {planType === "free" ? "Upgrade" : "Change Plan"} <ArrowUpRight className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
      <UpgradePlanDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} currentPlan={planType} />

      {/* Phone Verification */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Phone className="h-3.5 w-3.5" />
            Phone Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          {!isEditingPhone ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {brandProfile?.phone_number ? (
                  <>
                    <span className="font-mono text-sm">{brandProfile.phone_number}</span>
                    {brandProfile.phone_verified ? (
                      <Badge variant="default" className="gap-1 bg-green-600 text-[11px] px-1.5 py-0">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1 text-[11px] px-1.5 py-0">
                        <AlertCircle className="h-3 w-3" />
                        Not Verified
                      </Badge>
                    )}
                  </>
                ) : (
                  <span className="text-muted-foreground text-sm">No phone number added</span>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsEditingPhone(true)}>
                {brandProfile?.phone_number ? "Update" : "Add Phone"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {!otpSent ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Phone Number</label>
                    <PhoneInput value={phoneNumber} onChange={setPhoneNumber} placeholder="Enter your phone number" />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSendOtp} disabled={sendingOtp || !phoneNumber} size="sm">
                      {sendingOtp && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Send Code
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleCancelPhoneEdit}>Cancel</Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Enter Verification Code</label>
                    <p className="text-xs text-muted-foreground">We sent a 6-digit code to {phoneNumber}</p>
                    <InputOTP value={otpCode} onChange={setOtpCode} maxLength={6}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleVerifyOtp} disabled={verifyingOtp || otpCode.length !== 6} size="sm">
                      {verifyingOtp && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Verify
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setOtpSent(false); setOtpCode(""); }}>Change Number</Button>
                    <Button variant="ghost" size="sm" onClick={handleCancelPhoneEdit}>Cancel</Button>
                  </div>
                </>
              )}
            </div>
          )}
          {!brandProfile?.phone_verified && !isEditingPhone && (
            <p className="text-xs text-muted-foreground">Phone verification is required for business verification badge</p>
          )}
        </CardContent>
      </Card>

      {/* Verification Badge */}
      {brandProfile && (
        <BrandVerificationBadgeCard brandProfileId={brandProfile.id} phoneVerified={brandProfile.phone_verified || false} />
      )}

      {/* Team Access */}
      {brandProfile && (
        <TeamAccessCard
          profileId={brandProfile.id}
          accountType="brand"
          locked={planType !== "pro"}
          lockedMessage="Team access is available on the Pro plan. Upgrade to invite team members."
          onUpgrade={() => setUpgradeOpen(true)}
        />
      )}

      {/* Account Details — merged company + account info */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5" />
            Account Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid gap-0 text-sm">
            <div className="flex items-center justify-between py-1.5 border-b">
              <span className="text-muted-foreground">Company</span>
              <span className="font-medium">{brandProfile?.company_name || "—"}</span>
            </div>
            {brandProfile?.industry && (
              <div className="flex items-center justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Industry</span>
                <span>{brandProfile.industry}</span>
              </div>
            )}
            {brandProfile?.company_size && (
              <div className="flex items-center justify-between py-1.5 border-b">
                <span className="text-muted-foreground">Size</span>
                <span>{brandProfile.company_size}</span>
              </div>
            )}
            {brandProfile?.website_url && (
              <div className="flex items-center justify-between py-1.5 border-b">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  Website
                </span>
                <a href={brandProfile.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-[200px]">
                  {brandProfile.website_url}
                </a>
              </div>
            )}
            {brandProfile?.location_country && (
              <div className="flex items-center justify-between py-1.5 border-b">
                <span className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Location
                </span>
                <span>{brandProfile.location_country}</span>
              </div>
            )}
            <div className="flex items-center justify-between py-1.5 border-b">
              <span className="text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Email
              </span>
              <span className="font-medium">{userEmail || "—"}</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Member Since
              </span>
              <span>
                {brandProfile?.created_at
                  ? new Date(brandProfile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                  : "—"
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandAccountTab;
