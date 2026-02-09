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
import { z } from "zod";
import { Phone, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import PhoneInput from "@/components/PhoneInput";

// Validation schemas
const emailSchema = z.string().email("Invalid email address").max(255);
const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(100);
const firstNameSchema = z.string().trim().min(2, "First name must be at least 2 characters").max(50);
const lastNameSchema = z.string().trim().min(2, "Last name must be at least 2 characters").max(50);
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

  // Tier 1 fields only
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Phone verification
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });
    
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
        toast({ title: "Invalid Phone Number", description: error.errors[0].message, variant: "destructive" });
        return;
      }
    }

    setSendingOtp(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: phoneNumber });
      if (error) throw error;
      toast({ title: "Code Sent", description: "A verification code has been sent to your phone" });
    } catch (error: any) {
      console.error("OTP send error:", error);
      toast({ title: "Error", description: error.message || "Failed to send verification code", variant: "destructive" });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (phoneOtp.length !== 6) {
      toast({ title: "Invalid Code", description: "Please enter the 6-digit verification code", variant: "destructive" });
      return;
    }

    setVerifyingOtp(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ phone: phoneNumber, token: phoneOtp, type: 'sms' });
      if (error) throw error;
      await supabase.auth.signOut();
      setPhoneVerified(true);
      toast({ title: "Phone Verified", description: "Your phone number has been verified successfully" });
    } catch (error: any) {
      console.error("OTP verify error:", error);
      toast({ title: "Verification Failed", description: error.message || "Invalid verification code", variant: "destructive" });
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (requirePhone && !phoneVerified) {
      toast({ title: "Phone Verification Required", description: "Please verify your phone number before creating your account", variant: "destructive" });
      return;
    }

    if (!termsAccepted) {
      toast({ title: "Terms Required", description: "Please accept the Terms of Service to continue", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      firstNameSchema.parse(firstName);
      lastNameSchema.parse(lastName);
      emailSchema.parse(email);
      passwordSchema.parse(password);

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name: `${firstName} ${lastName}`, user_type: "brand" }
        }
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("Failed to create user");

      // Create brand profile with just basic info — registration_completed defaults to false
      const { error: profileError } = await supabase
        .from("brand_profiles")
        .insert({
          user_id: authData.user.id,
          company_name: `${firstName}'s Brand`, // placeholder
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          phone_verified: phoneVerified,
          terms_accepted_at: new Date().toISOString(),
          terms_version: '1.0',
        });

      if (profileError) throw profileError;

      // Track affiliate referral if present
      const referralCode = localStorage.getItem('affiliate_referral_code');
      if (referralCode) {
        try {
          const { data: affiliateId } = await supabase.rpc('get_affiliate_by_code', { _code: referralCode });
          if (affiliateId) {
            await supabase.from('referrals').insert({
              affiliate_id: affiliateId,
              referred_user_id: authData.user.id,
              referred_user_type: 'brand',
              referral_code_used: referralCode
            });
          }
          localStorage.removeItem('affiliate_referral_code');
        } catch (refError) {
          console.error('Error tracking referral:', refError);
        }
      }

      // Handle quotation inquiry
      const quotationPlan = searchParams.get('quotation');
      if (quotationPlan && (quotationPlan === 'basic' || quotationPlan === 'pro')) {
        try {
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
        description: "Your account has been created. Complete your brand registration to unlock all features.",
      });

      setTimeout(() => {
        navigate("/brand-dashboard");
      }, 1000);

    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({ title: "Validation Error", description: error.errors[0].message, variant: "destructive" });
      } else if (error.message?.includes("already registered")) {
        toast({ title: "Account Exists", description: "This email is already registered. Please login instead.", variant: "destructive" });
      } else {
        toast({ title: "Error", description: error.message || "Failed to create account", variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 px-4 gradient-subtle">
        <div className="max-w-md mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-heading font-bold mb-2">Get Started</h1>
            <p className="text-muted-foreground">Create your account in under a minute</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Signup</CardTitle>
              <CardDescription>Just the basics — you'll complete your brand profile after</CardDescription>
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
                  <Label htmlFor="email">Email</Label>
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

                {/* Phone Verification */}
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
                  disabled={isLoading || (requirePhone && !phoneVerified) || !termsAccepted}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>

                {((requirePhone && !phoneVerified) || !termsAccepted) && (
                  <p className="text-xs text-center text-muted-foreground">
                    {requirePhone && !phoneVerified ? "Phone verification required" : !termsAccepted ? "Please accept Terms of Service" : ""}
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
