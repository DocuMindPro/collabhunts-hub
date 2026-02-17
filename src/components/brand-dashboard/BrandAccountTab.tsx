import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Phone, Mail, Globe, MapPin, Calendar, CheckCircle2, AlertCircle, Loader2, Camera, Crown, ArrowUpRight, LogOut } from "lucide-react";
import ProfileAvatar from "@/components/ProfileAvatar";
import PhoneInput from "@/components/PhoneInput";
import { getCurrentPlanType } from "@/lib/subscription-utils";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import BrandVerificationBadgeCard from "./BrandVerificationBadgeCard";
import TeamAccessCard from "@/components/team/TeamAccessCard";
import UpgradePlanDialog from "./UpgradePlanDialog";
import { Capacitor } from "@capacitor/core";

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
  const isNative = Capacitor.isNativePlatform();
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
  const [signingOut, setSigningOut] = useState(false);

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

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
    } catch {
      setSigningOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const memberSince = brandProfile?.created_at
    ? new Date(brandProfile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : null;

  return (
    <div className="space-y-2.5 max-w-3xl">
      {/* ── Premium Brand Identity Hero ── */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent">
          <CardContent className="p-5">
            <div className="flex items-center gap-5">
              {/* Logo with ring accent */}
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
                <div className="ring-2 ring-primary/20 ring-offset-2 ring-offset-background rounded-full shadow-md">
                  <ProfileAvatar
                    src={brandProfile?.logo_url}
                    fallbackName={brandProfile?.company_name || "B"}
                    className="h-16 w-16"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  {uploadingLogo ? (
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4 text-white" />
                  )}
                </div>
              </label>

              {/* Name + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold truncate">{brandProfile?.company_name}</h2>
                  <Badge variant={planType === "free" ? "secondary" : "default"} className="text-[11px] px-2 py-0 font-medium">
                    <Crown className="h-3 w-3 mr-1" />
                    {planType.charAt(0).toUpperCase() + planType.slice(1)}
                  </Badge>
                </div>
                {userEmail && (
                  <p className="text-sm text-muted-foreground mt-0.5 truncate">{userEmail}</p>
                )}
                {memberSince && (
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    <Calendar className="h-3 w-3 inline mr-1 -mt-0.5" />
                    Member since {memberSince}
                  </p>
                )}
              </div>

              {/* Upgrade CTA */}
              <Button
                size="sm"
                className="flex-shrink-0 gap-1.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-sm hover:shadow-md transition-shadow"
                onClick={() => setUpgradeOpen(true)}
              >
                {planType === "free" ? "Upgrade" : "Change Plan"}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
      <UpgradePlanDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} currentPlan={planType} />

      {/* ── Two-Column Status Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {/* Phone Verification — compact inline */}
        <Card>
          <CardContent className="p-4">
            {!isEditingPhone ? (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  {brandProfile?.phone_number ? (
                    <>
                      <span className="font-mono text-sm truncate">{brandProfile.phone_number}</span>
                      {brandProfile.phone_verified ? (
                        <Badge variant="default" className="gap-1 bg-green-600 text-[11px] px-1.5 py-0 flex-shrink-0">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1 text-[11px] px-1.5 py-0 flex-shrink-0">
                          <AlertCircle className="h-3 w-3" />
                          Unverified
                        </Badge>
                      )}
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">No phone added</span>
                  )}
                </div>
                <Button variant="outline" size="sm" className="flex-shrink-0 h-7 text-xs px-2.5" onClick={() => setIsEditingPhone(true)}>
                  {brandProfile?.phone_number ? "Update" : "Add"}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Phone Verification
                </div>
                {!otpSent ? (
                  <>
                    <PhoneInput value={phoneNumber} onChange={setPhoneNumber} placeholder="Enter your phone number" />
                    <div className="flex gap-2">
                      <Button onClick={handleSendOtp} disabled={sendingOtp || !phoneNumber} size="sm" className="h-8 text-xs">
                        {sendingOtp && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                        Send Code
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={handleCancelPhoneEdit}>Cancel</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">Code sent to {phoneNumber}</p>
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
                      <Button onClick={handleVerifyOtp} disabled={verifyingOtp || otpCode.length !== 6} size="sm" className="h-8 text-xs">
                        {verifyingOtp && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                        Verify
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => { setOtpSent(false); setOtpCode(""); }}>Change</Button>
                      <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={handleCancelPhoneEdit}>Cancel</Button>
                    </div>
                  </>
                )}
              </div>
            )}
            {!brandProfile?.phone_verified && !isEditingPhone && (
              <p className="text-[11px] text-muted-foreground mt-2">Required for business verification</p>
            )}
          </CardContent>
        </Card>

        {/* Verification Badge */}
        {brandProfile && (
          <BrandVerificationBadgeCard brandProfileId={brandProfile.id} phoneVerified={brandProfile.phone_verified || false} />
        )}
      </div>

      {/* ── Team Access ── */}
      {brandProfile && (
        <TeamAccessCard
          profileId={brandProfile.id}
          accountType="brand"
          locked={planType !== "pro"}
          lockedMessage="Team access is available on the Pro plan. Upgrade to invite team members."
          onUpgrade={() => setUpgradeOpen(true)}
        />
      )}

      {/* ── Streamlined Account Details ── */}
      {(brandProfile?.industry || brandProfile?.company_size || brandProfile?.website_url || brandProfile?.location_country) && (
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5" />
              Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid gap-0 text-sm">
              {brandProfile?.industry && (
                <div className="flex items-center justify-between py-1.5 rounded-sm even:bg-muted/30 px-1">
                  <span className="text-muted-foreground">Industry</span>
                  <span className="font-medium">{brandProfile.industry}</span>
                </div>
              )}
              {brandProfile?.company_size && (
                <div className="flex items-center justify-between py-1.5 rounded-sm even:bg-muted/30 px-1">
                  <span className="text-muted-foreground">Size</span>
                  <span className="font-medium">{brandProfile.company_size}</span>
                </div>
              )}
              {brandProfile?.website_url && (
                <div className="flex items-center justify-between py-1.5 rounded-sm even:bg-muted/30 px-1">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    Website
                  </span>
                  <a href={brandProfile.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-[200px] font-medium">
                    {brandProfile.website_url.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              {brandProfile?.location_country && (
                <div className="flex items-center justify-between py-1.5 rounded-sm even:bg-muted/30 px-1">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Location
                  </span>
                  <span className="font-medium">{brandProfile.location_country}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sign Out — native only */}
      {isNative && (
        <div className="pt-2 pb-6">
          <Button
            variant="outline"
            className="w-full h-12 text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <LogOut className="h-4 w-4 mr-2" />
            )}
            Sign Out
          </Button>
        </div>
      )}
    </div>
  );
};

export default BrandAccountTab;
