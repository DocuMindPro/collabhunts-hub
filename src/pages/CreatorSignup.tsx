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
import { CheckCircle, Instagram, Youtube, Twitter, Upload, X, Play, Image as ImageIcon, User, Camera, Phone, Loader2 } from "lucide-react";
import { z } from "zod";
import PhoneInput from "@/components/PhoneInput";
import AiBioSuggestions from "@/components/AiBioSuggestions";

// Validation schemas
const emailSchema = z.string().email("Invalid email address").max(255);
const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(100);
const displayNameSchema = z.string().trim().min(5, "Name must be at least 5 characters").max(100);
const bioSchema = z.string()
  .min(50, "Bio must be at least 50 characters - write a sentence about yourself!")
  .max(1000, "Bio must be less than 1000 characters");
const usernameSchema = z.string().trim().min(3, "Username must be at least 3 characters").max(50);

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

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
interface PortfolioItem {
  file: File;
  type: "image" | "video";
  previewUrl: string;
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
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Step 2: Profile details
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [locationCity, setLocationCity] = useState("");
  const [locationState, setLocationState] = useState("");
  const [locationCountry, setLocationCountry] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Demographics (optional)
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [ethnicity, setEthnicity] = useState("");
  const [primaryLanguage, setPrimaryLanguage] = useState("English");
  const [secondaryLanguages, setSecondaryLanguages] = useState<string[]>([]);

  // Step 3: Profile Photos
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");
  const [coverImages, setCoverImages] = useState<(File | null)[]>([null, null, null]);
  const [coverImagePreviews, setCoverImagePreviews] = useState<string[]>(["", "", ""]);

