import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useVerificationSettings } from "@/hooks/useVerificationSettings";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { Phone, CheckCircle, Loader2, AlertCircle, Camera, Facebook, Instagram } from "lucide-react";
import PhoneInput from "@/components/PhoneInput";
import CountrySelect from "@/components/CountrySelect";
import ProfileAvatar from "@/components/ProfileAvatar";

// Validation schemas
const emailSchema = z.string().email("Invalid email address").max(255);
const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(100);
const companyNameSchema = z.string().trim().min(2, "Company name must be at least 2 characters").max(200);
const firstNameSchema = z.string().trim().min(2, "First name must be at least 2 characters").max(50);
const lastNameSchema = z.string().trim().min(2, "Last name must be at least 2 characters").max(50);
const positionSchema = z.string().trim().min(2, "Position is required").max(100);
const addressSchema = z.string().trim().min(5, "Address must be at least 5 characters").max(300);
const websiteSchema = z.string().url("Invalid URL").or(z.literal(""));
const phoneSchema = z.string()
  .min(10, "Phone number must be at least 10 digits")
  .max(20, "Phone number must be less than 20 digits")
  .regex(/^\+[1-9]\d{6,14}$/, "Please enter a valid phone number");

const BrandSignup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { requirePhone, loading: verificationLoading } = useVerificationSettings();

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contactPosition, setContactPosition] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [locationCountry, setLocationCountry] = useState("LB");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Social media
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");

  // Logo upload
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Phone verification
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const industries = [
    "Fashion & Apparel",
    "Beauty & Cosmetics",
    "Technology",
    "Food & Beverage",
    "Travel & Hospitality",
    "Health & Wellness",
    "Entertainment",
    "Sports & Fitness",
    "Home & Garden",
    "Automotive",
    "Finance",
    "Education",
    "Other"
  ];

  const companySizes = [
    "1-10 employees",
    "11-50 employees",
    "51-200 employees",
    "201-500 employees",
    "501-1000 employees",
    "1000+ employees"
  ];

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });
    
    // Check for pre-verified phone from URL params (from phone login flow)
    const preVerifiedPhone = searchParams.get('phone');
    const isPhoneVerified = searchParams.get('phoneVerified') === 'true';
    
    if (preVerifiedPhone && isPhoneVerified) {
      setPhoneNumber(preVerifiedPhone);
      setPhoneVerified(true);
      toast({
        title: "Phone already verified",
        description: "Your phone number has been pre-verified. Complete your profile to continue.",
      });
    }

    // Store referral code if present
    const refCode = searchParams.get('ref');
    if (refCode) {
      localStorage.setItem('affiliate_referral_code', refCode);
    }
  }, [navigate, searchParams, toast]);

  const handleSendOtp = async () => {
    try {
      phoneSchema.parse(phoneNumber);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Invalid Phone Number",
          description: error.errors[0].message,
          variant: "destructive"
        });
        return;
      }
    }

    setSendingOtp(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });

      if (error) throw error;

      toast({
        title: "Code Sent",
        description: "A verification code has been sent to your phone",
      });
    } catch (error: any) {
      console.error("OTP send error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send verification code",
        variant: "destructive"
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (phoneOtp.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    setVerifyingOtp(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: phoneOtp,
        type: 'sms',
      });

      if (error) throw error;

      // Sign out from the phone auth session (we'll create proper account in final submit)
      await supabase.auth.signOut();
      
      setPhoneVerified(true);
      toast({
        title: "Phone Verified",
        description: "Your phone number has been verified successfully",
      });
    } catch (error: any) {
      console.error("OTP verify error:", error);
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code",
        variant: "destructive"
      });
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (requirePhone && !phoneVerified) {
      toast({
        title: "Phone Verification Required",
        description: "Please verify your phone number before creating your account",
        variant: "destructive"
      });
      return;
    }

    if (!logoFile) {
      toast({
        title: "Logo Required",
        description: "Please upload your brand logo",
        variant: "destructive"
      });
      return;
    }

    if (!termsAccepted) {
      toast({
        title: "Terms Required",
        description: "Please accept the Terms of Service to continue",
        variant: "destructive"
      });
      return;
    }

    if (!locationCountry) {
      toast({
        title: "Country Required",
        description: "Please select your country",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Validate inputs
      firstNameSchema.parse(firstName);
      lastNameSchema.parse(lastName);
      positionSchema.parse(contactPosition);
      addressSchema.parse(venueAddress);
      emailSchema.parse(email);
      passwordSchema.parse(password);
      companyNameSchema.parse(companyName);
      
      if (websiteUrl) {
        websiteSchema.parse(websiteUrl);
      }

      // Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: `${firstName} ${lastName}`,
            user_type: "brand"
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("Failed to create user");

      // Upload logo
      let logoUrl: string | null = null;
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const filePath = `${authData.user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('brand-logos')
          .upload(filePath, logoFile);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage
          .from('brand-logos')
          .getPublicUrl(filePath);
        logoUrl = publicUrlData.publicUrl;
      }

      // Create brand profile with phone info, country and terms acceptance
      const { error: profileError } = await supabase
        .from("brand_profiles")
        .insert({
          user_id: authData.user.id,
          company_name: companyName,
          logo_url: logoUrl,
          first_name: firstName,
          last_name: lastName,
          contact_position: contactPosition,
          venue_address: venueAddress,
          website_url: websiteUrl || null,
          industry,
          company_size: companySize,
          location_country: locationCountry || null,
          phone_number: phoneNumber,
          phone_verified: true,
          facebook_url: facebookUrl || null,
          instagram_url: instagramUrl || null,
          tiktok_url: tiktokUrl || null,
          terms_accepted_at: new Date().toISOString(),
          terms_version: '1.0'
        });

      if (profileError) throw profileError;

      // Track affiliate referral if present
      const referralCode = localStorage.getItem('affiliate_referral_code');
      if (referralCode) {
        try {
          // Get affiliate by code
          const { data: affiliateId } = await supabase.rpc('get_affiliate_by_code', { _code: referralCode });
          
          if (affiliateId) {
            await supabase.from('referrals').insert({
              affiliate_id: affiliateId,
              referred_user_id: authData.user.id,
              referred_user_type: 'brand',
              referral_code_used: referralCode
            });
          }
          // Clear the stored code
          localStorage.removeItem('affiliate_referral_code');
        } catch (refError) {
          console.error('Error tracking referral:', refError);
        }
      }

      // Check for quotation inquiry param
      const quotationPlan = searchParams.get('quotation');
      if (quotationPlan && (quotationPlan === 'basic' || quotationPlan === 'pro')) {
        try {
          // Get the newly created brand profile
          const { data: newBrandProfile } = await supabase
            .from("brand_profiles")
            .select("id, company_name")
            .eq("user_id", authData.user.id)
            .maybeSingle();

          if (newBrandProfile) {
            await supabase.from("quotation_inquiries").insert({
              brand_profile_id: newBrandProfile.id,
              plan_type: quotationPlan,
            });

            // Notify admins
            const { data: admins } = await supabase
              .from("user_roles")
              .select("user_id")
              .eq("role", "admin");

            if (admins && admins.length > 0) {
              const notifications = admins.map((admin) => ({
                user_id: admin.user_id,
                title: "New Quotation Inquiry",
                message: `${newBrandProfile.company_name} is inquiring about the ${quotationPlan.charAt(0).toUpperCase() + quotationPlan.slice(1)} plan`,
                type: "quotation_inquiry",
                link: "/admin",
              }));
              await supabase.from("notifications").insert(notifications);
            }
          }
        } catch (quotationError) {
          console.error("Error submitting quotation inquiry:", quotationError);
        }
      }

      toast({
        title: "Welcome to CollabHunts!",
        description: quotationPlan
          ? `Thank you for inquiring about the ${quotationPlan.charAt(0).toUpperCase() + quotationPlan.slice(1)} plan. Our team will reach out soon!`
          : "Let's personalize your experience."
      });

      // Navigate to onboarding after signup
      setTimeout(() => {
        navigate("/brand-onboarding");
      }, 1000);

    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive"
        });
      } else if (error.message?.includes("already registered")) {
        toast({
          title: "Account Exists",
          description: "This email is already registered. Please login instead.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to create account",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 px-4 gradient-subtle">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-heading font-bold mb-2">Register Your Brand</h1>
            <p className="text-muted-foreground">Host creator events and drive foot traffic to your location</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Create Your Brand Account</CardTitle>
              <CardDescription>Fill in your brand details to start hosting events</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      maxLength={50}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      maxLength={50}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="contactPosition">Your Position / Title</Label>
                  <Input
                    id="contactPosition"
                    placeholder="e.g., Marketing Manager, Owner"
                    value={contactPosition}
                    onChange={(e) => setContactPosition(e.target.value)}
                    required
                    maxLength={100}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Work Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    maxLength={255}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    maxLength={100}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Minimum 8 characters</p>
                </div>

                {/* Phone Verification Section */}
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Phone className="h-4 w-4 text-primary" />
                    <Label className="font-semibold">Phone Verification</Label>
                    {requirePhone ? (
                      <span className="text-destructive text-xs">*Required</span>
                    ) : (
                      <span className="text-muted-foreground text-xs">(Optional - Testing Mode)</span>
                    )}
                  </div>
                  
                  {!requirePhone && !phoneVerified && (
                    <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-md mb-3">
                      <AlertCircle className="h-4 w-4" />
                      <span>Phone verification is disabled for testing</span>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="flex gap-2">
                        <PhoneInput
                          value={phoneNumber}
                          onChange={(num) => {
                            setPhoneNumber(num);
                            setPhoneVerified(false);
                            setPhoneOtp("");
                          }}
                          disabled={isLoading || phoneVerified}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSendOtp}
                          disabled={isLoading || sendingOtp || phoneVerified || phoneNumber.length < 10}
                        >
                          {sendingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Code"}
                        </Button>
                      </div>
                    </div>

                    {!phoneVerified && phoneNumber.length >= 10 && (
                      <div>
                        <Label htmlFor="otp">Verification Code</Label>
                        <div className="flex gap-2">
                          <Input
                            id="otp"
                            type="text"
                            value={phoneOtp}
                            onChange={(e) => setPhoneOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                            placeholder="Enter 6-digit code"
                            maxLength={6}
                            disabled={isLoading || verifyingOtp}
                          />
                          <Button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={isLoading || verifyingOtp || phoneOtp.length !== 6}
                          >
                            {verifyingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                          </Button>
                        </div>
                      </div>
                    )}

                    {phoneVerified && (
                      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded-md">
                        <CheckCircle className="h-4 w-4" />
                        <span>Phone number verified</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Brand Information</h3>
                  
                  <div className="space-y-4">
                    {/* Logo Upload */}
                    <div className="flex flex-col items-center gap-2">
                      <Label className="text-sm">Brand Logo <span className="text-destructive">*</span></Label>
                      <label className="cursor-pointer group">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 5 * 1024 * 1024) {
                                toast({ title: "File too large", description: "Logo must be under 5MB", variant: "destructive" });
                                return;
                              }
                              setLogoFile(file);
                              setLogoPreview(URL.createObjectURL(file));
                            }
                          }}
                          disabled={isLoading}
                        />
                        <div className="relative">
                          <ProfileAvatar
                            src={logoPreview}
                            fallbackName={companyName || "B"}
                            className="h-20 w-20"
                          />
                          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="h-5 w-5 text-white" />
                          </div>
                        </div>
                      </label>
                      <p className="text-[11px] text-muted-foreground">Click to upload (max 5MB)</p>
                    </div>

                    <div>
                      <Label htmlFor="companyName">Brand / Business Name</Label>
                      <Input
                        id="companyName"
                        placeholder="e.g., The Coffee House, Sunset Lounge"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                        maxLength={200}
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="websiteUrl">Website (Optional)</Label>
                      <Input
                        id="websiteUrl"
                        type="url"
                        placeholder="https://example.com"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      <Select value={industry} onValueChange={setIndustry} required disabled={isLoading}>
                        <SelectTrigger id="industry">
                          <SelectValue placeholder="Select your industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {industries.map((ind) => (
                            <SelectItem key={ind} value={ind}>
                              {ind}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="companySize">Company Size</Label>
                      <Select value={companySize} onValueChange={setCompanySize} required disabled={isLoading}>
                        <SelectTrigger id="companySize">
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                        <SelectContent>
                          {companySizes.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="country">Country</Label>
                      <CountrySelect
                        value={locationCountry}
                        onChange={setLocationCountry}
                        disabled={isLoading}
                        placeholder="Select your country"
                      />
                    </div>

                    <div>
                      <Label htmlFor="venueAddress">Business Address</Label>
                      <Input
                        id="venueAddress"
                        placeholder="e.g., Hamra Street, Beirut"
                        value={venueAddress}
                        onChange={(e) => setVenueAddress(e.target.value)}
                        required
                        maxLength={300}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                {/* Social Media Accounts */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Social Media Accounts</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="facebookUrl" className="flex items-center gap-2">
                        <Facebook className="h-4 w-4 text-[#1877F2]" /> Facebook
                      </Label>
                      <Input
                        id="facebookUrl"
                        placeholder="https://facebook.com/yourbrand"
                        value={facebookUrl}
                        onChange={(e) => setFacebookUrl(e.target.value)}
                        maxLength={300}
                        disabled={isLoading}
                      />
                      {facebookUrl && !facebookUrl.includes("facebook.com/") && !facebookUrl.includes("fb.com/") && (
                        <p className="text-xs text-destructive mt-1">URL must contain facebook.com/ or fb.com/</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="instagramUrl" className="flex items-center gap-2">
                        <Instagram className="h-4 w-4 text-[#E4405F]" /> Instagram
                      </Label>
                      <Input
                        id="instagramUrl"
                        placeholder="https://instagram.com/yourbrand"
                        value={instagramUrl}
                        onChange={(e) => setInstagramUrl(e.target.value)}
                        maxLength={300}
                        disabled={isLoading}
                      />
                      {instagramUrl && !instagramUrl.includes("instagram.com/") && (
                        <p className="text-xs text-destructive mt-1">URL must contain instagram.com/</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="tiktokUrl" className="flex items-center gap-2">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.61a8.21 8.21 0 0 0 4.76 1.52v-3.44h-1z"/></svg>
                        TikTok
                      </Label>
                      <Input
                        id="tiktokUrl"
                        placeholder="https://tiktok.com/@yourbrand"
                        value={tiktokUrl}
                        onChange={(e) => setTiktokUrl(e.target.value)}
                        maxLength={300}
                        disabled={isLoading}
                      />
                      {tiktokUrl && !tiktokUrl.includes("tiktok.com/@") && (
                        <p className="text-xs text-destructive mt-1">URL must contain tiktok.com/@</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="border-t pt-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-input"
                      disabled={isLoading}
                    />
                    <span className="text-sm text-muted-foreground">
                      I agree to the <a href="/terms" target="_blank" className="text-primary hover:underline">Terms of Service</a> and 
                      the <strong>binding arbitration clause</strong>.
                    </span>
                  </label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full gradient-hero hover:opacity-90" 
                  size="lg"
                  disabled={isLoading || (requirePhone && !phoneVerified) || !termsAccepted || !logoFile}
                >
                  {isLoading ? "Creating Account..." : "Create Brand Account"}
                </Button>

                {((requirePhone && !phoneVerified) || !termsAccepted || !logoFile) && (
                  <p className="text-xs text-center text-muted-foreground">
                    {!logoFile ? "Brand logo required" : requirePhone && !phoneVerified ? "Phone verification required" : !termsAccepted ? "Please accept Terms of Service" : ""}
                  </p>
                )}

                <p className="text-sm text-center text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-primary hover:underline"
                    disabled={isLoading}
                  >
                    Login
                  </button>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default BrandSignup;
