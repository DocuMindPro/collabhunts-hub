import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
import { Phone, CheckCircle, Loader2 } from "lucide-react";
import PhoneInput from "@/components/PhoneInput";
import CountrySelect from "@/components/CountrySelect";

// Validation schemas
const emailSchema = z.string().email("Invalid email address").max(255);
const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(100);
const companyNameSchema = z.string().trim().min(2, "Company name must be at least 2 characters").max(200);
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

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [locationCountry, setLocationCountry] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

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
    
    if (!phoneVerified) {
      toast({
        title: "Phone Verification Required",
        description: "Please verify your phone number before creating your account",
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

    setIsLoading(true);

    try {
      // Validate inputs
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
            full_name: fullName,
            user_type: "brand"
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("Failed to create user");

      // Create brand profile with phone info, country and terms acceptance
      const { error: profileError } = await supabase
        .from("brand_profiles")
        .insert({
          user_id: authData.user.id,
          company_name: companyName,
          website_url: websiteUrl || null,
          industry,
          company_size: companySize,
          location_country: locationCountry || null,
          phone_number: phoneNumber,
          phone_verified: true,
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

      toast({
        title: "Welcome to CollabHunts!",
        description: "Let's personalize your experience."
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
            <h1 className="text-4xl font-heading font-bold mb-2">Register Your Venue</h1>
            <p className="text-muted-foreground">Host creator events and drive foot traffic to your location</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Create Your Venue Account</CardTitle>
              <CardDescription>Fill in your venue details to start hosting events</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Your Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
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
                    <span className="text-destructive text-xs">*Required</span>
                  </div>
                  
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
                  <h3 className="font-semibold mb-3">Venue Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="companyName">Venue / Business Name</Label>
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
                      I agree to the <a href="/terms" target="_blank" className="text-primary hover:underline">Terms of Service</a>, 
                      including the <strong>72-hour auto-release policy</strong> and <strong>binding arbitration clause</strong>. 
                      I understand that inaction on deliverables for 72 hours constitutes acceptance.
                    </span>
                  </label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full gradient-hero hover:opacity-90" 
                  size="lg"
                  disabled={isLoading || !phoneVerified || !termsAccepted}
                >
                  {isLoading ? "Creating Account..." : "Create Brand Account"}
                </Button>

                {(!phoneVerified || !termsAccepted) && (
                  <p className="text-xs text-center text-muted-foreground">
                    {!phoneVerified ? "Phone verification required" : "Please accept Terms of Service"}
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
