import { useState, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { safeNativeAsync } from '@/lib/supabase-native';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Camera, Plus, Trash2, User as UserIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
  'Instagram',
  'TikTok',
  'YouTube',
  'Twitter/X',
  'Facebook',
  'Snapchat',
  'LinkedIn',
  'Twitch',
];

const SERVICE_TYPES = [
  'Instagram Post',
  'Instagram Story',
  'Instagram Reel',
  'TikTok Video',
  'YouTube Video',
  'YouTube Short',
  'Twitter/X Post',
  'Brand Ambassador',
  'Product Review',
  'Shoutout',
  'Custom Content',
];

export function NativeCreatorOnboarding({ user, onComplete }: NativeCreatorOnboardingProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 1: Basic Info
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Step 2: Social Accounts
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([
    { platform: '', username: '', followerCount: '' }
  ]);

  // Step 3: Services
  const [services, setServices] = useState<Service[]>([
    { serviceType: '', price: '', deliveryDays: '7' }
  ]);

  // Step 4: Terms
  const [termsAccepted, setTermsAccepted] = useState(false);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addSocialAccount = () => {
    setSocialAccounts([...socialAccounts, { platform: '', username: '', followerCount: '' }]);
  };

  const removeSocialAccount = (index: number) => {
    if (socialAccounts.length > 1) {
      setSocialAccounts(socialAccounts.filter((_, i) => i !== index));
    }
  };

  const updateSocialAccount = (index: number, field: keyof SocialAccount, value: string) => {
    const updated = [...socialAccounts];
    updated[index][field] = value;
    setSocialAccounts(updated);
  };

  const addService = () => {
    setServices([...services, { serviceType: '', price: '', deliveryDays: '7' }]);
  };

  const removeService = (index: number) => {
    if (services.length > 1) {
      setServices(services.filter((_, i) => i !== index));
    }
  };

  const updateService = (index: number, field: keyof Service, value: string) => {
    const updated = [...services];
    updated[index][field] = value;
    setServices(updated);
  };

  const validateStep1 = () => {
    if (!displayName.trim()) {
      toast.error('Please enter your display name');
      return false;
    }
    if (bio.length < 50) {
      toast.error('Bio must be at least 50 characters');
      return false;
    }
    if (!profileImage) {
      toast.error('Please add a profile photo');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const validAccounts = socialAccounts.filter(
      a => a.platform && a.username && a.followerCount
    );
    if (validAccounts.length === 0) {
      toast.error('Please add at least one social account');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    const validServices = services.filter(
      s => s.serviceType && s.price && parseInt(s.price) > 0
    );
    if (validServices.length === 0) {
      toast.error('Please add at least one service with pricing');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!termsAccepted) {
      toast.error('Please accept the terms to continue');
      return;
    }

    setIsLoading(true);

    const result = await safeNativeAsync(
      async () => {
        // 1. Upload profile image
        let profileImageUrl = null;
        if (profileImage) {
          const fileExt = profileImage.name.split('.').pop();
          const fileName = `${user.id}/profile.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('creator-images')
            .upload(fileName, profileImage, { upsert: true });

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from('creator-images')
            .getPublicUrl(fileName);
          
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
            status: 'pending',
            terms_accepted_at: new Date().toISOString(),
            terms_version: '1.0',
          })
          .select()
          .single();

        if (profileError) throw profileError;

        // 3. Add social accounts
        const validSocialAccounts = socialAccounts.filter(
          a => a.platform && a.username && a.followerCount
        );

        if (validSocialAccounts.length > 0) {
          const { error: socialError } = await supabase
            .from('creator_social_accounts')
            .insert(
              validSocialAccounts.map(a => ({
                creator_profile_id: profile.id,
                platform: a.platform,
                username: a.username,
                follower_count: parseInt(a.followerCount.replace(/,/g, '')) || 0,
              }))
            );

          if (socialError) throw socialError;
        }

        // 4. Add services
        const validServices = services.filter(
          s => s.serviceType && s.price && parseInt(s.price) > 0
        );

        if (validServices.length > 0) {
          const { error: servicesError } = await supabase
            .from('creator_services')
            .insert(
              validServices.map(s => ({
                creator_profile_id: profile.id,
                service_type: s.serviceType,
                price_cents: parseInt(s.price) * 100,
                delivery_days: parseInt(s.deliveryDays) || 7,
                is_active: true,
              }))
            );

          if (servicesError) throw servicesError;
        }

        return true;
      },
      false,
      15000 // 15 second timeout for full signup
    );

    setIsLoading(false);

    if (result) {
      toast.success('Profile created successfully!');
      onComplete();
    } else {
      toast.error('Failed to create profile. Please try again.');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

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
        <div className="w-9" /> {/* Spacer for centering */}
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-3">
        <Progress value={progress} className="h-2" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-bold text-foreground">Let's set up your profile</h1>
              <p className="text-muted-foreground mt-1">Tell brands who you are</p>
            </div>

            {/* Profile Photo */}
            <div className="flex flex-col items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="relative w-28 h-28 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-border"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-muted-foreground">
                    <Camera className="h-8 w-8" />
                    <span className="text-xs mt-1">Add photo</span>
                  </div>
                )}
              </button>
              <p className="text-xs text-muted-foreground mt-2">Tap to add profile photo</p>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name *</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your creator name"
                className="h-12 text-base"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio * (min 50 characters)</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell brands about yourself, your content style, and what makes you unique..."
                className="min-h-[120px] text-base"
              />
              <p className="text-xs text-muted-foreground text-right">
                {bio.length}/50 characters
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
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
                    <button
                      onClick={() => removeSocialAccount(index)}
                      className="text-destructive p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <Select
                  value={account.platform}
                  onValueChange={(value) => updateSocialAccount(index, 'platform', value)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  value={account.username}
                  onChange={(e) => updateSocialAccount(index, 'username', e.target.value)}
                  placeholder="@username"
                  className="h-12"
                />

                <Input
                  value={account.followerCount}
                  onChange={(e) => updateSocialAccount(index, 'followerCount', e.target.value)}
                  placeholder="Follower count (e.g., 10000)"
                  type="number"
                  className="h-12"
                />
              </div>
            ))}

            <Button
              variant="outline"
              onClick={addSocialAccount}
              className="w-full h-12"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Account
            </Button>
          </div>
        )}

        {step === 3 && (
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
                    <button
                      onClick={() => removeService(index)}
                      className="text-destructive p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <Select
                  value={service.serviceType}
                  onValueChange={(value) => updateService(index, 'serviceType', value)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      value={service.price}
                      onChange={(e) => updateService(index, 'price', e.target.value)}
                      placeholder="Price ($)"
                      type="number"
                      className="h-12"
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      value={service.deliveryDays}
                      onChange={(e) => updateService(index, 'deliveryDays', e.target.value)}
                      placeholder="Days"
                      type="number"
                      className="h-12"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Price in USD, delivery in days</p>
              </div>
            ))}

            <Button
              variant="outline"
              onClick={addService}
              className="w-full h-12"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Service
            </Button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-bold text-foreground">Almost done!</h1>
              <p className="text-muted-foreground mt-1">Review and accept our terms</p>
            </div>

            {/* Summary */}
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {imagePreview ? (
                    <img src={imagePreview} alt="" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{displayName}</p>
                    <p className="text-sm text-muted-foreground">
                      {socialAccounts.filter(a => a.platform).length} social accounts
                    </p>
                  </div>
                </div>
              </div>

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

            {/* Terms */}
            <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                I agree to the Terms of Service and Privacy Policy. I understand my profile will be reviewed before going live.
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border safe-area-bottom">
        {step < 4 ? (
          <Button onClick={handleNext} className="w-full h-12 text-base">
            Continue
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!termsAccepted || isLoading}
            className="w-full h-12 text-base"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Profile...
              </>
            ) : (
              'Create My Profile'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

export default NativeCreatorOnboarding;
