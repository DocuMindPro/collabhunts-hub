import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, Facebook, Instagram, Loader2 } from "lucide-react";
import ProfileAvatar from "@/components/ProfileAvatar";
import CountrySelect from "@/components/CountrySelect";
import OnboardingProgress from "@/components/brand-onboarding/OnboardingProgress";

const industries = [
  "Fashion & Apparel", "Beauty & Cosmetics", "Technology", "Food & Beverage",
  "Travel & Hospitality", "Health & Wellness", "Entertainment", "Sports & Fitness",
  "Home & Garden", "Automotive", "Finance", "Education", "Other"
];

const companySizes = [
  "1-10 employees", "11-50 employees", "51-200 employees",
  "201-500 employees", "501-1000 employees", "1000+ employees"
];

const BrandOnboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [brandProfileId, setBrandProfileId] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // Step 1: Company basics
  const [companyName, setCompanyName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [contactPosition, setContactPosition] = useState("");

  // Step 2: Location
  const [locationCountry, setLocationCountry] = useState("LB");
  const [venueAddress, setVenueAddress] = useState("");

  // Step 3: Logo & Social
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: brandProfile } = await supabase
        .from("brand_profiles")
        .select("id, registration_completed")
        .eq("user_id", user.id)
        .single();

      if (!brandProfile) {
        navigate("/brand-signup");
        return;
      }

      if (brandProfile.registration_completed) {
        navigate("/brand-dashboard");
        return;
      }

      setBrandProfileId(brandProfile.id);
      setChecking(false);
    };

    checkAuth();
  }, [navigate]);

  const handleSubmit = async () => {
    if (!brandProfileId) return;

    if (!companyName.trim()) {
      toast({ title: "Required", description: "Please enter your company name", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Upload logo if provided
      let logoUrl: string | null = null;
      if (logoFile) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const fileExt = logoFile.name.split('.').pop();
          const filePath = `${user.id}/${Date.now()}.${fileExt}`;
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
      }

      const updateData: Record<string, any> = {
        company_name: companyName,
        website_url: websiteUrl || null,
        industry: industry || null,
        company_size: companySize || null,
        contact_position: contactPosition || null,
        location_country: locationCountry || null,
        venue_address: venueAddress || null,
        facebook_url: facebookUrl || null,
        instagram_url: instagramUrl || null,
        tiktok_url: tiktokUrl || null,
        registration_completed: true,
      };

      if (logoUrl) {
        updateData.logo_url = logoUrl;
      }

      const { error } = await supabase
        .from("brand_profiles")
        .update(updateData)
        .eq("id", brandProfileId);

      if (error) throw error;

      toast({
        title: "Registration Complete!",
        description: "Your brand profile is set up. You now have full access to all features.",
      });

      navigate("/brand-dashboard");
    } catch (error: any) {
      console.error("Error completing registration:", error);
      toast({ title: "Error", description: error.message || "Failed to save. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-heading font-bold text-center mb-1">Complete Your Brand Profile</h2>
            <p className="text-sm text-muted-foreground text-center">Fill in your business details to unlock all features</p>
          </div>

          <div className="mb-6">
            <OnboardingProgress currentStep={step} totalSteps={totalSteps} />
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName">Brand / Business Name <span className="text-destructive">*</span></Label>
                <Input
                  id="companyName"
                  placeholder="e.g., The Coffee House"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  maxLength={200}
                />
              </div>
              <div>
                <Label htmlFor="contactPosition">Your Position / Title</Label>
                <Input
                  id="contactPosition"
                  placeholder="e.g., Marketing Manager"
                  value={contactPosition}
                  onChange={(e) => setContactPosition(e.target.value)}
                  maxLength={100}
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
                />
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger><SelectValue placeholder="Select your industry" /></SelectTrigger>
                  <SelectContent>
                    {industries.map((ind) => (
                      <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="companySize">Company Size</Label>
                <Select value={companySize} onValueChange={setCompanySize}>
                  <SelectTrigger><SelectValue placeholder="Select company size" /></SelectTrigger>
                  <SelectContent>
                    {companySizes.map((size) => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => setStep(2)} className="w-full" disabled={!companyName.trim()}>
                Next
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="country">Country</Label>
                <CountrySelect value={locationCountry} onChange={setLocationCountry} placeholder="Select your country" />
              </div>
              <div>
                <Label htmlFor="venueAddress">Business Address</Label>
                <Input
                  id="venueAddress"
                  placeholder="e.g., Hamra Street, Beirut"
                  value={venueAddress}
                  onChange={(e) => setVenueAddress(e.target.value)}
                  maxLength={300}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                <Button onClick={() => setStep(3)} className="flex-1">Next</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              {/* Logo Upload */}
              <div className="flex flex-col items-center gap-2">
                <Label className="text-sm">Brand Logo</Label>
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
                  />
                  <div className="relative">
                    <ProfileAvatar src={logoPreview} fallbackName={companyName || "B"} className="h-20 w-20" />
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </label>
                <p className="text-[11px] text-muted-foreground">Click to upload (max 5MB)</p>
              </div>

              {/* Social Media */}
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
                />
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
                />
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
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
                <Button onClick={handleSubmit} className="flex-1 gradient-hero" disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</> : "Complete Registration"}
                </Button>
              </div>
            </div>
          )}
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-4">
          You can always update these details later in settings
        </p>
      </div>
    </div>
  );
};

export default BrandOnboarding;
