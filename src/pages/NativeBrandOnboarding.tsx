import { useState, useRef } from 'react';
import { useKeyboardScrollIntoView } from '@/hooks/useKeyboardScrollIntoView';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { safeNativeAsync } from '@/lib/supabase-native';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CountrySelect from '@/components/CountrySelect';
import ProfileAvatar from '@/components/ProfileAvatar';
import { ArrowLeft, Camera, Facebook, Instagram, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface NativeBrandOnboardingProps {
  user: User | null;
  onComplete: () => void;
}

const INDUSTRIES = [
  "Fashion & Apparel", "Beauty & Cosmetics", "Technology", "Food & Beverage",
  "Travel & Hospitality", "Health & Wellness", "Entertainment", "Sports & Fitness",
  "Home & Garden", "Automotive", "Finance", "Education", "Other"
];

const COMPANY_SIZES = [
  "1-10 employees", "11-50 employees", "51-200 employees",
  "201-500 employees", "501-1000 employees", "1000+ employees"
];

export function NativeBrandOnboarding({ user, onComplete }: NativeBrandOnboardingProps) {
  // If user exists, skip step 1 (account creation) AND merge location into company details
  const isExistingUser = !!user;
  const totalSteps = isExistingUser ? 2 : 3;
  const stepOffset = isExistingUser ? 1 : 0;

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  // Scroll focused fields into view above keyboard on native
  const scrollContainerRef = useKeyboardScrollIntoView<HTMLDivElement>();

  // Step 1 (new users only): Account Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Step 2: Company Basics
  const [companyName, setCompanyName] = useState('');
  const [contactPosition, setContactPosition] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');

  // Step 3: Location
  const [locationCountry, setLocationCountry] = useState('LB');
  const [venueAddress, setVenueAddress] = useState('');

  // Step 4: Logo & Social
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');

  // Track the authenticated user for new signups
  const [createdUserId, setCreatedUserId] = useState<string | null>(user?.id ?? null);

  const progress = (step / totalSteps) * 100;

  // Map logical step to actual step (accounting for skipped step 1)
  const getActualStep = () => {
    if (isExistingUser) return step + 1; // skip account step, company+location merged = step 2
    return step;
  };
  const actualStep = getActualStep();

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Logo must be less than 5MB');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const validateAccountStep = () => {
    if (!firstName.trim() || firstName.trim().length < 2) {
      toast.error('First name must be at least 2 characters');
      return false;
    }
    if (!lastName.trim() || lastName.trim().length < 2) {
      toast.error('Last name must be at least 2 characters');
      return false;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email');
      return false;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return false;
    }
    if (!termsAccepted) {
      toast.error('Please accept the Terms of Service');
      return false;
    }
    return true;
  };

  const validateCompanyStep = () => {
    if (!companyName.trim()) {
      toast.error('Please enter your company name');
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    // Account step (new users only)
    if (actualStep === 1 && !isExistingUser) {
      if (!validateAccountStep()) return;

      setIsLoading(true);
      const result = await safeNativeAsync(async () => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: `${firstName} ${lastName}`, user_type: 'brand' },
          },
        });
        if (error) throw error;
        if (!data.user) throw new Error('Failed to create account');
        return data.user.id;
      }, null, 10000);

      setIsLoading(false);

      if (!result) {
        toast.error('Failed to create account. Please try again.');
        return;
      }
      setCreatedUserId(result);
      setStep(step + 1);
      return;
    }

    // Company basics step
    if (actualStep === 2) {
      if (!validateCompanyStep()) return;
    }

    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSubmit = async () => {
    const userId = createdUserId;
    if (!userId) {
      toast.error('No user session. Please try again.');
      return;
    }

    if (!companyName.trim()) {
      toast.error('Company name is required');
      return;
    }

    setIsLoading(true);

    const result = await safeNativeAsync(async () => {
      // Check if brand profile already exists
      const { data: existing } = await supabase
        .from('brand_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      // Upload logo if provided
      let logoUrl: string | null = null;
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const filePath = `${userId}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('brand-logos')
          .upload(filePath, logoFile);
        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('brand-logos')
            .getPublicUrl(filePath);
          logoUrl = publicUrlData.publicUrl;
        }
      }

      const profileData: Record<string, any> = {
        company_name: companyName.trim(),
        contact_position: contactPosition || null,
        industry: industry || null,
        company_size: companySize || null,
        location_country: locationCountry || null,
        venue_address: venueAddress || null,
        facebook_url: facebookUrl || null,
        instagram_url: instagramUrl || null,
        tiktok_url: tiktokUrl || null,
        registration_completed: true,
      };

      if (logoUrl) profileData.logo_url = logoUrl;

      if (existing) {
        // Update existing profile
        const { error } = await supabase
          .from('brand_profiles')
          .update(profileData)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await supabase
          .from('brand_profiles')
          .insert({
            user_id: userId,
            first_name: firstName || user?.user_metadata?.full_name?.split(' ')[0] || null,
            last_name: lastName || user?.user_metadata?.full_name?.split(' ').slice(1).join(' ') || null,
            terms_accepted_at: new Date().toISOString(),
            terms_version: '1.0',
            ...profileData,
          });
        if (error) {
          if (error.code === '23505') return true; // Already exists
          throw error;
        }
      }

      // Track affiliate referral
      const referralCode = localStorage.getItem('affiliate_referral_code');
      if (referralCode) {
        try {
          const { data: affiliateId } = await supabase.rpc('get_affiliate_by_code', { _code: referralCode });
          if (affiliateId) {
            await supabase.from('referrals').insert({
              affiliate_id: affiliateId,
              referred_user_id: userId,
              referred_user_type: 'brand',
              referral_code_used: referralCode,
            });
          }
          localStorage.removeItem('affiliate_referral_code');
        } catch (e) {
          console.error('Referral tracking error:', e);
        }
      }

      return true;
    }, false, 15000);

    setIsLoading(false);

    if (result) {
      toast.success('Brand profile created!', { duration: 3000 });
      onComplete();
    } else {
      toast.error('Failed to create profile. Please try again.');
    }
  };

  const isLastStep = step === totalSteps;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center justify-between z-10">
        <button
          onClick={step > 1 ? handleBack : handleSignOut}
          className="p-2 -ml-2 text-muted-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-sm text-muted-foreground">Step {step} of {totalSteps}</span>
        <div className="w-9" />
      </div>

      {/* Progress */}
      <div className="px-4 py-3">
        <Progress value={progress} className="h-2" />
      </div>

      {/* Content */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 pb-24">
        {/* Step 1: Account Info (new users only) */}
        {actualStep === 1 && !isExistingUser && (
          <div className="space-y-5">
            <div>
              <h1 className="text-xl font-bold text-foreground">Create your account</h1>
              <p className="text-muted-foreground mt-1">Let's get you started</p>
            </div>

            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="h-12 text-base"
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name *</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="h-12 text-base"
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-12 text-base"
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <Label>Password *</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="h-12 text-base"
                minLength={8}
                maxLength={100}
              />
            </div>

            <div className="flex items-start gap-3 pt-2">
              <Checkbox
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                className="mt-0.5"
              />
              <span className="text-sm text-muted-foreground">
                I agree to the{' '}
                <a href="/terms" target="_blank" className="text-primary underline">Terms of Service</a>
                {' '}and the <strong>binding arbitration clause</strong>.
              </span>
            </div>
          </div>
        )}

        {/* Step 2: Company Basics + Location (merged) */}
        {actualStep === 2 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-xl font-bold text-foreground">Company details</h1>
              <p className="text-muted-foreground mt-1">Tell us about your business</p>
            </div>

            <div className="space-y-2">
              <Label>Brand / Business Name *</Label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., The Coffee House"
                className="h-12 text-base"
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label>Your Position / Title</Label>
              <Input
                value={contactPosition}
                onChange={(e) => setContactPosition(e.target.value)}
                placeholder="e.g., Marketing Manager"
                className="h-12 text-base"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Company Size</Label>
              <Select value={companySize} onValueChange={setCompanySize}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_SIZES.map((size) => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location fields merged in */}
            <div className="space-y-2 pt-2 border-t border-border">
              <Label>Country</Label>
              <CountrySelect
                value={locationCountry}
                onChange={setLocationCountry}
                placeholder="Select your country"
              />
            </div>
            <div className="space-y-2">
              <Label>Business Address <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                placeholder="e.g., Hamra Street, Beirut"
                className="h-12 text-base"
                maxLength={300}
              />
            </div>
          </div>
        )}

        {/* Step 3 (new users) / Step 3 (existing users actualStep 3): Logo & Social Media */}
        {actualStep === 3 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-xl font-bold text-foreground">Logo & Social Media</h1>
              <p className="text-muted-foreground mt-1">Build your brand identity</p>
            </div>

            {/* Logo Upload */}
            <div className="flex flex-col items-center">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoSelect}
                className="hidden"
              />
              <button
                onClick={() => logoInputRef.current?.click()}
                className="relative group"
              >
                <ProfileAvatar
                  src={logoPreview}
                  fallbackName={companyName || 'B'}
                  className="h-24 w-24"
                />
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-active:opacity-100 transition-opacity">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </button>
              <p className="text-xs text-muted-foreground mt-2">Tap to upload logo (max 5MB)</p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Facebook className="h-4 w-4 text-[#1877F2]" /> Facebook
              </Label>
              <Input
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="https://facebook.com/yourbrand"
                className="h-12 text-base"
                maxLength={300}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Instagram className="h-4 w-4 text-[#E4405F]" /> Instagram
              </Label>
              <Input
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/yourbrand"
                className="h-12 text-base"
                maxLength={300}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.61a8.21 8.21 0 0 0 4.76 1.52v-3.44h-1z"/></svg>
                TikTok
              </Label>
              <Input
                value={tiktokUrl}
                onChange={(e) => setTiktokUrl(e.target.value)}
                placeholder="https://tiktok.com/@yourbrand"
                className="h-12 text-base"
                maxLength={300}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom action */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 safe-area-bottom">
        <Button
          className="w-full h-12 text-base"
          onClick={isLastStep ? handleSubmit : handleNext}
          disabled={isLoading}
        >
          {isLoading ? (
            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Please wait...</>
          ) : isLastStep ? (
            'Complete Registration'
          ) : (
            'Next'
          )}
        </Button>
      </div>
    </div>
  );
}

export default NativeBrandOnboarding;
