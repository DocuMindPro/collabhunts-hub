import { useState } from 'react';
import { useKeyboardScrollIntoView } from '@/hooks/useKeyboardScrollIntoView';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Loader2, ArrowLeft, Mic2, Building2, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import PhoneInput from '@/components/PhoneInput';
import { useVerificationSettings } from '@/hooks/useVerificationSettings';
import { NativeAppLogo } from '@/components/NativeAppLogo';

// Validation schemas matching website
const emailSchema = z.string().email("Invalid email address").max(255);
const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(100);
const firstNameSchema = z.string().trim().min(2, "First name must be at least 2 characters").max(50);
const lastNameSchema = z.string().trim().min(2, "Last name must be at least 2 characters").max(50);
const fullNameSchema = z.string().trim().min(5, "Name must be at least 5 characters").max(100);
const phoneSchema = z.string()
  .min(10, "Phone number must be at least 10 digits")
  .max(20, "Phone number must be less than 20 digits")
  .regex(/^\+[1-9]\d{6,14}$/, "Please enter a valid phone number");

type SignupRole = 'brand' | 'creator' | null;
type ViewMode = 'signin' | 'role-select' | 'brand-signup' | 'creator-signup';

export function NativeLogin() {
  const { requirePhone, loading: verificationLoading } = useVerificationSettings();
  // Keyboard scroll-into-view for brand/creator signup forms
  const brandScrollRef = useKeyboardScrollIntoView<HTMLDivElement>();
  const creatorScrollRef = useKeyboardScrollIntoView<HTMLDivElement>();

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('signin');

  // Sign-in fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Brand signup fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Creator signup fields
  const [fullName, setFullName] = useState('');

  // Shared signup fields
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Phone verification
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const resetSignupFields = () => {
    setFirstName('');
    setLastName('');
    setFullName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setTermsAccepted(false);
    setPhoneNumber('');
    setPhoneOtp('');
    setPhoneVerified(false);
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Google auth error:', error);
      toast.error(error.message || 'Google sign-in failed');
      setIsGoogleLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Welcome back!');
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    try {
      phoneSchema.parse(phoneNumber);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }
    setSendingOtp(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: phoneNumber });
      if (error) throw error;
      toast.success('Verification code sent to your phone');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send verification code');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (phoneOtp.length !== 6) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }
    setVerifyingOtp(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ phone: phoneNumber, token: phoneOtp, type: 'sms' });
      if (error) throw error;
      await supabase.auth.signOut();
      setPhoneVerified(true);
      toast.success('Phone number verified successfully');
    } catch (error: any) {
      toast.error(error.message || 'Invalid verification code');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleBrandSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      firstNameSchema.parse(firstName);
      lastNameSchema.parse(lastName);
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (requirePhone && !phoneVerified) {
      toast.error('Please verify your phone number');
      return;
    }

    if (!termsAccepted) {
      toast.error('Please accept the Terms of Service');
      return;
    }

    setIsLoading(true);
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: `${firstName} ${lastName}`,
            user_type: 'brand',
            // Store name in metadata so NativeBrandOnboarding can pre-fill it
            first_name: firstName,
            last_name: lastName,
          },
        },
      });
      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('Failed to create user');

      // Store phone info for onboarding to use if needed
      if (phoneNumber) {
        localStorage.setItem('signup_phone_number', phoneNumber);
        localStorage.setItem('signup_phone_verified', phoneVerified ? '1' : '0');
      }

      // NOTE: We do NOT insert brand_profiles here.
      // The RLS policy requires auth.uid() = user_id, but when email confirmation
      // is enabled, signUp() returns no session → auth.uid() is null → insert fails.
      // Instead, NativeAppGate detects user_type='brand' from user_metadata and
      // routes to NativeBrandOnboarding, which creates the profile after auth is confirmed.

      toast.success('Account created! Setting up your brand profile...');
      // NativeAppGate's onAuthStateChange will detect the new session and
      // route to NativeBrandOnboarding automatically.
    } catch (error: any) {
      if (error.message?.includes('already registered')) {
        toast.error('This email is already registered. Please sign in instead.');
      } else {
        toast.error(error.message || 'Failed to create account');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatorSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      fullNameSchema.parse(fullName);
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (requirePhone && !phoneVerified) {
      toast.error('Please verify your phone number');
      return;
    }

    if (!termsAccepted) {
      toast.error('Please accept the Terms of Service');
      return;
    }

    setIsLoading(true);
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: fullName, user_type: 'creator' },
        },
      });
      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('Failed to create user');

      // Track affiliate referral
      const referralCode = localStorage.getItem('affiliate_referral_code');
      if (referralCode) {
        try {
          const { data: affiliateId } = await supabase.rpc('get_affiliate_by_code', { _code: referralCode });
          if (affiliateId) {
            await supabase.from('referrals').insert({
              affiliate_id: affiliateId,
              referred_user_id: authData.user.id,
              referred_user_type: 'creator',
              referral_code_used: referralCode,
            });
          }
          localStorage.removeItem('affiliate_referral_code');
        } catch {}
      }

      toast.success('Account created! Complete your creator profile to get started.');
    } catch (error: any) {
      if (error.message?.includes('already registered')) {
        toast.error('This email is already registered. Please sign in instead.');
      } else {
        toast.error(error.message || 'Failed to create account');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Phone verification section (shared between brand/creator signup)
  const renderPhoneVerification = () => (
    <div className="border-t border-border pt-4">
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
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>Phone verification is disabled for testing</span>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <Label>Phone Number</Label>
          <div className="flex gap-2">
            <PhoneInput
              value={phoneNumber}
              onChange={(num) => {
                setPhoneNumber(num);
                setPhoneVerified(false);
                setPhoneOtp('');
              }}
              disabled={isLoading || phoneVerified}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSendOtp}
              disabled={isLoading || sendingOtp || phoneVerified || phoneNumber.length < 10}
              className="h-10"
            >
              {sendingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Code'}
            </Button>
          </div>
        </div>

        {!phoneVerified && phoneNumber.length >= 10 && (
          <div>
            <Label>Verification Code</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={phoneOtp}
                onChange={(e) => setPhoneOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                maxLength={6}
                disabled={isLoading || verifyingOtp}
                className="h-10"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleVerifyOtp}
                disabled={isLoading || verifyingOtp || phoneOtp.length !== 6}
                className="h-10"
              >
                {verifyingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
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
  );

  // Terms checkbox (shared)
  const renderTermsCheckbox = () => (
    <div className="border-t border-border pt-4">
      <div className="flex items-start gap-3">
        <Checkbox
          checked={termsAccepted}
          onCheckedChange={(checked) => setTermsAccepted(checked === true)}
          className="mt-0.5"
          disabled={isLoading}
        />
        <span className="text-sm text-muted-foreground">
          I agree to the{' '}
          <a href="/terms" target="_blank" className="text-primary underline">Terms of Service</a>
          {' '}and the <strong>binding arbitration clause</strong>.
        </span>
      </div>
    </div>
  );

  // Password fields (shared)
  const renderPasswordFields = () => (
    <>
      <div className="space-y-2">
        <Label>Password</Label>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Min 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            className="h-12 pr-10"
            minLength={8}
            maxLength={100}
            disabled={isLoading}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
      </div>
      <div className="space-y-2">
        <Label>Confirm Password</Label>
        <div className="relative">
          <Input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            className="h-12 pr-10"
            disabled={isLoading}
          />
          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {confirmPassword && password !== confirmPassword && (
          <p className="text-xs text-destructive">Passwords do not match</p>
        )}
      </div>
    </>
  );

  // ===================== SIGN IN VIEW =====================
  if (viewMode === 'signin') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="mb-10">
            <NativeAppLogo size="md" />
          </div>

          <div className="w-full max-w-sm">
            <Button type="button" variant="outline" className="w-full h-12 text-base gap-3" onClick={handleGoogleSignIn} disabled={isGoogleLoading}>
              {isGoogleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Sign in with Google
            </Button>

            <div className="relative my-6">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground uppercase">or</span>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" autoCapitalize="none" className="h-12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" className="h-12 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button type="button" onClick={() => { resetSignupFields(); setViewMode('role-select'); }} className="text-primary text-sm font-medium">
                Don't have an account? Create one
              </button>
            </div>

            <button type="button" onClick={() => toast.info('Please use the website to reset your password')} className="mt-4 w-full text-center text-muted-foreground text-sm">
              Forgot password?
            </button>
          </div>
        </div>

        <div className="p-6 text-center">
          <p className="text-xs text-muted-foreground">By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    );
  }

  // ===================== ROLE SELECTION VIEW =====================
  if (viewMode === 'role-select') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center z-10">
          <button onClick={() => setViewMode('signin')} className="p-2 -ml-2 text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="flex-1 text-center text-sm font-medium text-foreground pr-9">Create Account</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="mb-6">
            <NativeAppLogo size="md" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">How will you use CollabHunts?</h1>
          <p className="text-muted-foreground text-center mb-8 max-w-xs">Choose your role to get started</p>

          <div className="w-full max-w-sm space-y-4">
            <Card className="cursor-pointer border-2 hover:border-primary transition-colors" onClick={() => { resetSignupFields(); setViewMode('creator-signup'); }}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mic2 className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Join as Creator</p>
                  <p className="text-sm text-muted-foreground">Get discovered by brands</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer border-2 hover:border-primary transition-colors" onClick={() => { resetSignupFields(); setViewMode('brand-signup'); }}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="w-12 h-12 rounded-xl bg-accent/50 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-6 w-6 text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Join as Brand / Venue</p>
                  <p className="text-sm text-muted-foreground">Find and book creators</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <button type="button" onClick={() => setViewMode('signin')} className="text-primary text-sm font-medium">
              Already have an account? Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===================== BRAND SIGNUP VIEW =====================
  if (viewMode === 'brand-signup') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center z-10">
          <button onClick={() => setViewMode('role-select')} className="p-2 -ml-2 text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="flex-1 text-center text-sm font-medium text-foreground pr-9">Register Your Brand</span>
        </div>

        <div ref={brandScrollRef} className="flex-1 overflow-y-auto p-6">
          <div className="max-w-sm mx-auto">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-foreground">Quick Signup</h1>
              <p className="text-muted-foreground text-sm mt-1">Just the basics — you'll complete your brand profile after</p>
            </div>

            {/* Google Sign-Up */}
            <Button type="button" variant="outline" className="w-full h-12 text-base gap-3 mb-4" onClick={handleGoogleSignIn} disabled={isGoogleLoading}>
              {isGoogleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Sign up with Google
            </Button>

            <div className="relative my-4">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground uppercase">or</span>
            </div>

            <form onSubmit={handleBrandSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" className="h-12" maxLength={50} required disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" className="h-12" maxLength={50} required disabled={isLoading} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-12" maxLength={255} required disabled={isLoading} />
              </div>

              {renderPasswordFields()}
              {renderPhoneVerification()}
              {renderTermsCheckbox()}

              <Button type="submit" className="w-full h-12 text-base" disabled={isLoading || (requirePhone && !phoneVerified) || !termsAccepted}>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{' '}
                <button type="button" onClick={() => setViewMode('signin')} className="text-primary hover:underline">Sign In</button>
              </p>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ===================== CREATOR SIGNUP VIEW =====================
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center z-10">
        <button onClick={() => setViewMode('role-select')} className="p-2 -ml-2 text-muted-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="flex-1 text-center text-sm font-medium text-foreground pr-9">Join as Creator</span>
      </div>

      <div ref={creatorScrollRef} className="flex-1 overflow-y-auto p-6">
        <div className="max-w-sm mx-auto">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-foreground">Create Your Account</h1>
            <p className="text-muted-foreground text-sm mt-1">Get started — you'll set up your profile next</p>
          </div>

          {/* Google Sign-Up */}
          <Button type="button" variant="outline" className="w-full h-12 text-base gap-3 mb-4" onClick={handleGoogleSignIn} disabled={isGoogleLoading}>
            {isGoogleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Sign up with Google
          </Button>

          <div className="relative my-4">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground uppercase">or</span>
          </div>

          <form onSubmit={handleCreatorSignup} className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" className="h-12" maxLength={100} required disabled={isLoading} />
              <p className="text-xs text-muted-foreground">Min 5 characters</p>
            </div>

            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-12" maxLength={255} required disabled={isLoading} />
            </div>

            {renderPasswordFields()}
            {renderPhoneVerification()}
            {renderTermsCheckbox()}

            <Button type="submit" className="w-full h-12 text-base" disabled={isLoading || (requirePhone && !phoneVerified) || !termsAccepted}>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <button type="button" onClick={() => setViewMode('signin')} className="text-primary hover:underline">Sign In</button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default NativeLogin;
