import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import PhoneInput from "@/components/PhoneInput";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.94 9.88c-.02-2.04 1.67-3.03 1.74-3.07-.95-1.38-2.43-1.57-2.95-1.59-1.25-.13-2.46.74-3.1.74-.64 0-1.62-.72-2.67-.7-1.37.02-2.65.8-3.35 2.03-1.44 2.49-.37 6.17 1.02 8.19.69.99 1.5 2.1 2.57 2.06 1.03-.04 1.42-.66 2.67-.66 1.24 0 1.6.66 2.68.64 1.11-.02 1.81-.99 2.48-1.99.79-1.14 1.11-2.25 1.13-2.31-.03-.01-2.16-.83-2.18-3.28l-.04-.06zM12.87 3.53c.56-.69.94-1.63.84-2.58-.81.03-1.8.55-2.38 1.23-.52.6-.98 1.57-.86 2.49.91.07 1.84-.46 2.4-1.14z" fill="currentColor"/>
  </svg>
);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Phone login states
  const [isPhoneMode, setIsPhoneMode] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [phoneLoading, setPhoneLoading] = useState(false);
  
  // Role selection dialog
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState("");
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Login: Auth state changed:', event, session?.user?.email);
      if (event === 'SIGNED_IN' && session && !isPhoneMode) {
        // Use a slight delay to ensure state is propagated
        setTimeout(() => {
          // Redirect creators to dashboard on native, home on web
          if (isNative) {
            navigate("/creator-dashboard");
          } else {
            navigate("/");
          }
        }, 100);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        if (isNative) {
          navigate("/creator-dashboard");
        } else {
          navigate("/");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, isPhoneMode, isNative]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Login failed",
            description: "Invalid email or password. Please try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Check your email",
          description: "We've sent you a password reset link.",
        });
        setIsResetMode(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast({
      title: "Coming Soon",
      description: `${provider} login will be available soon.`,
    });
  };

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return;
    }

    setPhoneLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });

      if (error) throw error;

      setOtpSent(true);
      toast({
        title: "Verification code sent",
        description: "Please enter the 6-digit code sent to your phone.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to send code",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter the 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    setPhoneLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: otpCode,
        type: 'sms',
      });

      if (error) throw error;

      if (data.user) {
        // Check if user has a profile (creator or brand) by phone number
        const [creatorResult, brandResult] = await Promise.all([
          supabase
            .from('creator_profiles')
            .select('id, user_id')
            .eq('phone_number', phoneNumber)
            .maybeSingle(),
          supabase
            .from('brand_profiles')
            .select('id, user_id')
            .eq('phone_number', phoneNumber)
            .maybeSingle(),
        ]);

        const hasCreatorProfile = creatorResult.data !== null;
        const hasBrandProfile = brandResult.data !== null;

        if (hasCreatorProfile) {
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in.",
          });
          navigate("/creator-dashboard");
        } else if (hasBrandProfile) {
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in.",
          });
          navigate("/brand-dashboard");
        } else {
          // New user - show role selection
          setPendingPhoneNumber(phoneNumber);
          setShowRoleDialog(true);
        }
      }
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleRoleSelection = async (role: 'creator' | 'brand') => {
    setShowRoleDialog(false);
    
    // Sign out from the phone session since signup pages will handle full account creation
    await supabase.auth.signOut();
    
    // Navigate to signup with phone pre-verified
    const params = new URLSearchParams({
      phone: pendingPhoneNumber,
      phoneVerified: 'true',
    });
    
    if (role === 'creator') {
      navigate(`/creator?${params.toString()}`);
    } else {
      navigate(`/brand-signup?${params.toString()}`);
    }
  };

  const resetPhoneMode = () => {
    setIsPhoneMode(false);
    setOtpSent(false);
    setOtpCode("");
    setPhoneNumber("");
  };

  // Phone login mode
  if (isPhoneMode) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />

        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-md">
            <button
              onClick={resetPhoneMode}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </button>

            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-heading font-bold italic mb-2">
                Sign in with Phone
              </h1>
            </div>

            <div className="space-y-6">
              {!otpSent ? (
                <>
                  <div>
                    <PhoneInput
                      value={phoneNumber}
                      onChange={setPhoneNumber}
                      disabled={phoneLoading}
                    />
                  </div>
                  <Button
                    onClick={handleSendOTP}
                    disabled={phoneLoading || !phoneNumber}
                    className="w-full h-12 text-base font-medium bg-foreground text-background hover:bg-foreground/90"
                  >
                    {phoneLoading ? "Sending..." : "Send Verification Code"}
                  </Button>
                </>
              ) : (
                <>
                  <div className="text-center mb-4">
                    <p className="text-muted-foreground">
                      Enter the 6-digit code sent to
                    </p>
                    <p className="font-medium text-foreground">{phoneNumber}</p>
                  </div>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otpCode}
                      onChange={setOtpCode}
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
                  <Button
                    onClick={handleVerifyOTP}
                    disabled={phoneLoading || otpCode.length !== 6}
                    className="w-full h-12 text-base font-medium bg-foreground text-background hover:bg-foreground/90"
                  >
                    {phoneLoading ? "Verifying..." : "Verify & Sign In"}
                  </Button>
                  <button
                    onClick={() => {
                      setOtpSent(false);
                      setOtpCode("");
                    }}
                    className="w-full text-center text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    Didn't receive code? Try again
                  </button>
                </>
              )}
            </div>
          </div>
        </main>

        {/* Role Selection Dialog */}
        <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading">Welcome to CollabHunts!</DialogTitle>
              <DialogDescription>
                It looks like you're new here. How would you like to join?
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 mt-4">
              <Button
                onClick={() => handleRoleSelection('creator')}
                className="w-full h-12 bg-primary hover:bg-primary/90"
              >
                Join as a Creator
              </Button>
              <Button
                onClick={() => handleRoleSelection('brand')}
                variant="outline"
                className="w-full h-12"
              >
                Register a Brand
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Reset password mode
  if (isResetMode) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />

        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-heading font-bold italic mb-2">
                Reset Password
              </h1>
              <p className="text-muted-foreground mt-4">
                Enter your email to receive a reset link
              </p>
            </div>

            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 text-base border-border"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium bg-foreground text-background hover:bg-foreground/90" 
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>

            <div className="text-center mt-6">
              <button
                onClick={() => setIsResetMode(false)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                disabled={isLoading}
              >
                Back to login
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Main login view
  return (
    <div className={`min-h-screen flex flex-col bg-background ${isNative ? 'safe-area-top' : ''}`}>
      {/* Hide navbar on native for cleaner mobile experience */}
      {!isNative && <Navbar />}

      <main className={`flex-1 flex items-center justify-center py-12 px-4 ${isNative ? 'pt-8' : ''}`}>
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className={`font-heading font-bold italic mb-2 ${isNative ? 'text-3xl' : 'text-4xl md:text-5xl'}`}>
              {isNative ? 'CollabHunts' : 'Welcome Back'}
            </h1>
            {isNative && (
              <p className="text-muted-foreground text-sm">Sign in to your creator account</p>
            )}
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-base font-medium border-border hover:bg-muted/50"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <GoogleIcon />
              <span className="ml-3">Sign in with Google</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-base font-medium border-border hover:bg-muted/50"
              onClick={() => handleSocialLogin("Apple")}
              disabled={isLoading}
            >
              <AppleIcon />
              <span className="ml-3">Sign in with Apple</span>
            </Button>

            {/* Phone login temporarily disabled until Twilio is configured
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-base font-medium border-border hover:bg-muted/50"
              onClick={() => setIsPhoneMode(true)}
              disabled={isLoading}
            >
              <Phone className="h-[18px] w-[18px]" />
              <span className="ml-3">Sign in with Phone</span>
            </Button>
            */}
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground">or</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-12 text-base border-border"
              />
            </div>

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-12 text-base border-border pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium bg-foreground text-background hover:bg-foreground/90" 
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Log in"}
            </Button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={() => setIsResetMode(true)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              disabled={isLoading}
            >
              Forgot password?
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/brand-signup" className="text-foreground hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
