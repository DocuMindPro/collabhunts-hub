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
import { Loader2, Upload, X, Camera, Images, ImagePlus } from "lucide-react";
import SocialAccountsSection from "./SocialAccountsSection";
import PortfolioUploadSection from "./PortfolioUploadSection";
import AiBioSuggestions from "@/components/AiBioSuggestions";

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Delete old image if exists
      if (profile.profile_image_url) {
        const oldPath = profile.profile_image_url.split("/").pop();
        if (oldPath) {
          await supabase.storage
            .from("profile-images")
            .remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload new image
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("profile-images")
        .getPublicUrl(filePath);

      setProfile({ ...profile, profile_image_url: publicUrl });

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const coverKey = index === 0 ? 'cover_image_url' : 
                       index === 1 ? 'cover_image_url_2' : 'cover_image_url_3';
      const currentUrl = profile[coverKey];

      // Delete old cover image if exists
      if (currentUrl) {
        const oldPath = currentUrl.split("/").pop();
        if (oldPath) {
          await supabase.storage
            .from("profile-images")
            .remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload new cover image
      const fileExt = file.name.split(".").pop();
      const fileName = `cover-${index + 1}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("profile-images")
        .getPublicUrl(filePath);

      setProfile({ ...profile, [coverKey]: publicUrl });

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

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const oldPath = currentUrl.split("/").pop();
      if (oldPath) {
        await supabase.storage
          .from("profile-images")
          .remove([`${user.id}/${oldPath}`]);
      }

      setProfile({ ...profile, [coverKey]: "" });

      toast({
        title: "Removed",
        description: `Cover image ${index + 1} removed`,
      });
    } catch (error) {
      console.error("Error removing cover image:", error);
      toast({
        title: "Error",
        description: "Failed to remove cover image",
        variant: "destructive",
      });
    }
  };

  const toggleCategory = (category: string) => {
    setProfile({
      ...profile,
      categories: profile.categories.includes(category)
        ? profile.categories.filter((c) => c !== category)
        : [...profile.categories, category],
    });
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
    <div className="space-y-6">
      {/* Consolidated Media Management Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Images className="h-5 w-5" />
            Your Media
          </CardTitle>
          <CardDescription>
            Manage your profile image and portfolio in one place
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Profile Image Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Camera className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Profile Image</h3>
              <span className="text-xs text-muted-foreground ml-auto">Appears in search results</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-28 w-28 border-4 border-border">
                  <AvatarImage src={profile.profile_image_url} className="object-cover" />
                  <AvatarFallback className="text-3xl bg-gradient-accent text-white">
                    {profile.display_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Label 
                  htmlFor="profile-image-upload" 
                  className="absolute -bottom-2 -right-2 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-lg"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Label>
                <Input
                  id="profile-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </div>
              <div className="space-y-1">
                <p className="font-medium">Main Profile Photo</p>
                <p className="text-sm text-muted-foreground">
                  This is the image brands see when browsing creators.
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG or WEBP. Max 5MB. Recommended: 400×500px
                </p>
              </div>
            </div>
          </div>

          {/* Cover Images Section - 3 Slots */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <ImagePlus className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Cover Images</h3>
              <span className="text-xs text-muted-foreground ml-auto">Displayed on your profile page</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[0, 1, 2].map((index) => {
                const coverUrl = index === 0 ? profile.cover_image_url :
                                 index === 1 ? profile.cover_image_url_2 : 
                                 profile.cover_image_url_3;
                const isUploading = uploadingCoverIndex === index;
                const inputId = `cover-image-upload-${index}`;
                
                return (
                  <div key={index} className="relative">
                    {coverUrl ? (
                      <div className="relative aspect-[4/5] rounded-xl overflow-hidden border group">
                        <img 
                          src={coverUrl} 
                          alt={`Cover ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Label 
                            htmlFor={inputId} 
                            className="px-3 py-1.5 bg-white text-foreground rounded-lg cursor-pointer hover:bg-white/90 text-sm font-medium"
                          >
                            {isUploading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Change"
                            )}
                          </Label>
                          {index > 0 && (
                            <button
                              onClick={() => removeCoverImage(index)}
                              className="px-3 py-1.5 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 text-sm font-medium"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="absolute top-2 left-2">
                          <Badge variant={index === 0 ? "default" : "secondary"} className="text-xs">
                            {index === 0 ? "Required" : "Optional"}
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <Label 
                        htmlFor={inputId} 
                        className="flex flex-col items-center justify-center aspect-[4/5] rounded-xl border-2 border-dashed border-muted-foreground/30 cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                      >
                        {isUploading ? (
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        ) : (
                          <>
                            <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-sm text-muted-foreground font-medium text-center px-2">
                              {index === 0 ? "Add Cover Image" : `Add Photo ${index + 1}`}
                            </span>
                            <Badge variant={index === 0 ? "default" : "outline"} className="mt-2 text-xs">
                              {index === 0 ? "Required" : "Optional"}
                            </Badge>
                          </>
                        )}
                      </Label>
                    )}
                    <Input
                      id={inputId}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleCoverImageUpload(e, index)}
                      disabled={isUploading}
                    />
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Recommended: Portrait orientation (4:5 ratio). Max 5MB per image.
            </p>
          </div>

          {/* Portfolio Gallery Section - Embedded */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Images className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Portfolio Gallery</h3>
              <span className="text-xs text-muted-foreground ml-auto">Appears on your profile page</span>
            </div>
            <PortfolioUploadSection creatorProfileId={profile.id} compact />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Update your profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name *</Label>
            <Input
              id="display_name"
              value={profile.display_name}
              onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
              placeholder="Your display name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              rows={4}
            />
            <AiBioSuggestions
              text={profile.bio}
              onSelect={(text) => setProfile({ ...profile, bio: text })}
              minLength={20}
              type="bio"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
          <CardDescription>Where are you based?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={profile.location_city}
                onChange={(e) => setProfile({ ...profile, location_city: e.target.value })}
                placeholder="e.g. Los Angeles"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={profile.location_state}
                onChange={(e) => setProfile({ ...profile, location_state: e.target.value })}
                placeholder="e.g. California"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={profile.location_country}
                onChange={(e) => setProfile({ ...profile, location_country: e.target.value })}
                placeholder="e.g. United States"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Select the categories that best describe your content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_CATEGORIES.map((category) => (
              <Badge
                key={category}
                variant={profile.categories.includes(category) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleCategory(category)}
              >
                {profile.categories.includes(category) && (
                  <X className="h-3 w-3 mr-1" />
                )}
                {category}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Demographics Card */}
      <Card>
        <CardHeader>
          <CardTitle>Demographics</CardTitle>
          <CardDescription>Optional info that helps brands find you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birth_date">Date of Birth</Label>
              <Input
                id="birth_date"
                type="date"
                value={profile.birth_date}
                onChange={(e) => setProfile({ ...profile, birth_date: e.target.value })}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="">Select gender</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ethnicity">Ethnicity</Label>
              <select
                id="ethnicity"
                value={profile.ethnicity}
                onChange={(e) => setProfile({ ...profile, ethnicity: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="">Select ethnicity</option>
                {ETHNICITIES.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="primary_language">Primary Language</Label>
              <select
                id="primary_language"
                value={profile.primary_language}
                onChange={(e) => setProfile({ ...profile, primary_language: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Secondary Languages</Label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.filter(l => l !== profile.primary_language).map((lang) => (
                <Badge
                  key={lang}
                  variant={profile.secondary_languages.includes(lang) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    if (profile.secondary_languages.includes(lang)) {
                      setProfile({ 
                        ...profile, 
                        secondary_languages: profile.secondary_languages.filter(l => l !== lang) 
                      });
                    } else {
                      setProfile({ 
                        ...profile, 
                        secondary_languages: [...profile.secondary_languages, lang] 
                      });
                    }
                  }}
                >
                  {profile.secondary_languages.includes(lang) && (
                    <X className="h-3 w-3 mr-1" />
                  )}
                  {lang}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <SocialAccountsSection creatorProfileId={profile.id} />

      <div className="flex justify-end">
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
  );
};

export default ProfileTab;