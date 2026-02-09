import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X, Camera, Images, ImagePlus, Phone, CheckCircle, Shield } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import SocialAccountsSection from "./SocialAccountsSection";
import PortfolioUploadSection from "./PortfolioUploadSection";
import VerificationBadgeCard from "./VerificationBadgeCard";
import AiBioSuggestions from "@/components/AiBioSuggestions";
import PhoneInput from "@/components/PhoneInput";
import TeamAccessCard from "@/components/team/TeamAccessCard";

const AVAILABLE_CATEGORIES = [
  "Fashion", "Beauty", "Fitness", "Travel", "Food", "Tech",
  "Gaming", "Lifestyle", "Photography", "Art", "Music", "Sports"
];

const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];
const ETHNICITIES = ["African American", "Asian", "Caucasian", "Hispanic/Latino", "Middle Eastern", "Mixed/Other", "Prefer not to say"];
const LANGUAGES = ["English", "Spanish", "French", "German", "Portuguese", "Arabic", "Hindi", "Chinese", "Japanese", "Korean", "Other"];

const ProfileTab = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingCoverIndex, setUploadingCoverIndex] = useState<number | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [profile, setProfile] = useState({
    id: "",
    display_name: "",
    bio: "",
    location_city: "",
    location_state: "",
    location_country: "",
    categories: [] as string[],
    profile_image_url: "",
    cover_image_url: "",
    cover_image_url_2: "",
    cover_image_url_3: "",
    birth_date: "",
    gender: "",
    ethnicity: "",
    primary_language: "English",
    secondary_languages: [] as string[],
    phone_number: "",
    phone_verified: false,
    allow_mass_messages: true,
    show_pricing_to_public: true,
    open_to_invitations: false,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("creator_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          id: data.id,
          display_name: data.display_name || "",
          bio: data.bio || "",
          location_city: data.location_city || "",
          location_state: data.location_state || "",
          location_country: data.location_country || "",
          categories: data.categories || [],
          profile_image_url: data.profile_image_url || "",
          cover_image_url: data.cover_image_url || "",
          cover_image_url_2: data.cover_image_url_2 || "",
          cover_image_url_3: data.cover_image_url_3 || "",
          birth_date: data.birth_date || "",
          gender: data.gender || "",
          ethnicity: data.ethnicity || "",
          primary_language: data.primary_language || "English",
          secondary_languages: data.secondary_languages || [],
          phone_number: data.phone_number || "",
          phone_verified: data.phone_verified || false,
          allow_mass_messages: data.allow_mass_messages ?? true,
          show_pricing_to_public: data.show_pricing_to_public ?? true,
          open_to_invitations: data.open_to_invitations ?? false,
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-save handler for Open to Invitations toggle
  const handleOpenToInvitationsChange = async (checked: boolean) => {
    // Optimistic update
    setProfile({ ...profile, open_to_invitations: checked });
    
    try {
      const { error } = await supabase
        .from("creator_profiles")
        .update({ open_to_invitations: checked })
        .eq("id", profile.id);
        
      if (error) throw error;
      
      toast({
        title: checked ? "You're now open to invitations!" : "Invitations disabled",
        description: checked 
          ? "Brands can now see you're open to free collaborations"
          : "Your profile no longer shows the open to invitations badge",
      });
    } catch (error) {
      // Rollback on error
      setProfile({ ...profile, open_to_invitations: !checked });
      toast({
        title: "Error",
        description: "Failed to update setting. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      // Upload via R2 edge function
      const formData = new FormData();
      formData.append('file', file);
      formData.append('image_type', 'profile');

      const response = await supabase.functions.invoke('upload-profile-image', {
        body: formData,
      });

      if (response.error) throw new Error(response.error.message);
      if (!response.data.success) throw new Error(response.data.error || 'Upload failed');

      setProfile({ ...profile, profile_image_url: response.data.url });

      toast({
        title: "Success",
        description: "Profile image uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingCoverIndex(index);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      const coverKey = index === 0 ? 'cover_image_url' : 
                       index === 1 ? 'cover_image_url_2' : 'cover_image_url_3';

      // Upload via R2 edge function
      const formData = new FormData();
      formData.append('file', file);
      formData.append('image_type', `cover-${index + 1}`);

      const response = await supabase.functions.invoke('upload-profile-image', {
        body: formData,
      });

      if (response.error) throw new Error(response.error.message);
      if (!response.data.success) throw new Error(response.data.error || 'Upload failed');

      setProfile({ ...profile, [coverKey]: response.data.url });

      toast({
        title: "Success",
        description: `Cover image ${index + 1} uploaded successfully`,
      });
    } catch (error) {
      console.error("Error uploading cover image:", error);
      toast({
        title: "Error",
        description: "Failed to upload cover image",
        variant: "destructive",
      });
    } finally {
      setUploadingCoverIndex(null);
    }
  };

  const removeCoverImage = async (index: number) => {
    if (index === 0) {
      toast({
        title: "Cannot remove",
        description: "Cover image 1 is required",
        variant: "destructive",
      });
      return;
    }

    const coverKey = index === 1 ? 'cover_image_url_2' : 'cover_image_url_3';
    const currentUrl = profile[coverKey];

    if (!currentUrl) return;

    // Just clear from state - R2 cleanup can be handled later if needed
    setProfile({ ...profile, [coverKey]: "" });

    toast({
      title: "Removed",
      description: `Cover image ${index + 1} removed`,
    });
  };

  const toggleCategory = (category: string) => {
    setProfile({
      ...profile,
      categories: profile.categories.includes(category)
        ? profile.categories.filter((c) => c !== category)
        : [...profile.categories, category],
    });
  };

  const handleSendPhoneOtp = async () => {
    if (newPhoneNumber.length < 10) {
      toast({
        title: "Invalid Phone",
        description: "Please enter a valid phone number with country code",
        variant: "destructive",
      });
      return;
    }

    setSendingOtp(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: newPhoneNumber,
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
        variant: "destructive",
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (phoneOtp.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    setVerifyingOtp(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: newPhoneNumber,
        token: phoneOtp,
        type: 'sms',
      });

      if (error) throw error;

      // Update profile with new phone number
      const { error: updateError } = await supabase
        .from("creator_profiles")
        .update({
          phone_number: newPhoneNumber,
          phone_verified: true,
        })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, phone_number: newPhoneNumber, phone_verified: true });
      setIsEditingPhone(false);
      setNewPhoneNumber("");
      setPhoneOtp("");

      toast({
        title: "Phone Updated",
        description: "Your phone number has been verified and updated",
      });
    } catch (error: any) {
      console.error("OTP verify error:", error);
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSave = async () => {
    if (!profile.display_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Display name is required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("creator_profiles")
        .update({
          display_name: profile.display_name,
          bio: profile.bio,
          location_city: profile.location_city,
          location_state: profile.location_state,
          location_country: profile.location_country,
          categories: profile.categories,
          profile_image_url: profile.profile_image_url,
          cover_image_url: profile.cover_image_url,
          cover_image_url_2: profile.cover_image_url_2,
          cover_image_url_3: profile.cover_image_url_3,
          birth_date: profile.birth_date || null,
          gender: profile.gender || null,
          ethnicity: profile.ethnicity || null,
          primary_language: profile.primary_language || "English",
          secondary_languages: profile.secondary_languages.length > 0 ? profile.secondary_languages : null,
          allow_mass_messages: profile.allow_mass_messages,
          show_pricing_to_public: profile.show_pricing_to_public,
          open_to_invitations: profile.open_to_invitations,
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-20">
      {/* ── Your Media ── */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Images className="h-4 w-4" />
            Your Media
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-4">
          {/* Profile Image */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20 border-2 border-border">
                <AvatarImage src={profile.profile_image_url} className="object-cover" />
                <AvatarFallback className="text-2xl bg-gradient-accent text-white">
                  {profile.display_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Label 
                htmlFor="profile-image-upload" 
                className="absolute -bottom-1 -right-1 p-1.5 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-md"
              >
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
              </Label>
              <Input id="profile-image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </div>
            <div>
              <p className="text-sm font-medium">Profile Photo</p>
              <p className="text-xs text-muted-foreground">JPG, PNG or WEBP. Max 5MB.</p>
            </div>
          </div>

          <Separator />

          {/* Cover Images */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ImagePlus className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Cover Images</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((index) => {
                const coverUrl = index === 0 ? profile.cover_image_url :
                                 index === 1 ? profile.cover_image_url_2 : 
                                 profile.cover_image_url_3;
                const isUploading = uploadingCoverIndex === index;
                const inputId = `cover-image-upload-${index}`;
                
                return (
                  <div key={index} className="relative">
                    {coverUrl ? (
                      <div className="relative aspect-[3/2] rounded-lg overflow-hidden border group">
                        <img src={coverUrl} alt={`Cover ${index + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                          <Label htmlFor={inputId} className="px-2 py-1 bg-white text-foreground rounded cursor-pointer hover:bg-white/90 text-xs font-medium">
                            {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Change"}
                          </Label>
                          {index > 0 && (
                            <button onClick={() => removeCoverImage(index)} className="px-2 py-1 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 text-xs font-medium">
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <Label htmlFor={inputId} className="flex flex-col items-center justify-center aspect-[3/2] rounded-lg border-2 border-dashed border-muted-foreground/25 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors">
                        {isUploading ? (
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        ) : (
                          <>
                            <ImagePlus className="h-5 w-5 text-muted-foreground mb-1" />
                            <span className="text-[10px] text-muted-foreground text-center px-1">
                              {index === 0 ? "Cover" : `Photo ${index + 1}`}
                            </span>
                          </>
                        )}
                      </Label>
                    )}
                    <Input id={inputId} type="file" accept="image/*" className="hidden" onChange={(e) => handleCoverImageUpload(e, index)} disabled={isUploading} />
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Portfolio */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Images className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Portfolio Gallery</span>
            </div>
            <PortfolioUploadSection creatorProfileId={profile.id} compact />
          </div>
        </CardContent>
      </Card>

      {/* ── Profile Details (consolidated) ── */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-base">Profile Details</CardTitle>
          <CardDescription className="text-xs">Your public profile information</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          {/* Name & Bio */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="display_name" className="text-xs">Display Name *</Label>
              <Input
                id="display_name"
                value={profile.display_name}
                onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                placeholder="Your display name"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bio" className="text-xs">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={3}
                className="min-h-[70px]"
              />
              <AiBioSuggestions text={profile.bio} onSelect={(text) => setProfile({ ...profile, bio: text })} minLength={20} type="bio" />
            </div>
          </div>

          <Separator />

          {/* Phone */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm font-medium">Phone Number</span>
            </div>
            {profile.phone_number && profile.phone_verified && !isEditingPhone ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                <span className="text-sm font-medium">{profile.phone_number}</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700 text-[10px] h-5">Verified</Badge>
                <Button variant="ghost" size="sm" className="ml-auto h-7 text-xs" onClick={() => { setIsEditingPhone(true); setNewPhoneNumber(""); setPhoneOtp(""); }}>
                  Change
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {!profile.phone_number && !isEditingPhone && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">No phone number on file.</p>
                )}
                <div className="flex gap-2">
                  <PhoneInput value={newPhoneNumber} onChange={setNewPhoneNumber} className="flex-1" />
                  <Button variant="outline" size="sm" onClick={handleSendPhoneOtp} disabled={sendingOtp || newPhoneNumber.length < 10} className="h-9">
                    {sendingOtp ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Send Code"}
                  </Button>
                </div>
                {newPhoneNumber.length >= 10 && (
                  <div className="flex gap-2">
                    <Input id="phone_otp" value={phoneOtp} onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit code" maxLength={6} className="flex-1 h-9" />
                    <Button size="sm" onClick={handleVerifyPhoneOtp} disabled={verifyingOtp || phoneOtp.length !== 6} className="h-9">
                      {verifyingOtp ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Verify"}
                    </Button>
                  </div>
                )}
                {isEditingPhone && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setIsEditingPhone(false); setNewPhoneNumber(""); setPhoneOtp(""); }}>Cancel</Button>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Location */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Location</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label htmlFor="city" className="text-xs">City</Label>
                <Input id="city" value={profile.location_city} onChange={(e) => setProfile({ ...profile, location_city: e.target.value })} placeholder="e.g. Los Angeles" className="h-9" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="state" className="text-xs">State/Province</Label>
                <Input id="state" value={profile.location_state} onChange={(e) => setProfile({ ...profile, location_state: e.target.value })} placeholder="e.g. California" className="h-9" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="country" className="text-xs">Country</Label>
                <Input id="country" value={profile.location_country} onChange={(e) => setProfile({ ...profile, location_country: e.target.value })} placeholder="e.g. United States" className="h-9" />
              </div>
            </div>
          </div>

          <Separator />

          {/* Categories */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Categories</span>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_CATEGORIES.map((category) => (
                <Badge
                  key={category}
                  variant={profile.categories.includes(category) ? "default" : "outline"}
                  className="cursor-pointer text-xs h-6"
                  onClick={() => toggleCategory(category)}
                >
                  {profile.categories.includes(category) && <X className="h-3 w-3 mr-0.5" />}
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Demographics */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Demographics</span>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="birth_date" className="text-xs">Date of Birth</Label>
                <Input id="birth_date" type="date" value={profile.birth_date} onChange={(e) => setProfile({ ...profile, birth_date: e.target.value })} max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]} className="h-9" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="gender" className="text-xs">Gender</Label>
                <select id="gender" value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })} className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
                  <option value="">Select</option>
                  {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="ethnicity" className="text-xs">Ethnicity</Label>
                <select id="ethnicity" value={profile.ethnicity} onChange={(e) => setProfile({ ...profile, ethnicity: e.target.value })} className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
                  <option value="">Select</option>
                  {ETHNICITIES.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="primary_language" className="text-xs">Primary Language</Label>
                <select id="primary_language" value={profile.primary_language} onChange={(e) => setProfile({ ...profile, primary_language: e.target.value })} className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
                  {LANGUAGES.map((lang) => <option key={lang} value={lang}>{lang}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1 pt-1">
              <Label className="text-xs">Secondary Languages</Label>
              <div className="flex flex-wrap gap-1.5">
                {LANGUAGES.filter(l => l !== profile.primary_language).map((lang) => (
                  <Badge
                    key={lang}
                    variant={profile.secondary_languages.includes(lang) ? "default" : "outline"}
                    className="cursor-pointer text-xs h-6"
                    onClick={() => {
                      if (profile.secondary_languages.includes(lang)) {
                        setProfile({ ...profile, secondary_languages: profile.secondary_languages.filter(l => l !== lang) });
                      } else {
                        setProfile({ ...profile, secondary_languages: [...profile.secondary_languages, lang] });
                      }
                    }}
                  >
                    {profile.secondary_languages.includes(lang) && <X className="h-3 w-3 mr-0.5" />}
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Privacy & Visibility ── */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy & Visibility
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-0">
          <div className="flex items-center justify-between py-3">
            <div>
              <Label htmlFor="show-pricing-to-public" className="text-sm font-medium">Show Pricing to All</Label>
              <p className="text-xs text-muted-foreground">Non-subscribers see dimmed prices when disabled</p>
            </div>
            <Switch id="show-pricing-to-public" checked={profile.show_pricing_to_public} onCheckedChange={(checked) => setProfile({ ...profile, show_pricing_to_public: checked })} />
          </div>
          <div className="flex items-center justify-between py-3 border-t">
            <div>
              <Label htmlFor="open-to-invitations" className="text-sm font-medium flex items-center gap-1.5">
                Open to Invitations
                <Badge className="bg-green-500 text-white text-[9px] px-1 h-4">New</Badge>
              </Label>
              <p className="text-xs text-muted-foreground">Show you're open to free collaborations</p>
            </div>
            <Switch id="open-to-invitations" checked={profile.open_to_invitations} onCheckedChange={handleOpenToInvitationsChange} />
          </div>
          <div className="flex items-center justify-between py-3 border-t">
            <div>
              <Label htmlFor="allow-mass-messages" className="text-sm font-medium">Allow Mass Messages</Label>
              <p className="text-xs text-muted-foreground">Brands can include you in mass outreach</p>
            </div>
            <Switch id="allow-mass-messages" checked={profile.allow_mass_messages} onCheckedChange={(checked) => setProfile({ ...profile, allow_mass_messages: checked })} />
          </div>
        </CardContent>
      </Card>

      <SocialAccountsSection creatorProfileId={profile.id} />
      <VerificationBadgeCard creatorProfileId={profile.id} />
      <TeamAccessCard profileId={profile.id} accountType="creator" />

      {/* Sticky Save Button */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t p-3 flex justify-end">
        <div className="container mx-auto max-w-7xl flex justify-end px-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;