  // Step 4: Social accounts
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);

  // Step 5: Services
  const [services, setServices] = useState<Service[]>([]);

  // Step 6: Portfolio (optional)
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);

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

  const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];
  const ETHNICITIES = ["African American", "Asian", "Caucasian", "Hispanic/Latino", "Middle Eastern", "Mixed/Other", "Prefer not to say"];
  const LANGUAGES = ["English", "Spanish", "French", "German", "Portuguese", "Arabic", "Hindi", "Chinese", "Japanese", "Korean", "Other"];

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

  const progress = (step / 7) * 100;

  const phoneSchema = z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number must be less than 20 digits")
    .regex(/^\+[1-9]\d{6,14}$/, "Please enter a valid phone number");

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

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      displayNameSchema.parse(fullName);
      phoneSchema.parse(phoneNumber);
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

    if (!phoneVerified) {
      toast({
        title: "Phone Verification Required",
        description: "Please verify your phone number before continuing",
        variant: "destructive"
      });
      return;
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
    
    if (!profileImage) {
      toast({
        title: "Validation Error",
        description: "Please upload a profile photo",
        variant: "destructive"
      });
      return;
    }

    if (!coverImages[0]) {
      toast({
        title: "Validation Error",
        description: "Please upload at least one cover image",
        variant: "destructive"
      });
      return;
    }

    setStep(4);
  };

  const handleStep4 = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (socialAccounts.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one social media account",
        variant: "destructive"
      });
      return;
    }

    setStep(5);
  };

  const handleStep5 = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (services.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one service package",
        variant: "destructive"
      });
      return;
    }

    setStep(6);
  };

  const handleStep6 = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(7);
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Profile image must be less than 5MB",
        variant: "destructive"
      });
      return;
    }

    if (profileImagePreview) {
      URL.revokeObjectURL(profileImagePreview);
    }

    setProfileImage(file);
    setProfileImagePreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleCoverImageUpload = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Cover image must be less than 5MB",
        variant: "destructive"
      });
      return;
    }

    if (coverImagePreviews[index]) {
      URL.revokeObjectURL(coverImagePreviews[index]);
    }

    const newCoverImages = [...coverImages];
    newCoverImages[index] = file;
    setCoverImages(newCoverImages);

    const newPreviews = [...coverImagePreviews];
    newPreviews[index] = URL.createObjectURL(file);
    setCoverImagePreviews(newPreviews);
    e.target.value = "";
  };

  const removeCoverImage = (index: number) => {
    if (coverImagePreviews[index]) {
      URL.revokeObjectURL(coverImagePreviews[index]);
    }
    const newCoverImages = [...coverImages];
    newCoverImages[index] = null;
    setCoverImages(newCoverImages);

    const newPreviews = [...coverImagePreviews];
    newPreviews[index] = "";
    setCoverImagePreviews(newPreviews);
  };

  const handlePortfolioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isVideo && !isImage) {
      toast({
        title: "Invalid file",
        description: "Please upload an image or video file",
        variant: "destructive"
      });
      return;
    }

    // Check video limit
    const videoCount = portfolioItems.filter(p => p.type === "video").length;
    if (isVideo && videoCount >= 3) {
      toast({
        title: "Video limit reached",
        description: "You can upload a maximum of 3 videos",
        variant: "destructive"
      });
      return;
    }

    // Check file size
    const maxSize = isVideo ? 100 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `${isVideo ? "Videos" : "Images"} must be less than ${isVideo ? "100MB" : "5MB"}`,
        variant: "destructive"
      });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPortfolioItems([...portfolioItems, {
      file,
      type: isVideo ? "video" : "image",
      previewUrl
    }]);
    e.target.value = "";
  };

  const removePortfolioItem = (index: number) => {
    URL.revokeObjectURL(portfolioItems[index].previewUrl);
    setPortfolioItems(portfolioItems.filter((_, i) => i !== index));
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

      // Upload profile image
      let profileImageUrl: string | null = null;
      if (profileImage) {
        const fileExt = profileImage.name.split(".").pop();
        const filePath = `${authData.user.id}/profile.${fileExt}`;
        
        const { error: profileUploadError } = await supabase.storage
          .from("profile-images")
          .upload(filePath, profileImage);

        if (profileUploadError) {
          console.error("Profile image upload error:", profileUploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from("profile-images")
            .getPublicUrl(filePath);
          profileImageUrl = publicUrl;
        }
      }

      // Upload cover images (up to 3)
      const coverImageUrls: (string | null)[] = [null, null, null];
      for (let i = 0; i < 3; i++) {
        const coverImg = coverImages[i];
        if (coverImg) {
          const fileExt = coverImg.name.split(".").pop();
          const filePath = `${authData.user.id}/cover-${i + 1}.${fileExt}`;
          
          const { error: coverUploadError } = await supabase.storage
            .from("profile-images")
            .upload(filePath, coverImg);

          if (coverUploadError) {
            console.error(`Cover image ${i + 1} upload error:`, coverUploadError);
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from("profile-images")
              .getPublicUrl(filePath);
            coverImageUrls[i] = publicUrl;
          }
        }
      }

      // Create creator profile with phone number
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
          status: "pending",
          profile_image_url: profileImageUrl,
          cover_image_url: coverImageUrls[0],
          cover_image_url_2: coverImageUrls[1],
          cover_image_url_3: coverImageUrls[2],
          birth_date: birthDate || null,
          gender: gender || null,
          ethnicity: ethnicity || null,
          primary_language: primaryLanguage || "English",
          secondary_languages: secondaryLanguages.length > 0 ? secondaryLanguages : null,
          phone_number: phoneNumber,
          phone_verified: phoneVerified
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

      // Upload portfolio items if any
      if (portfolioItems.length > 0) {
        for (let i = 0; i < portfolioItems.length; i++) {
          const item = portfolioItems[i];
          const fileExt = item.file.name.split(".").pop();
          const fileName = `${Date.now()}-${i}.${fileExt}`;
          const filePath = `${authData.user.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("portfolio-media")
            .upload(filePath, item.file);

          if (uploadError) {
            console.error("Portfolio upload error:", uploadError);
            continue;
          }

          const { data: { publicUrl } } = supabase.storage
            .from("portfolio-media")
            .getPublicUrl(filePath);

          await supabase.from("creator_portfolio_media").insert({
            creator_profile_id: profileData.id,
            media_type: item.type,
            url: publicUrl,
            thumbnail_url: item.type === "image" ? publicUrl : null,
            display_order: i
          });
        }
      }

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
            <p className="text-sm text-muted-foreground mt-2">Step {step} of 7</p>
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

                  {/* Phone Verification */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Phone className="h-4 w-4 text-primary" />
                      <Label className="font-semibold">Phone Verification</Label>
                      <span className="text-destructive text-xs">*Required</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <div className="flex gap-2">
                          <PhoneInput
                            value={phoneNumber}
                            onChange={(num) => {
                              setPhoneNumber(num);
                              setPhoneVerified(false);
                            }}
                            disabled={phoneVerified}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant={phoneVerified ? "default" : "outline"}
                            onClick={handleSendOtp}
                            disabled={sendingOtp || phoneVerified || phoneNumber.length < 10}
                          >
                            {sendingOtp ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : phoneVerified ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              "Send Code"
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Include country code (e.g., +1 for US)
                        </p>
                      </div>

                      {!phoneVerified && phoneNumber.length >= 10 && (
                        <div>
                          <Label htmlFor="phoneOtp">Verification Code</Label>
                          <div className="flex gap-2">
                            <Input
                              id="phoneOtp"
                              value={phoneOtp}
                              onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="Enter 6-digit code"
                              maxLength={6}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              onClick={handleVerifyOtp}
                              disabled={verifyingOtp || phoneOtp.length !== 6}
                            >
                              {verifyingOtp ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Verify"
                              )}
                            </Button>
                          </div>
                        </div>
                      )}

                      {phoneVerified && (
                        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-md">
                          <CheckCircle className="h-4 w-4" />
                          <span>Phone number verified successfully</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full gradient-hero hover:opacity-90"
                    disabled={!phoneVerified}
                  >
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
                    <AiBioSuggestions
                      text={displayName}
                      onSelect={(text) => setDisplayName(text)}
                      minLength={5}
                      type="display_name"
                      label="display name"
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
                    <p className="text-xs text-muted-foreground mt-1">
                      {bio.length}/1000 {bio.length < 50 && <span className="text-destructive">(minimum 50 characters - {50 - bio.length} more needed)</span>}
                    </p>
                    <AiBioSuggestions
                      text={bio}
                      onSelect={(text) => setBio(text)}
                      minLength={20}
                      type="bio"
                    />
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

                  {/* Demographics Section */}
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Label className="text-base font-semibold">Demographics (Optional)</Label>
                      <span className="text-xs text-muted-foreground">Helps brands find creators</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="birthDate">Date of Birth</Label>
                        <Input
                          id="birthDate"
                          type="date"
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <Label htmlFor="gender">Gender</Label>
                        <select
                          id="gender"
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        >
                          <option value="">Select gender</option>
                          {GENDERS.map((g) => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="ethnicity">Ethnicity</Label>
                        <select
                          id="ethnicity"
                          value={ethnicity}
                          onChange={(e) => setEthnicity(e.target.value)}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        >
                          <option value="">Select ethnicity</option>
                          {ETHNICITIES.map((e) => (
                            <option key={e} value={e}>{e}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="primaryLanguage">Primary Language</Label>
                        <select
                          id="primaryLanguage"
                          value={primaryLanguage}
                          onChange={(e) => setPrimaryLanguage(e.target.value)}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        >
                          {LANGUAGES.map((lang) => (
                            <option key={lang} value={lang}>{lang}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label>Secondary Languages</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {LANGUAGES.filter(l => l !== primaryLanguage).map((lang) => (
                          <Badge
                            key={lang}
                            variant={secondaryLanguages.includes(lang) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              if (secondaryLanguages.includes(lang)) {
                                setSecondaryLanguages(secondaryLanguages.filter(l => l !== lang));
                              } else {
                                setSecondaryLanguages([...secondaryLanguages, lang]);
                              }
                            }}
                          >
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 gradient-hero hover:opacity-90"
                      disabled={bio.length < 50 || displayName.length < 5 || selectedCategories.length === 0}
                    >
                      Continue
                    </Button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={handleStep3} className="space-y-6">
                  <CardHeader className="px-0">
                    <CardTitle>Your Profile Photos</CardTitle>
                    <CardDescription>Make a great first impression on brands</CardDescription>
                  </CardHeader>

                  {/* Profile Photo */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      <Label className="text-base font-semibold">Profile Photo (Required)</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your avatar shown in search results and next to your name
                    </p>
                    
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        {profileImagePreview ? (
                          <div className="relative">
                            <img 
                              src={profileImagePreview} 
                              alt="Profile preview" 
                              className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                URL.revokeObjectURL(profileImagePreview);
                                setProfileImage(null);
                                setProfileImagePreview("");
                              }}
                              className="absolute -top-1 -right-1 p-1 bg-destructive text-destructive-foreground rounded-full"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
                            <User className="h-10 w-10 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      
                      <label htmlFor="profile-image-upload" className="cursor-pointer">
                        <div className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
                          <Upload className="h-4 w-4" />
                          {profileImagePreview ? "Change Photo" : "Upload Photo"}
                        </div>
                        <input
                          id="profile-image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleProfileImageUpload}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Cover Images - 3 uniformly sized slots */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Camera className="h-5 w-5 text-primary" />
                      <Label className="text-base font-semibold">Cover Photos (First Required)</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      These are the main images brands see on your profile. Use portrait photos (4:5 ratio) for best display.
                    </p>
                    
                    <div className="grid grid-cols-3 gap-3">
                      {[0, 1, 2].map((index) => (
                        <div key={index} className="relative">
                          {coverImagePreviews[index] ? (
                            <div className="relative aspect-[4/5] rounded-lg overflow-hidden border-2 border-primary">
                              <img 
                                src={coverImagePreviews[index]} 
                                alt={`Cover ${index + 1}`} 
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeCoverImage(index)}
                                className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full shadow-lg"
                              >
                                <X className="h-3 w-3" />
                              </button>
                              <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded text-white text-xs">
                                {index === 0 ? "Main" : `Photo ${index + 1}`}
                              </div>
                            </div>
                          ) : (
                            <label htmlFor={`cover-image-upload-${index}`} className="cursor-pointer block">
                              <div className={`aspect-[4/5] rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors ${
                                index === 0 
                                  ? 'border-primary/50 bg-primary/5 hover:bg-primary/10' 
                                  : 'border-muted-foreground/30 bg-muted hover:bg-muted/80'
                              }`}>
                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground text-center px-2">
                                  {index === 0 ? "Required" : "Optional"}
                                </span>
                              </div>
                              <input
                                id={`cover-image-upload-${index}`}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleCoverImageUpload(index)}
                              />
                            </label>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Supported formats: JPG, PNG, WEBP (max 5MB each)
                  </p>

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
                <form onSubmit={handleStep5} className="space-y-4">
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
                    <Button type="button" variant="outline" onClick={() => setStep(4)} className="flex-1">
                      Back
                    </Button>
                    <Button type="submit" className="flex-1 gradient-hero hover:opacity-90">
                      Continue
                    </Button>
                  </div>
                </form>
              )}

              {step === 6 && (
                <form onSubmit={handleStep6} className="space-y-4">
                  <CardHeader className="px-0">
                    <CardTitle>Upload Your Best Work</CardTitle>
                    <CardDescription>Showcase your content to brands (optional, max 3 videos)</CardDescription>
                  </CardHeader>

                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <label htmlFor="portfolio-upload" className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
                        <Upload className="h-4 w-4" />
                        Add Image/Video
                      </label>
                      <input
                        id="portfolio-upload"
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={handlePortfolioUpload}
                      />
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Images: JPG, PNG, WEBP (max 5MB) • Videos: MP4, MOV, WEBM (max 100MB)
                    </p>

                    {portfolioItems.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {portfolioItems.map((item, index) => (
                          <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-muted">
                            {item.type === "image" ? (
                              <img src={item.previewUrl} alt="Portfolio preview" className="w-full h-full object-cover" />
                            ) : (
                              <div className="relative w-full h-full">
                                <video src={item.previewUrl} className="w-full h-full object-cover" muted />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                  <Play className="h-8 w-8 text-white" />
                                </div>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => removePortfolioItem(index)}
                              className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded text-xs text-white capitalize">
                              {item.type}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {portfolioItems.length === 0 && (
                      <div className="text-center py-8 bg-muted/50 rounded-lg border-2 border-dashed">
                        <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">No portfolio media yet</p>
                        <p className="text-xs text-muted-foreground">Upload images and videos to showcase your work</p>
                      </div>
                    )}

                    <p className="text-sm text-muted-foreground">
                      Videos: {portfolioItems.filter(p => p.type === "video").length}/3 used
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep(5)} className="flex-1">
                      Back
                    </Button>
                    <Button type="submit" className="flex-1 gradient-hero hover:opacity-90">
                      {portfolioItems.length === 0 ? "Skip for Now" : "Continue"}
                    </Button>
                  </div>
                </form>
              )}

              {step === 7 && (
                <div className="space-y-6">
                  <CardHeader className="px-0">
                    <CardTitle>Review & Submit</CardTitle>
                    <CardDescription>Check your information before submitting</CardDescription>
                  </CardHeader>

                  <div className="space-y-4">
                    {/* Photos Preview */}
                    <div>
                      <h3 className="font-semibold mb-2">Your Photos</h3>
                      <div className="flex items-center gap-4">
                        {profileImagePreview && (
                          <div className="text-center">
                            <img 
                              src={profileImagePreview} 
                              alt="Profile" 
                              className="w-16 h-16 rounded-full object-cover border"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Profile</p>
                          </div>
                        )}
                        {coverImagePreviews.some(p => p) && (
                          <div className="flex-1">
                            <div className="grid grid-cols-3 gap-1">
                              {coverImagePreviews.map((preview, idx) => preview && (
                                <img 
                                  key={idx}
                                  src={preview} 
                                  alt={`Cover ${idx + 1}`} 
                                  className="aspect-[4/5] object-cover rounded border"
                                />
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Cover Images</p>
                          </div>
                        )}
                      </div>
                    </div>

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

                    {portfolioItems.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Portfolio</h3>
                        <p className="text-sm text-muted-foreground">
                          {portfolioItems.length} item(s) - {portfolioItems.filter(p => p.type === "image").length} images, {portfolioItems.filter(p => p.type === "video").length} videos
                        </p>
                      </div>
                    )}

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
                      onClick={() => setStep(6)}
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
