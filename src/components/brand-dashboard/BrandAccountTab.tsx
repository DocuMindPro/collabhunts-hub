import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Phone, Mail, Globe, MapPin, Calendar, CheckCircle2, AlertCircle, Loader2, Camera } from "lucide-react";
import ProfileAvatar from "@/components/ProfileAvatar";
import PhoneInput from "@/components/PhoneInput";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import BrandVerificationBadgeCard from "./BrandVerificationBadgeCard";

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
  
  // Phone verification state
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    fetchBrandProfile();
  }, []);

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
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });

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
      const { error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: otpCode,
        type: 'sms',
      });

      if (error) throw error;

      // Update brand profile with verified phone
      const { error: updateError } = await supabase
        .from('brand_profiles')
        .update({
          phone_number: phoneNumber,
          phone_verified: true,
        })
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
      const { error: uploadError } = await supabase.storage
        .from('brand-logos')
        .upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage
        .from('brand-logos')
        .getPublicUrl(filePath);
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

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Brand Logo Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Brand Logo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer group relative">
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
                className="h-16 w-16"
              />
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingLogo ? (
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                ) : (
                  <Camera className="h-5 w-5 text-white" />
                )}
              </div>
            </label>
            <div>
              <p className="text-sm font-medium">{brandProfile?.company_name}</p>
              <p className="text-xs text-muted-foreground">Click the logo to change it</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phone Verification Card - Priority */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Phone Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEditingPhone ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {brandProfile?.phone_number ? (
                  <>
                    <span className="font-mono text-sm">{brandProfile.phone_number}</span>
                    {brandProfile.phone_verified ? (
                      <Badge variant="default" className="gap-1 bg-green-600">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Not Verified
                      </Badge>
                    )}
                  </>
                ) : (
                  <span className="text-muted-foreground text-sm">No phone number added</span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingPhone(true)}
              >
                {brandProfile?.phone_number ? "Update" : "Add Phone"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {!otpSent ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <PhoneInput
                      value={phoneNumber}
                      onChange={setPhoneNumber}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSendOtp}
                      disabled={sendingOtp || !phoneNumber}
                      size="sm"
                    >
                      {sendingOtp && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Send Code
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelPhoneEdit}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Enter Verification Code</label>
                    <p className="text-xs text-muted-foreground">
                      We sent a 6-digit code to {phoneNumber}
                    </p>
                    <InputOTP
                      value={otpCode}
                      onChange={setOtpCode}
                      maxLength={6}
                    >
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
                    <Button
                      onClick={handleVerifyOtp}
                      disabled={verifyingOtp || otpCode.length !== 6}
                      size="sm"
                    >
                      {verifyingOtp && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Verify
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpCode("");
                      }}
                    >
                      Change Number
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelPhoneEdit}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {!brandProfile?.phone_verified && !isEditingPhone && (
            <p className="text-xs text-muted-foreground">
              Phone verification is required for business verification badge
            </p>
          )}
        </CardContent>
      </Card>

      {/* Verification Badge Card */}
      {brandProfile && (
        <BrandVerificationBadgeCard 
          brandProfileId={brandProfile.id} 
          phoneVerified={brandProfile.phone_verified || false}
        />
      )}
      {/* Company Information Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Company Name</span>
              <span className="font-medium">{brandProfile?.company_name || "—"}</span>
            </div>
            {brandProfile?.industry && (
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground">Industry</span>
                <span>{brandProfile.industry}</span>
              </div>
            )}
            {brandProfile?.company_size && (
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground">Company Size</span>
                <span>{brandProfile.company_size}</span>
              </div>
            )}
            {brandProfile?.website_url && (
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5" />
                  Website
                </span>
                <a 
                  href={brandProfile.website_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {brandProfile.website_url}
                </a>
              </div>
            )}
            {brandProfile?.location_country && (
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  Location
                </span>
                <span>{brandProfile.location_country}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Information Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{userEmail || "—"}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Member Since
              </span>
              <span>
                {brandProfile?.created_at 
                  ? new Date(brandProfile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
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
