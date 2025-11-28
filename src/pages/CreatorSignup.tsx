import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Instagram, Youtube, Twitter } from "lucide-react";
import { z } from "zod";

// Validation schemas
const emailSchema = z.string().email("Invalid email address").max(255);
const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(100);
const displayNameSchema = z.string().trim().min(2, "Name must be at least 2 characters").max(100);
const bioSchema = z.string().max(1000, "Bio must be less than 1000 characters");
const usernameSchema = z.string().trim().min(3, "Username must be at least 3 characters").max(50);

type Step = 1 | 2 | 3 | 4 | 5;

interface SocialAccount {
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'twitch';
  username: string;
  followerCount: number;
}

interface Service {
  serviceType: string;
  priceCents: number;
  description: string;
  deliveryDays: number;
}

const CreatorSignup = () => {
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Step 1: Basic info
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // Step 2: Profile details
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [locationCity, setLocationCity] = useState("");
  const [locationState, setLocationState] = useState("");
  const [locationCountry, setLocationCountry] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Step 3: Social accounts
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);

  // Step 4: Services
  const [services, setServices] = useState<Service[]>([]);

  const categories = [
    "Lifestyle", "Fashion", "Beauty", "Travel", "Health & Fitness",
    "Food & Drink", "Tech & Gaming", "Music & Dance", "Comedy & Entertainment",
    "Family & Children", "Business", "Education"
  ];

  const serviceTypes = [
    { value: "instagram_post", label: "Instagram Post" },
    { value: "instagram_story", label: "Instagram Story" },
    { value: "instagram_reel", label: "Instagram Reel" },
    { value: "tiktok_video", label: "TikTok Video" },
    { value: "youtube_video", label: "YouTube Video" },
    { value: "youtube_short", label: "YouTube Short" },
    { value: "ugc_content", label: "UGC Content" }
  ];

  const platforms: Array<{ value: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'twitch'; label: string; icon: any }> = [
    { value: "instagram", label: "Instagram", icon: Instagram },
    { value: "tiktok", label: "TikTok", icon: Youtube },
    { value: "youtube", label: "YouTube", icon: Youtube },
    { value: "twitter", label: "Twitter", icon: Twitter },
    { value: "twitch", label: "Twitch", icon: Youtube }
  ];

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  const progress = (step / 5) * 100;

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      displayNameSchema.parse(fullName);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive"
        });
        return;
      }
    }

    setStep(2);
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      displayNameSchema.parse(displayName);
      bioSchema.parse(bio);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive"
        });
        return;
      }
    }

    if (selectedCategories.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one category",
        variant: "destructive"
      });
      return;
    }

    setStep(3);
  };

  const handleStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (socialAccounts.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one social media account",
        variant: "destructive"
      });
      return;
    }

    setStep(4);
  };

  const handleStep4 = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (services.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one service package",
        variant: "destructive"
      });
      return;
    }

    setStep(5);
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);

    try {
      // Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            user_type: "creator"
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("Failed to create user");

      // Create creator profile
      const { data: profileData, error: profileError } = await supabase
        .from("creator_profiles")
        .insert({
          user_id: authData.user.id,
          display_name: displayName,
          bio,
          location_city: locationCity || null,
          location_state: locationState || null,
          location_country: locationCountry || null,
          categories: selectedCategories,
          status: "pending"
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Create social accounts
      const socialAccountsData = socialAccounts.map(account => ({
        creator_profile_id: profileData.id,
        platform: account.platform,
        username: account.username,
        follower_count: account.followerCount,
        profile_url: `https://${account.platform}.com/${account.username}`
      }));

      const { error: socialError } = await supabase
        .from("creator_social_accounts")
        .insert(socialAccountsData);

      if (socialError) throw socialError;

      // Create services
      const servicesData = services.map(service => ({
        creator_profile_id: profileData.id,
        service_type: service.serviceType,
        price_cents: service.priceCents,
        description: service.description,
        delivery_days: service.deliveryDays,
        is_active: true
      }));

      const { error: servicesError } = await supabase
        .from("creator_services")
        .insert(servicesData);

      if (servicesError) throw servicesError;

      toast({
        title: "Application Submitted!",
        description: "Your profile is pending approval. We'll notify you once it's reviewed."
      });

      // Navigate after a delay
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create profile",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSocialAccount = (platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'twitch') => {
    const username = prompt(`Enter your ${platform} username:`);
    if (!username) return;

    try {
      usernameSchema.parse(username);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive"
        });
        return;
      }
    }

    const followerCountStr = prompt(`How many followers do you have on ${platform}?`);
    const followerCount = parseInt(followerCountStr || "0");

    if (isNaN(followerCount) || followerCount < 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid follower count",
        variant: "destructive"
      });
      return;
    }

    setSocialAccounts([...socialAccounts, { platform, username, followerCount }]);
  };

  const addService = (serviceType: string) => {
    const priceStr = prompt(`What's your price for ${serviceType}? (in USD)`);
    const price = parseFloat(priceStr || "0");

    if (isNaN(price) || price <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid price",
        variant: "destructive"
      });
      return;
    }

    const description = prompt(`Add a brief description for this service (optional):`);
    const deliveryDaysStr = prompt(`How many days for delivery? (default: 7)`);
    const deliveryDays = parseInt(deliveryDaysStr || "7");

    setServices([...services, {
      serviceType,
      priceCents: Math.round(price * 100),
      description: description || "",
      deliveryDays: isNaN(deliveryDays) ? 7 : deliveryDays
    }]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 px-4 gradient-subtle">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-heading font-bold mb-2">Join as a Creator</h1>
            <p className="text-muted-foreground">Complete your profile to start earning</p>
            <Progress value={progress} className="mt-4" />
            <p className="text-sm text-muted-foreground mt-2">Step {step} of 5</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              {step === 1 && (
                <form onSubmit={handleStep1} className="space-y-4">
                  <CardHeader className="px-0">
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Let's start with your account details</CardDescription>
                  </CardHeader>

                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      maxLength={100}
                    />
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
                    />
                    <p className="text-xs text-muted-foreground mt-1">Minimum 8 characters</p>
                  </div>

                  <Button type="submit" className="w-full gradient-hero hover:opacity-90">
                    Continue
                  </Button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleStep2} className="space-y-4">
                  <CardHeader className="px-0">
                    <CardTitle>Profile Details</CardTitle>
                    <CardDescription>Tell brands about yourself</CardDescription>
                  </CardHeader>

                  <div>
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="How you want to be known"
                      required
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell brands what makes you unique..."
                      rows={4}
                      maxLength={1000}
                    />
                    <p className="text-xs text-muted-foreground mt-1">{bio.length}/1000</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={locationCity}
                        onChange={(e) => setLocationCity(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={locationState}
                        onChange={(e) => setLocationState(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={locationCountry}
                        onChange={(e) => setLocationCountry(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Categories</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {categories.map((category) => (
                        <Badge
                          key={category}
                          variant={selectedCategories.includes(category) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            if (selectedCategories.includes(category)) {
                              setSelectedCategories(selectedCategories.filter(c => c !== category));
                            } else {
                              setSelectedCategories([...selectedCategories, category]);
                            }
                          }}
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Back
                    </Button>
                    <Button type="submit" className="flex-1 gradient-hero hover:opacity-90">
                      Continue
                    </Button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={handleStep3} className="space-y-4">
                  <CardHeader className="px-0">
                    <CardTitle>Social Media Accounts</CardTitle>
                    <CardDescription>Connect your platforms</CardDescription>
                  </CardHeader>

                  <div className="space-y-3">
                    {platforms.map((platform) => (
                      <Button
                        key={platform.value}
                        type="button"
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => addSocialAccount(platform.value)}
                      >
                        <platform.icon className="mr-2 h-5 w-5" />
                        Add {platform.label}
                      </Button>
                    ))}
                  </div>

                  {socialAccounts.length > 0 && (
                    <div className="space-y-2">
                      <Label>Added Accounts</Label>
                      {socialAccounts.map((account, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium capitalize">{account.platform}</p>
                            <p className="text-sm text-muted-foreground">
                              @{account.username} • {account.followerCount.toLocaleString()} followers
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSocialAccounts(socialAccounts.filter((_, i) => i !== index))}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
                      Back
                    </Button>
                    <Button type="submit" className="flex-1 gradient-hero hover:opacity-90">
                      Continue
                    </Button>
                  </div>
                </form>
              )}

              {step === 4 && (
                <form onSubmit={handleStep4} className="space-y-4">
                  <CardHeader className="px-0">
                    <CardTitle>Services & Pricing</CardTitle>
                    <CardDescription>What services do you offer?</CardDescription>
                  </CardHeader>

                  <div className="space-y-3">
                    {serviceTypes.map((service) => (
                      <Button
                        key={service.value}
                        type="button"
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => addService(service.value)}
                        disabled={services.some(s => s.serviceType === service.value)}
                      >
                        {service.label}
                      </Button>
                    ))}
                  </div>

                  {services.length > 0 && (
                    <div className="space-y-2">
                      <Label>Added Services</Label>
                      {services.map((service, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium">
                              {serviceTypes.find(t => t.value === service.serviceType)?.label}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ${(service.priceCents / 100).toFixed(2)} • {service.deliveryDays} days delivery
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setServices(services.filter((_, i) => i !== index))}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep(3)} className="flex-1">
                      Back
                    </Button>
                    <Button type="submit" className="flex-1 gradient-hero hover:opacity-90">
                      Continue
                    </Button>
                  </div>
                </form>
              )}

              {step === 5 && (
                <div className="space-y-6">
                  <CardHeader className="px-0">
                    <CardTitle>Review & Submit</CardTitle>
                    <CardDescription>Check your information before submitting</CardDescription>
                  </CardHeader>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Profile</h3>
                      <p className="text-sm text-muted-foreground">
                        {displayName} • {selectedCategories.join(", ")}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Social Accounts</h3>
                      <div className="space-y-1">
                        {socialAccounts.map((account, index) => (
                          <p key={index} className="text-sm text-muted-foreground">
                            {account.platform}: @{account.username} ({account.followerCount.toLocaleString()} followers)
                          </p>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Services</h3>
                      <div className="space-y-1">
                        {services.map((service, index) => (
                          <p key={index} className="text-sm text-muted-foreground">
                            {serviceTypes.find(t => t.value === service.serviceType)?.label}: ${(service.priceCents / 100).toFixed(2)}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Pending Approval</p>
                          <p className="text-sm text-muted-foreground">
                            Your profile will be reviewed by our team. We'll notify you once it's approved!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(4)}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleFinalSubmit}
                      disabled={isLoading}
                      className="flex-1 gradient-hero hover:opacity-90"
                    >
                      {isLoading ? "Submitting..." : "Submit Application"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CreatorSignup;