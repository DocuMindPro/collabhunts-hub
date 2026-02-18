import { useState, useRef, useCallback } from 'react';
import { useKeyboardScrollIntoView } from '@/hooks/useKeyboardScrollIntoView';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Camera, Plus, Trash2, User as UserIcon, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useTapTrigger } from '@/components/NativeDebugConsole';

interface NativeCreatorOnboardingProps {
  user: User;
  onComplete: () => void;
}

interface SocialAccount {
  platform: string;
  username: string;
  followerCount: string;
}

interface Service {
  serviceType: string;
  price: string;
  deliveryDays: string;
}

const PLATFORMS = [
  'Instagram', 'TikTok', 'YouTube', 'Twitter/X',
  'Facebook', 'Snapchat', 'LinkedIn', 'Twitch',
];

const SERVICE_TYPES = [
  'Instagram Post', 'Instagram Reel', 'Instagram Story Mention',
  'TikTok Video', 'YouTube Integration', 'YouTube Short',
  'Facebook Post', 'Live Stream', 'Twitter/X Post',
  'LinkedIn Post', 'Podcast Mention', 'Custom Package',
];

// Content categories for creator matching with brand opportunities
const CONTENT_CATEGORIES = [
  { id: 'Fashion', emoji: '👗', label: 'Fashion' },
  { id: 'Beauty', emoji: '💄', label: 'Beauty' },
  { id: 'Lifestyle', emoji: '✨', label: 'Lifestyle' },
  { id: 'Food & Beverage', emoji: '🍔', label: 'Food & Beverage' },
  { id: 'Technology', emoji: '💻', label: 'Technology' },
  { id: 'Travel', emoji: '✈️', label: 'Travel' },
  { id: 'Fitness', emoji: '💪', label: 'Fitness' },
  { id: 'Health & Wellness', emoji: '🌿', label: 'Health & Wellness' },
  { id: 'Gaming', emoji: '🎮', label: 'Gaming' },
  { id: 'Music', emoji: '🎵', label: 'Music' },
  { id: 'Entertainment', emoji: '🎬', label: 'Entertainment' },
  { id: 'Sports', emoji: '⚽', label: 'Sports' },
  { id: 'Education', emoji: '📚', label: 'Education' },
  { id: 'Finance', emoji: '💰', label: 'Finance' },
  { id: 'Automotive', emoji: '🚗', label: 'Automotive' },
  { id: 'Home & Garden', emoji: '🏡', label: 'Home & Garden' },
  { id: 'Pets', emoji: '🐾', label: 'Pets' },
  { id: 'Art & Design', emoji: '🎨', label: 'Art & Design' },
  { id: 'Comedy', emoji: '😂', label: 'Comedy' },
  { id: 'Business', emoji: '💼', label: 'Business' },
];

// Steps:
// 1 → Basic Info (name, bio, photo)
// 2 → Categories (NEW)
// 3 → Social Accounts
// 4 → TikTok Live (conditional, if TikTok added)
// 4/5 → Services
// 5/6 → Terms

export function NativeCreatorOnboarding({ user, onComplete }: NativeCreatorOnboardingProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useKeyboardScrollIntoView<HTMLDivElement>();

  // Debug console tap trigger
  const openDebugConsole = useCallback(() => {
    if (window.NATIVE_DEBUG_OPEN) window.NATIVE_DEBUG_OPEN();
  }, []);
  const handleDebugTap = useTapTrigger(openDebugConsole);

  // Step 1: Basic Info
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Step 2: Categories (NEW)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Step 3: Social Accounts
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([
    { platform: '', username: '', followerCount: '' }
  ]);

  // Step 4: TikTok Live (conditional)
  const [goesLiveTiktok, setGoesLiveTiktok] = useState<boolean | null>(null);
  const [tiktokMonthlyRevenue, setTiktokMonthlyRevenue] = useState('');
  const [tiktokLiveInterest, setTiktokLiveInterest] = useState('');

  // Step 4/5: Services
  const [services, setServices] = useState<Service[]>([
    { serviceType: '', price: '', deliveryDays: '7' }
  ]);

  // Final step: Terms
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Step accounting:
  // Steps 1-2 are always present (basic + categories)
  // Step 3 is social accounts
  // Step 4 is TikTok Live (only if TikTok added) → shifts services/terms
  // Steps 4/5 = services, 5/6 = terms
  const hasTiktokAccount = socialAccounts.some(a => a.platform === 'TikTok');
  const FIXED_STEPS_BEFORE_TIKTOK = 3; // basic, categories, social
  const totalSteps = FIXED_STEPS_BEFORE_TIKTOK + (hasTiktokAccount ? 1 : 0) + 2; // + services + terms

  // Map internal step to logical step label (skipping TikTok slot when no TikTok)
  // Internal steps: 1=basic, 2=categories, 3=social, 4=tiktok(opt), 4/5=services, 5/6=terms
  const getEffectiveStep = () => {
    if (!hasTiktokAccount && step >= 4) return step + 1; // skip TikTok slot
    return step;
  };
  const effectiveStep = getEffectiveStep();
  const progress = (step / totalSteps) * 100;

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { toast.error('Image must be less than 5MB'); return; }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addSocialAccount = () => setSocialAccounts([...socialAccounts, { platform: '', username: '', followerCount: '' }]);
  const removeSocialAccount = (index: number) => {
    if (socialAccounts.length > 1) setSocialAccounts(socialAccounts.filter((_, i) => i !== index));
  };
  const updateSocialAccount = (index: number, field: keyof SocialAccount, value: string) => {
    const updated = [...socialAccounts]; updated[index][field] = value; setSocialAccounts(updated);
  };

  const addService = () => setServices([...services, { serviceType: '', price: '', deliveryDays: '7' }]);
  const removeService = (index: number) => {
    if (services.length > 1) setServices(services.filter((_, i) => i !== index));
  };
  const updateService = (index: number, field: keyof Service, value: string) => {
    const updated = [...services]; updated[index][field] = value; setServices(updated);
  };

  // ── Validators ──────────────────────────────────────────────────────────────

  const validateStep1 = () => {
    if (!displayName.trim()) { toast.error('Please enter your display name'); return false; }
    if (bio.length < 20) { toast.error('Bio must be at least 20 characters'); return false; }
    return true;
  };

  const validateStep2 = () => {
    if (selectedCategories.length === 0) {
      toast.error('Please select at least one content category');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    const validAccounts = socialAccounts.filter(a => a.platform && a.username && a.followerCount);
    if (validAccounts.length === 0) { toast.error('Please add at least one social account'); return false; }
    const MAX = 10_000_000_000;
    for (const a of validAccounts) {
      if ((parseInt(a.followerCount.replace(/,/g, '')) || 0) > MAX) {
        toast.error(`Follower count for ${a.platform} seems too high.`); return false;
      }
    }
    return true;
  };

  const validateTikTokStep = () => {
    if (goesLiveTiktok === null) { toast.error('Please answer if you go live on TikTok'); return false; }
    if (goesLiveTiktok && !tiktokMonthlyRevenue) { toast.error('Please select your monthly revenue range'); return false; }
    if (!goesLiveTiktok && !tiktokLiveInterest) { toast.error('Please let us know your interest level'); return false; }
    return true;
  };

  const validateServices = () => {
    const valid = services.filter(s => s.serviceType && s.price && parseInt(s.price) > 0);
    if (valid.length === 0) { toast.error('Please add at least one service with pricing'); return false; }
    return true;
  };

  // ── Navigation ───────────────────────────────────────────────────────────────

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    if (hasTiktokAccount && step === 4 && !validateTikTokStep()) return;
    // Services validation: step 4 (no TikTok) or step 5 (with TikTok)
    const servicesStep = hasTiktokAccount ? 5 : 4;
    if (step === servicesStep && !validateServices()) return;
    setStep(step + 1);
  };

  const handleBack = () => { if (step > 1) setStep(step - 1); };

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!termsAccepted) { toast.error('Please accept the terms to continue'); return; }
    setIsLoading(true);

    // ── Session validation before any DB/storage operations ──────────────────
    // This prevents RLS failures caused by auth.uid() being null during the
    // post-signup race condition (email confirmation or JWT propagation delay).
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.warn('NativeCreatorOnboarding: No session, attempting refresh...');
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError || !refreshData.session) {
          toast.error('Session expired. Please sign in again.');
          setIsLoading(false);
          return;
        }
        console.log('NativeCreatorOnboarding: Session refreshed successfully');
      }
    } catch (sessionErr) {
      console.error('NativeCreatorOnboarding: Session check failed', sessionErr);
    }

    // ── Profile creation ──────────────────────────────────────────────────────
    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('creator_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existingProfile) {
        // 1. Upload profile image
        let profileImageUrl: string | null = null;
        if (profileImage) {
          const fileExt = profileImage.name.split('.').pop();
          const fileName = `${user.id}/profile.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('profile-images')
            .upload(fileName, profileImage, { upsert: true });
          if (uploadError) {
            console.error('NativeCreatorOnboarding: Image upload error', uploadError);
            throw new Error(`Image upload failed: ${uploadError.message} [${uploadError.name}]`);
          }
          const { data: urlData } = supabase.storage.from('profile-images').getPublicUrl(fileName);
          profileImageUrl = urlData.publicUrl;
        }

        // 2. Create creator profile
        const { data: profile, error: profileError } = await supabase
          .from('creator_profiles')
          .insert({
            user_id: user.id,
            display_name: displayName.trim(),
            bio: bio.trim(),
            profile_image_url: profileImageUrl,
            categories: selectedCategories.length > 0 ? selectedCategories : null,
            status: 'pending',
            terms_accepted_at: new Date().toISOString(),
            terms_version: '1.0',
          })
          .select()
          .single();

        if (profileError) {
          if (profileError.code !== '23505') {
            console.error('NativeCreatorOnboarding: Profile insert error', profileError);
            throw new Error(`Profile insert failed: ${profileError.message} [code: ${profileError.code}]`);
          }
          // 23505 = duplicate key, profile already exists — treat as success
        } else {
          // 3. Social accounts + services
          const validSocial = socialAccounts.filter(a => a.platform && a.username && a.followerCount);
          if (validSocial.length > 0) {
            const { error: socialError } = await supabase.from('creator_social_accounts').insert(
              validSocial.map(a => ({
                creator_profile_id: profile.id,
                platform: a.platform,
                username: a.username,
                follower_count: parseInt(a.followerCount.replace(/,/g, '')) || 0,
              }))
            );
            if (socialError) {
              await supabase.from('creator_profiles').delete().eq('id', profile.id);
              throw new Error(`Social accounts failed: ${socialError.message}`);
            }
          }

          const validServices = services.filter(s => s.serviceType && s.price && parseInt(s.price) > 0);
          if (validServices.length > 0) {
            const { error: servicesError } = await supabase.from('creator_services').insert(
              validServices.map(s => ({
                creator_profile_id: profile.id,
                service_type: s.serviceType,
                price_cents: parseInt(s.price) * 100,
                delivery_days: parseInt(s.deliveryDays) || 7,
                is_active: true,
              }))
            );
            if (servicesError) {
              await supabase.from('creator_profiles').delete().eq('id', profile.id);
              throw new Error(`Services failed: ${servicesError.message}`);
            }
          }
        }
      }

      // TikTok Live insights (non-blocking)
      if (hasTiktokAccount && goesLiveTiktok !== null) {
        try {
          const { data: cp } = await supabase
            .from('creator_profiles').select('id').eq('user_id', user.id).single();
          if (cp) {
            await supabase.from('creator_tiktok_live_insights').insert({
              creator_profile_id: cp.id,
              goes_live: goesLiveTiktok,
              monthly_revenue_range: goesLiveTiktok ? tiktokMonthlyRevenue : null,
              interest_in_going_live: !goesLiveTiktok ? tiktokLiveInterest : null,
            });
          }
        } catch (e) { console.error('TikTok insights error:', e); }
      }

      setIsLoading(false);
      toast.success('Profile created successfully!');
      onComplete();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('NativeCreatorOnboarding: handleSubmit error', message);
      setIsLoading(false);
      toast.error(`Profile creation failed: ${message} (tap logo 5x for details)`, { duration: 8000 });
    }
  };

  const handleSignOut = async () => { await supabase.auth.signOut(); };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center justify-between z-10">
        <button onClick={step > 1 ? handleBack : handleSignOut} className="p-2 -ml-2 text-muted-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        {/* Invisible 5-tap debug trigger on step counter */}
        <button
          onClick={handleDebugTap}
          className="text-sm text-muted-foreground px-2 py-1 select-none"
        >
          Step {step} of {totalSteps}
        </button>
        <div className="w-9" />
      </div>

      {/* Progress */}
      <div className="px-4 py-3">
        <Progress value={progress} className="h-2" />
      </div>

      {/* Scrollable Content */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 pb-24">

        {/* ── Step 1: Basic Info ─────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-bold text-foreground">Let's set up your profile</h1>
              <p className="text-muted-foreground mt-1">Tell brands who you are</p>
            </div>

            <div className="flex flex-col items-center">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              <button onClick={() => { try { fileInputRef.current?.click(); } catch (e) { console.error('File picker error:', e); toast.error('Could not open photo picker'); } }}
                className="relative w-28 h-28 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-border">
                {imagePreview
                  ? <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                  : <div className="flex flex-col items-center text-muted-foreground"><Camera className="h-8 w-8" /><span className="text-xs mt-1">Add photo</span></div>
                }
              </button>
              <p className="text-xs text-muted-foreground mt-2">Optional — you can add it later</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name *</Label>
              <Input id="displayName" value={displayName} onChange={e => setDisplayName(e.target.value)}
                placeholder="Your creator name" className="h-12 text-base" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio * (min 20 characters)</Label>
              <Textarea id="bio" value={bio} onChange={e => setBio(e.target.value)}
                placeholder="Tell brands about yourself, your content style, and what makes you unique..."
                className="min-h-[120px] text-base" />
              <p className={`text-xs text-right ${bio.length >= 20 ? 'text-green-600' : 'text-muted-foreground'}`}>
                {bio.length} characters {bio.length < 20 ? `(${20 - bio.length} more needed)` : '✓'}
              </p>
            </div>
          </div>
        )}

        {/* ── Step 2: Categories (NEW) ────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-bold text-foreground">What do you create?</h1>
              <p className="text-muted-foreground mt-1">
                Select your content categories — this helps brands find you for the right campaigns.
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              {selectedCategories.length === 0
                ? 'Select at least 1 category'
                : `${selectedCategories.length} selected`}
            </p>

            <div className="grid grid-cols-2 gap-3">
              {CONTENT_CATEGORIES.map(cat => {
                const isSelected = selectedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`relative flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all active:scale-95 ${
                      isSelected
                        ? 'border-primary bg-primary/8'
                        : 'border-border bg-muted/30'
                    }`}
                  >
                    <span className="text-2xl leading-none">{cat.emoji}</span>
                    <span className="text-sm font-medium text-foreground leading-tight">{cat.label}</span>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Step 3: Social Accounts ────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-bold text-foreground">Add your social accounts</h1>
              <p className="text-muted-foreground mt-1">Add at least one account with followers</p>
            </div>

            {socialAccounts.map((account, index) => (
              <div key={index} className="p-4 bg-muted/50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Account {index + 1}</span>
                  {socialAccounts.length > 1 && (
                    <button onClick={() => removeSocialAccount(index)} className="text-destructive p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Select value={account.platform} onValueChange={v => updateSocialAccount(index, 'platform', v)}>
                  <SelectTrigger className="h-12"><SelectValue placeholder="Select platform" /></SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input value={account.username} onChange={e => updateSocialAccount(index, 'username', e.target.value)}
                  placeholder="@username" className="h-12" />
                <Input value={account.followerCount} onChange={e => updateSocialAccount(index, 'followerCount', e.target.value)}
                  placeholder="Follower count (e.g., 10000)" type="number" className="h-12" />
              </div>
            ))}

            <Button variant="outline" onClick={addSocialAccount} className="w-full h-12">
              <Plus className="h-4 w-4 mr-2" />Add Another Account
            </Button>
          </div>
        )}

        {/* ── Step 4 (TikTok Live — only shown if TikTok added) ──────────── */}
        {effectiveStep === 4 && hasTiktokAccount && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-bold text-foreground">TikTok Live</h1>
              <p className="text-muted-foreground mt-1">Tell us about your TikTok Live activity</p>
            </div>

            <div className="space-y-3">
              <p className="font-medium text-foreground">Do you go live on TikTok?</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { setGoesLiveTiktok(true); setTiktokLiveInterest(''); }}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${goesLiveTiktok === true ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                  <p className="font-medium">Yes, I go live</p>
                  <p className="text-xs text-muted-foreground mt-1">I broadcast regularly</p>
                </button>
                <button onClick={() => { setGoesLiveTiktok(false); setTiktokMonthlyRevenue(''); }}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${goesLiveTiktok === false ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                  <p className="font-medium">No, I don't</p>
                  <p className="text-xs text-muted-foreground mt-1">Haven't gone live yet</p>
                </button>
              </div>
            </div>

            {goesLiveTiktok === true && (
              <div className="space-y-2">
                <p className="font-medium text-foreground">Average monthly revenue from TikTok Live?</p>
                <select value={tiktokMonthlyRevenue} onChange={e => setTiktokMonthlyRevenue(e.target.value)}
                  className="w-full h-12 px-3 rounded-md border border-input bg-background text-base">
                  <option value="">Select range</option>
                  <option value="under_100">Under $100</option>
                  <option value="100_500">$100 - $500</option>
                  <option value="500_1000">$500 - $1,000</option>
                  <option value="1000_5000">$1,000 - $5,000</option>
                  <option value="5000_plus">$5,000+</option>
                </select>
              </div>
            )}

            {goesLiveTiktok === false && (
              <div className="space-y-2">
                <p className="font-medium text-foreground">Interested in going live if it generates income?</p>
                <div className="space-y-2">
                  {[
                    { value: 'yes_definitely', label: "Yes, definitely!", desc: "I'd love to start" },
                    { value: 'maybe', label: "Maybe — I'd like to learn more", desc: "I'm curious" },
                    { value: 'not_now', label: "Not right now", desc: "Focused on other content" },
                  ].map(opt => (
                    <button key={opt.value} onClick={() => setTiktokLiveInterest(opt.value)}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${tiktokLiveInterest === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                      <p className="font-medium text-sm">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Services Step (effectiveStep 4 without TikTok, 5 with) ─────── */}
        {((hasTiktokAccount && effectiveStep === 5) || (!hasTiktokAccount && effectiveStep === 4)) && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-bold text-foreground">Set your services & pricing</h1>
              <p className="text-muted-foreground mt-1">Add at least one service you offer</p>
            </div>

            {services.map((service, index) => (
              <div key={index} className="p-4 bg-muted/50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Service {index + 1}</span>
                  {services.length > 1 && (
                    <button onClick={() => removeService(index)} className="text-destructive p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Select value={service.serviceType} onValueChange={v => updateService(index, 'serviceType', v)}>
                  <SelectTrigger className="h-12"><SelectValue placeholder="Select service type" /></SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input value={service.price} onChange={e => updateService(index, 'price', e.target.value)}
                      placeholder="Price ($)" type="number" className="h-12" />
                  </div>
                  <div className="w-24">
                    <Input value={service.deliveryDays} onChange={e => updateService(index, 'deliveryDays', e.target.value)}
                      placeholder="Days" type="number" className="h-12" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Price in USD, delivery in days</p>
              </div>
            ))}

            <Button variant="outline" onClick={addService} className="w-full h-12">
              <Plus className="h-4 w-4 mr-2" />Add Another Service
            </Button>
          </div>
        )}

        {/* ── Terms Step (last step) ─────────────────────────────────────── */}
        {step === totalSteps && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-bold text-foreground">Almost done!</h1>
              <p className="text-muted-foreground mt-1">Review and accept our terms</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {imagePreview
                    ? <img src={imagePreview} alt="" className="w-12 h-12 rounded-full object-cover" />
                    : <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center"><UserIcon className="h-6 w-6 text-muted-foreground" /></div>
                  }
                  <div>
                    <p className="font-medium">{displayName}</p>
                    <p className="text-sm text-muted-foreground">{socialAccounts.filter(a => a.platform).length} social account{socialAccounts.filter(a => a.platform).length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>

              {selectedCategories.length > 0 && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-medium mb-2">Content Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategories.map(cat => {
                      const found = CONTENT_CATEGORIES.find(c => c.id === cat);
                      return (
                        <span key={cat} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          {found?.emoji} {cat}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="font-medium mb-2">Your Services</p>
                {services.filter(s => s.serviceType).map((s, i) => (
                  <div key={i} className="flex justify-between text-sm py-1">
                    <span>{s.serviceType}</span>
                    <span className="text-primary font-medium">${s.price}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
              <Checkbox id="terms" checked={termsAccepted}
                onCheckedChange={checked => setTermsAccepted(checked as boolean)} className="mt-1" />
              <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                I agree to the Terms of Service and Privacy Policy. I understand my profile will be reviewed before going live.
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border safe-area-bottom">
        {step < totalSteps ? (
          <Button onClick={handleNext} className="w-full h-12 text-base">Continue</Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!termsAccepted || isLoading} className="w-full h-12 text-base">
            {isLoading
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating Profile...</>
              : 'Create My Profile'}
          </Button>
        )}
      </div>
    </div>
  );
}

export default NativeCreatorOnboarding;
